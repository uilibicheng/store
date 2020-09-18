// pages/purchase/purchase.js
import io from '../../io/index'
import {
  ROUTE,
  EXCHANGE_RATE,
  TICKET_ADD_COUNT_LIMITATION,
  REMOTE_FUNCTION,
  TIMEZONE,
  SPECIAL_TICKET_TYPE,
} from '../../config/constants'
import pay from '../../utils/pay'
import round from '../../utils/round'
import wxParser from '../../lib/wxParser/index'
import isMobilePhone from '../../lib/isMobilePhone'
import moment from '../../lib/moment-timezone.js'
const app = getApp()

Page({
  data: {
    ticketBundle: null,
    tickets: [],
    complimentaryTickets: [],
    ticketAddCountLimitation: TICKET_ADD_COUNT_LIMITATION,
    choseTickets: [],
    choseComplimentaryTickets: [],
    name: '',
    phone: '',
    reservationDate: '',
    alertMsg: '',
    showTicketPolicy: false,
    isInputtingName: false,
    isInputtingPhone: false,
    startDate: '',
    exchangeRate: EXCHANGE_RATE,
    complimentaryJudgment: {
      highestPrice: 0, // 当前已选择的最高价的父票价钱
      hasFreeSelected: false, // 是否已有选中的子票
    },
  },

  orderId: '',
  isCreatingOrder: false,

  onLoad(options) {
    this.options = options
    let url = `/${ROUTE.PURCHASE}?id=${options.id}&tickets=${options.tickets}`

    if (options.prize_redemption_log_id) url += `&prize_redemption_log_id=${options.prize_redemption_log_id}`
    if (options.utm_source) url += `&utm_source=${options.utm_source}`
    if (options.utm_medium) url += `&utm_medium=${options.utm_medium}`

    if (options.complimentaryTickets) url += `&complimentaryTickets=${options.complimentaryTickets}`

    app
      .auth(url)
      .then(this.dataInit)
      .catch(err => console.log(err))
    try {
      const tickets = JSON.parse(decodeURIComponent(options.tickets))
      this.setData({
        choseTickets: Array.isArray(tickets) ? tickets : [],
      })
      if (options.complimentaryTickets) {
        const complimentaryTickets = JSON.parse(decodeURIComponent(options.complimentaryTickets))
        this.setData({
          choseComplimentaryTickets: Array.isArray(complimentaryTickets) ? complimentaryTickets : [],
        })
      }
    } catch (e) {
      console.log(e)
    }

    this.setData({
      startDate: moment.tz(TIMEZONE).format('YYYY-MM-DD'),
    })
  },

  dataInit() {
    const id = this.options.id
    wx.showLoading({
      mask: true,
    })
    return Promise.all([this.getTicketBundle(id), this.fetchTicket(id)])
      .catch(err => console.log(err))
      .then(wx.hideLoading)
  },

  fetchTicket(bundleId, isComplimentary = false) {
    return io
      .fetchTicket(bundleId)
      .then(res => {
        const tickets = res.data.objects.map(item => {
          // item.price_rmb = item.price * EXCHANGE_RATE
          if (isComplimentary) {
            item.count = this.data.choseComplimentaryTickets.reduce((count, ticket) => {
              if (ticket.sku === item.sku) {
                count = ticket.count
              }
              return count
            }, 0)
          } else {
            item.count = this.data.choseTickets.reduce((count, ticket) => {
              if (ticket.sku === item.sku) {
                count = ticket.count
              }
              return count
            }, 0)
            item.total_price = this.calcTicketsPrice(item, item.count)
          }

          return item
        })
        if (isComplimentary) {
          this.setData({
            complimentaryTickets: tickets,
          })
          this.handleComplimentaryJudgment(this.data.tickets, tickets)
        } else {
          this.setData({
            tickets,
          })
        }
      })
      .catch(err => {
        console.log('获取门票列表时错误', err)
        throw err
      })
  },

  getTicketBundle(bundleId) {
    return io
      .getTicketBundle(bundleId)
      .then(res => {
        if (res.data.is_discount && res.data.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE) {
          this.fetchTicket(res.data.related_ticket_bundle, true)
        }
        this.setData({
          ticketBundle: res.data,
        })
        wxParser.parse({
          bind: 'ticketPolicy',
          html: res.data.ticket_policy,
          target: this,
          enablePreviewImage: false,
        })
      })
      .catch(err => {
        console.log('获取套票信息时错误', err)
        throw err
      })
  },

  calcTicketsPrice(ticket, count) {
    const price =
      ticket.is_discount && ticket.discount_price !== null && ticket.discount_price !== undefined
        ? ticket.discount_price
        : ticket.price
    return round(price * count, 2)
  },

  handleCountChange(e) {
    const sku = e.currentTarget.dataset.sku
    const type = e.currentTarget.dataset.type
    const tickets = this.data.tickets.map(ticket => {
      if (ticket.sku === sku) {
        if (type === 'add' && ticket.count < TICKET_ADD_COUNT_LIMITATION) {
          ticket.count += 1
          ticket.total_price = this.calcTicketsPrice(ticket, ticket.count)
        } else if (type === 'reduce' && ticket.count > 0) {
          ticket.count -= 1
          ticket.total_price = this.calcTicketsPrice(ticket, ticket.count)
        }
      }
      return ticket
    })
    this.setData({
      tickets,
    })
    if (
      this.data.ticketBundle.is_discount &&
      this.data.ticketBundle.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE
    ) {
      this.handleComplimentaryJudgment(tickets, this.data.complimentaryTickets)
    }
  },

  handleComplimentaryCountChange(e) {
    const sku = e.currentTarget.dataset.sku
    const type = e.currentTarget.dataset.type
    const complimentaryTickets = this.data.complimentaryTickets.map(ticket => {
      if (ticket.sku === sku) {
        if (type === 'add' && ticket.count < 1) {
          ticket.count += 1
        } else if (type === 'reduce' && ticket.count > 0) {
          ticket.count -= 1
        }
      }
      return ticket
    })
    this.setData({
      complimentaryTickets,
    })
    this.handleComplimentaryJudgment(this.data.tickets, complimentaryTickets)
  },

  handleComplimentaryJudgment(tickets, complimentaryTickets) {
    let highestPrice = 0
    tickets.forEach(ticket => {
      if (ticket.count > 0 && ticket.price > highestPrice) highestPrice = ticket.price
    })
    let hasFreeSelected = false
    for (let i = 0; i < complimentaryTickets.length; i++) {
      if (complimentaryTickets[i].count > 0 && complimentaryTickets[i].price > highestPrice) {
        complimentaryTickets[i].count = 0
        this.setData({
          complimentaryTickets,
        })
      } else if (complimentaryTickets[i].count > 0) {
        hasFreeSelected = true
      }
    }
    this.setData({
      complimentaryJudgment: {
        highestPrice,
        hasFreeSelected,
      },
    })
  },

  handleInputChange(e) {
    const label = e.currentTarget.dataset.label
    this.setData({
      [label]: e.detail.value,
    })
  },

  handlePickerChange(e) {
    this.setData({
      reservationDate: e.detail.value,
    })
  },

  canSubmit(tickets) {
    let message
    const name = this.data.name.trim()
    if (!this.data.reservationDate) {
      message = '请选择日期'
    } else if (tickets.length <= 0) {
      message = '请选择门票'
    } else if (!this.data.name) {
      message = '请输入取票人姓名'
    } else if (name.length === 0 || name.length > 24) {
      message = '请输入有效的姓名'
    } else if (!this.data.phone) {
      message = '请输入取票人电话号码'
    } else if (!isMobilePhone(this.data.phone)) {
      message = '手机号码格式填写错误！'
    } else {
      message = ''
    }
    this.setData({
      alertMsg: message,
    })
    return !message
  },

  handleSubmit() {
    let tickets = this.data.tickets.reduce((result, ticket) => {
      if (ticket.count > 0) {
        result.push({
          sku: ticket.sku,
          count: ticket.count,
        })
      }
      return result
    }, [])
    if (!this.canSubmit(tickets)) {
      return null
    }

    let complimentaryTickets = []
    if (
      this.data.ticketBundle.is_discount &&
      this.data.ticketBundle.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE
    ) {
      complimentaryTickets = this.data.complimentaryTickets.reduce((result, ticket) => {
        if (ticket.count > 0) {
          result.push({
            sku: ticket.sku,
            count: ticket.count,
          })
        }
        return result
      }, [])
      // if (complimentaryTickets.length <= 0) {
      //   this.setData({
      //     alertMsg: '请选择赠送门票',
      //   })
      //   return null
      // }
    }

    tickets = tickets.concat(complimentaryTickets)

    if (this.isCreatingOrder) {
      return null
    } else {
      this.isCreatingOrder = true
    }
    wx.showLoading({
      mask: true,
    })

    let params = {
      tickets,
      reservationDate: this.data.reservationDate,
      name: this.data.name.trim(),
      phone: this.data.phone,
    }
    if (this.options.prize_redemption_log_id) params.prize_redemption_log_id = this.options.prize_redemption_log_id
    if (this.options.utm_source) params.utm_source = this.options.utm_source
    if (this.options.utm_medium) params.utm_medium = this.options.utm_medium

    wx.BaaS.invokeFunction(REMOTE_FUNCTION.CREATE_ORDER, params)
      .then(res => {
        if (res.data && res.data.message === 'success') {
          this.orderId = res.data.order.id
          return pay(this.orderId, tickets, this.data.ticketBundle.name, res.data.order.amount)
        } else if (res.error && res.error.message) {
          this.setData({
            alertMsg: res.error.message,
          })
        }
      })
      .catch(err => {
        if (!/payment cancelled/.test(err.message)) {
          wx.BaaS.ErrorTracker.track(err)
        }
        console.log(err)
      })
      .then(() => {
        this.isCreatingOrder = false
        wx.hideLoading()
        if (this.orderId) {
          setTimeout(() => this.navToOrderDetail(this.orderId), 1000)
        }
      })
  },

  navToTicketPolicy(e) {
    const ticketBundleId = e.currentTarget.dataset.id
    wx.navigateTo({url: `/${ROUTE.TICKET_POLICY}?id=${ticketBundleId}`})
  },

  navToOrderDetail(orderId) {
    wx.redirectTo({url: `/${ROUTE.ORDER}?id=${orderId}`})
  },

  handleAlertConfirm() {
    this.setData({
      alertMsg: '',
    })
  },

  handleShowTicketPolicyAlert() {
    this.setData({
      showTicketPolicy: true,
    })
  },

  handleTicketPolicyAlertConfirm() {
    this.setData({
      showTicketPolicy: false,
    })
  },

  handleNameInput() {
    this.setData({
      isInputtingName: !this.data.isInputtingName,
    })
  },

  handlePhoneInput() {
    this.setData({
      isInputtingPhone: !this.data.isInputtingPhone,
    })
  },
})
