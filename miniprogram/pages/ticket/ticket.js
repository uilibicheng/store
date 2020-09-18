// pages/ticket/ticket.js
import io from '../../io/index'
import {
  ROUTE,
  EXCHANGE_RATE,
  TICKET_ADD_COUNT_LIMITATION,
  REMOTE_FUNCTION,
  SPECIAL_TICKET_TYPE,
} from '../../config/constants'
import wxParser from '../../lib/wxParser/index'
import round from '../../utils/round'
const app = getApp()

Page({
  data: {
    ticketBundle: null,
    tickets: [],
    complimentaryTickets: [],
    ticketAddCountLimitation: TICKET_ADD_COUNT_LIMITATION,
    isEmpty: false,
    isZero: true,
    alertMsg: '',
    exchangeRate: EXCHANGE_RATE,
    complimentaryJudgment: {
      highestPrice: 0, // 当前已选择的最高价的父票价钱
      hasFreeSelected: false, // 是否已有选中的子票
    },
  },

  onLoad(options) {
    this.options = options
    let url = `/${ROUTE.TICKET}?id=${options.id}`
    if (options.prize_redemption_log_id) url += `&prize_redemption_log_id=${options.prize_redemption_log_id}`
    if (options.utm_source) url += `&utm_source=${options.utm_source}`
    if (options.utm_medium) url += `&utm_medium=${options.utm_medium}`

    this.dataInit()
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
          item.price_rmb =
            item.is_discount && item.discount_price != null && item.discount_price != undefined
              ? round(item.discount_price * EXCHANGE_RATE, 2)
              : round(item.price * EXCHANGE_RATE, 2)
          item.count = 0
          return item
        })
        if (isComplimentary) {
          this.setData({
            complimentaryTickets: tickets,
          })
        } else {
          this.setData({
            tickets,
          })
        }
        this.handleFooterColor()
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
        wxParser.parse({
          bind: 'ticketDesc',
          html: res.data.description,
          target: this,
          enablePreviewImage: false,
        })
        this.setData({
          ticketBundle: res.data,
        })
      })
      .catch(err => {
        console.log('获取套票信息时错误', err)
        throw err
      })
  },

  handleCountChange(e) {
    const sku = e.currentTarget.dataset.sku
    const type = e.currentTarget.dataset.type
    const tickets = this.data.tickets.map(ticket => {
      if (ticket.sku === sku) {
        if (type === 'add' && ticket.count < TICKET_ADD_COUNT_LIMITATION) {
          ticket.count += 1
        } else if (type === 'reduce' && ticket.count > 0) {
          ticket.count -= 1
        }
      }
      return ticket
    })
    this.setData({
      tickets,
    })
    this.handleFooterColor()
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

  checkTicketCount() {
    const list = this.data.tickets
    for (let i = 0; i < list.length; i++) {
      if (list[i].count > 0) return true
    }
    return false
  },

  handleFooterColor() {
    this.setData({
      isZero: !this.checkTicketCount(),
    })
  },

  handleSubmit() {
    if (!this.checkTicketCount()) {
      this.setData({
        alertMsg: '请选择门票',
        isEmpty: true,
      })
      return
    }
    let tickets = this.data.tickets.reduce((result, ticket) => {
      if (ticket.count > 0) {
        result.push({
          sku: ticket.sku,
          count: ticket.count,
          name: ticket.name,
        })
      }
      return result
    }, [])
    let skuList = tickets.map(v => v.sku)

    let complimentaryTickets
    let complimentarySkuList
    if (this.data.ticketBundle.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE) {
      complimentaryTickets = this.data.complimentaryTickets.reduce((result, ticket) => {
        if (ticket.count > 0) {
          result.push({
            sku: ticket.sku,
            count: ticket.count,
            name: ticket.name,
          })
        }
        return result
      }, [])
      complimentarySkuList = complimentaryTickets.map(v => v.sku)
      skuList = skuList.concat(complimentarySkuList)
    }
    let soldOutNameList = []
    wx.showLoading({
      mask: true,
    })
    wx.BaaS.invokeFunction(REMOTE_FUNCTION.GET_TICKET_INVENTORY, {skuList})
      .then(res => {
        const {countList} = res.data
        tickets.forEach((v, i) => {
          if (v.count > countList[i]) {
            soldOutNameList.push(v.name)
          }
        })

        if (this.data.ticketBundle.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE) {
          complimentaryTickets.forEach((v, i) => {
            if (v.count > countList[i]) {
              soldOutNameList.push(v.name)
            }
          })
        }

        if (soldOutNameList.length) {
          this.setData({
            alertMsg: `${soldOutNameList[0]} 余票不足`,
            isEmpty: true,
          })
          wx.hideLoading()
        } else {
          wx.hideLoading()
          let url = `/${ROUTE.PURCHASE}?id=${this.data.ticketBundle.id}&tickets=${encodeURIComponent(
            JSON.stringify(tickets)
          )}`

          if (this.options.prize_redemption_log_id)
            url += `&prize_redemption_log_id=${this.options.prize_redemption_log_id}`
          if (this.options.utm_source) url += `&utm_source=${this.options.utm_source}`
          if (this.options.utm_medium) url += `&utm_medium=${this.options.utm_medium}`
          if (this.data.ticketBundle.special_ticket_type === SPECIAL_TICKET_TYPE.PRIZE_BUY_ONE_GET_ONE_FREE) {
            url += `&complimentaryTickets=${encodeURIComponent(JSON.stringify(complimentaryTickets))}`
          }

          wx.redirectTo({
            url,
          })
        }
      })
      .catch(err => {
        wx.hideLoading()
        throw new Error(err)
      })
  },

  closeModal() {
    this.setData({
      isEmpty: false,
    })
  },

  onShareAppMessage() {
    return {
      title: `日本乐高商店`,
      path: `/${ROUTE.TICKET}?id=${this.data.ticketBundle.id}`,
      imageUrl: this.data.ticketBundle.banner[0],
    }
  },
})
