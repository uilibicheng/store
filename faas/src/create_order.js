const moment = require('moment-timezone')
const findOne = require('./utils/findOne')
const constants = require('./constants')
const isNotExpandedPointer = require('./utils/isNotExpandedPointer')
const isMobilePhone = require('validator/lib/isMobilePhone').default
const getUnionid = require('./utils/getUnionid')
let ticket_bundle = null
let lockedTickets = []
let orderData = null

let prizeRedemptionLogId = ''
let utmSource = ''
let utmMedium = ''

let complimentaryTicketPrice = 0
let lockedFlag = false
let locked = 0

/**
 * ticket 解锁
 */
function unlockTicketInventory(ids, offset = 0, limit = 500) {
  let tableId = constants.BAAS_TABLE_ID.ticket_inventory
  const TicketInventoryTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  query.in('id', ids)
  const records = TicketInventoryTable.limit(limit)
    .offset(offset)
    .getWithoutData(query)
  records.set('sold', 0)
  return records.update()
}

/**
 * 回滚，将所有已锁定的 ticket 都设为未出售
 */
function ticketStatusRollback(tickets) {
  const ids = tickets.map(item => item.id)
  const limit = 500
  return unlockTicketInventory(ids, 0, limit)
    .then(res => {
      if (res.data.next !== null) {
        return unlockTicketInventory(ids, res.data.offset + limit, limit)
      }
    })
    .catch(err => {
      console.log('error: 批量回滚已锁定门票时出错', err)
      throw err
    })
}

/**
 * 回滚，将 prize_redemption_log 的 locked - 1
 */
async function redemptionLogLockedRollback() {
  if (!lockedFlag) return null
  const logTableId =
    utmSource === constants.TICKET_UTM_SOURCE.ASSISTANCE
      ? constants.BAAS_TABLE_ID.redemption_log_assistance
      : constants.BAAS_TABLE_ID.redemption_log_lottery
  const LogTable = new BaaS.TableObject(logTableId)
  const record = LogTable.getWithoutData(prizeRedemptionLogId)
  const record2 = LogTable.getWithoutData(prizeRedemptionLogId)
  record.incrementBy('locked', -1)
  // 20190425 云函数 SDK 重复 set/incrementBy 会被覆盖，所以原子性操作要和 set 其他数据分别 update..
  const res = await record.update()
  if (locked === 1) {
    record2.set({
      status: 'initial',
      used_at: null,
    })
    return record2.update()
  }
  return res
}

/**
 * 检查 tickets 参数是否合法
 */
function validateTickets(obj) {
  if (!Array.isArray(obj)) {
    throw new Error('tickets 参数错误')
  }
  obj.forEach(item => {
    if (isNaN(item.count) || typeof item.sku !== 'string') {
      throw new Error('参数错误')
    }
    if (item.count << 0 !== item.count || item.count <= 0) {
      throw new Error('参数错误, count 必须是大于 0 的整数')
    }
  })
}

/**
 * 删除订单
 */
function deleteOrder(orderId) {
  const tableId = constants.BAAS_TABLE_ID.order
  const OrderTable = new BaaS.TableObject(tableId)
  return Promise.all([ticketStatusRollback(lockedTickets), OrderTable.delete(orderId), redemptionLogLockedRollback()])
}

/**
 * 获取门票产品详情
 */
function getTicket(sku) {
  const ticketTableId = constants.BAAS_TABLE_ID.ticket
  const TicketTable = new BaaS.TableObject(ticketTableId)
  const query = new BaaS.Query()
  query.compare('sku', '=', sku)
  return findOne(TicketTable, query)
}

/**
 * 计算已购买门票数量
 */
function calcPurchasedTicketCount(days, sku, userId) {
  try {
    const orderTableId = constants.BAAS_TABLE_ID.order
    const OrderTable = new BaaS.TableObject(orderTableId)
    const date =
      new Date(
        moment
          .tz(constants.TIMEZONE)
          .hour(0)
          .minute(0)
          .second(0)
          .subtract(Math.max(days - 1, 0), 'days')
          .format()
      ).getTime() / 1000
    const queryStatus = BaaS.Query.or(
      new BaaS.Query().compare('status', '=', constants.ORDER_STATUS.NOT_PAID),
      new BaaS.Query().compare('status', '=', constants.ORDER_STATUS.PAID)
    )
    const queryDateAndSku = new BaaS.Query()
    queryDateAndSku.compare('created_at', '>', date)
    queryDateAndSku.compare('created_by', '=', userId)
    queryDateAndSku.in('ticket_skus', [sku])
    const query = BaaS.Query.and(queryStatus, queryDateAndSku)
    return OrderTable.limit(1000)
      .offset(0)
      .setQuery(query)
      .select(['ticket_skus'])
      .find()
      .then(res => {
        const result = res.data.objects.reduce((list, item) => {
          const skus = item.ticket_skus.filter(ticket_sku => ticket_sku === sku)
          list = list.concat(skus)
          return list
        }, [])
        return result.length
      })
  } catch (err) {
    console.log('统计已购买门票时出错', err)
    throw err
  }
}

/**
 * 检查门票属性
 */
async function checkTicketsProperties(tickets, userId) {
  try {
    const {PRIZE_BUY_ONE_GET_ONE_FREE, COMPLIMENTARY, SHARE_DISCOUNT} = constants.SPECIAL_TICKET_TYPE
    const {SHARE, ASSISTANCE, LOTTERY} = constants.TICKET_UTM_SOURCE
    const paramsErr = new Error('购票来源参数错误')

    if (!ticket_bundle) throw new Error('门票信息错误')
    if (!ticket_bundle.is_discount) return tickets
    if (!utmSource) throw paramsErr
    if (ticket_bundle.special_ticket_type === SHARE_DISCOUNT) {
      if (utmSource === SHARE) return tickets
      else throw paramsErr
    }
    if (utmSource !== ASSISTANCE && utmSource !== LOTTERY) throw paramsErr
    if (!utmMedium || !prizeRedemptionLogId) {
      throw paramsErr
    }

    // 检查付费票里是否有比这张赠送票更贵或同价的，否则报错
    if (ticket_bundle.special_ticket_type === PRIZE_BUY_ONE_GET_ONE_FREE) {
      let highestPrice = 0
      tickets.forEach(item => {
        if (item.bundle_special_ticket_type === PRIZE_BUY_ONE_GET_ONE_FREE) {
          if (item.price > highestPrice) highestPrice = item.price
        }
        if (item.bundle_special_ticket_type === COMPLIMENTARY) {
          if (complimentaryTicketPrice !== 0) throw new Error('只能选择一张赠送票')
          complimentaryTicketPrice = item.price
        }
      })
      if (highestPrice < complimentaryTicketPrice) {
        throw new Error('只能选择一张价值不高于已选择门票单价的赠送票')
      }
    }

    // 锁记录 (购买「买一送一票」但是不选择「赠送票」则不锁)
    if (ticket_bundle.special_ticket_type !== PRIZE_BUY_ONE_GET_ONE_FREE || complimentaryTicketPrice !== 0) {
      const logTableId =
        utmSource === constants.TICKET_UTM_SOURCE.ASSISTANCE
          ? constants.BAAS_TABLE_ID.redemption_log_assistance
          : constants.BAAS_TABLE_ID.redemption_log_lottery
      const LogTable = new BaaS.TableObject(logTableId)
      const record = LogTable.getWithoutData(prizeRedemptionLogId)
      record.incrementBy('locked', 1)
      const res = await record.update()
      if (res.status !== 200) {
        throw new Error('检查奖品兑换记录出错')
      }
      lockedFlag = true
      locked = res.data.locked
      if (locked !== 1) {
        throw new Error('该优惠券已使用或已过期')
      }
      if (res.data.prize.related_prize.id !== ticket_bundle.id) {
        throw new Error('优惠券商品与所购商品不一致')
      }
      const unionid = await getUnionid(userId)
      if (res.data.unionid !== unionid) {
        throw new Error('查无此优惠券')
      }

      const date = moment().unix()
      const record2 = LogTable.getWithoutData(prizeRedemptionLogId)
      record2.set({
        status: 'used',
        used_at: date,
      })
      await record2.update()
    }

    return tickets
  } catch (err) {
    console.log('error: 检查门票属性时出错', err)
    throw err
  }
}

/**
 * 检查是否超出购票限制
 */
function canUserBuyTicket(sku, count, userId) {
  return getTicket(sku)
    .then(ticket => {
      const purchaseLimitation = ticket.purchase_limitation
      if (isNaN(purchaseLimitation.day) || isNaN(purchaseLimitation.count)) {
        // 判断是否没有设置购票限制
        return null
      }
      return calcPurchasedTicketCount(purchaseLimitation.day, sku, userId).then(ticketCount => {
        if (ticketCount + count > purchaseLimitation.count) {
          throw new Error(`门票“${ticket.name}”已超出购买限制`)
        }
      })
    })
    .catch(err => {
      console.log('判断用户是否能购买门票时出错', err)
      throw err
    })
}

/**
 * 获取门票名称
 */
function getTicketName(sku) {
  const ticketTableId = constants.BAAS_TABLE_ID.ticket
  const TicketTable = new BaaS.TableObject(ticketTableId)
  const query = new BaaS.Query()
  query.compare('sku', '=', sku)
  return findOne(TicketTable, query)
    .then(ticket => ticket.name)
    .catch(err => {
      console.log('获取门票名称时出错', err)
      throw err
    })
}

/**
 * 通过 sku 与数量选择可出售的门票
 */
function chooseUnsoldTicketsBySkuAndCount(sku, reservationDate, count, userId) {
  let choseTickets = []
  return canUserBuyTicket(sku, count, userId)
    .then(() => chooseAndLockTickets(sku, reservationDate, count))
    .then(({remain, availableTickets}) => {
      choseTickets = choseTickets.concat(availableTickets)
      if (choseTickets.length < count) {
        if (remain < count - choseTickets.length) {
          lockedTickets = lockedTickets.concat(choseTickets) // 加入 lockedTickets，之后会执行状态回滚
          return getTicketName(sku).then(name => {
            throw new Error(`“${name}” 余票不足`)
          })
        } else {
          return chooseAndLockTickets(sku, reservationDate, count - choseTickets.length)
        }
      } else {
        lockedTickets = lockedTickets.concat(choseTickets)
        return choseTickets
      }
    })
    .catch(err => {
      console.log('选择 tickets 时出错: ', err)
      throw err
    })
}

/**
 * 检查门票信息的完整性
 */
function checkTicketInformationIntegrity(ticket) {
  const bundleDataNotFound = isNotExpandedPointer(ticket.bundle)
  const ticketDataNotFound = isNotExpandedPointer(ticket.ticket)
  const typeDataNotFound = isNotExpandedPointer(ticket.type)
  if (bundleDataNotFound || ticketDataNotFound || typeDataNotFound) {
    console.log(bundleDataNotFound ? '套票信息未找到' : ticketDataNotFound ? '门票信息未找到' : '票种信息未找到')
    return false
  }
  if (
    ticket.ticket.price === null ||
    ticket.ticket.price === undefined ||
    (ticket.ticket.is_discount && ticket.ticket.discount_price === null) ||
    (ticket.ticket.is_discount && ticket.ticket.discount_price === undefined)
  ) {
    console.log('未找到价格信息')
    return false
  }
  return true
}

/**
 * 通过批量更新锁定可以出售的门票
 */
function chooseAndLockTickets(sku, reservationDate, count) {
  let remain = 0
  let tableId = constants.BAAS_TABLE_ID.ticket_inventory
  const TicketInventoryTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  query.compare('sku', '=', sku)
  query.compare('sold', '=', 0)
  query.compare('is_deleted', '=', false)
  query.compare('expires_at', '>', reservationDate)
  query.compare('generated_at', '<', reservationDate)
  const records = TicketInventoryTable.offset(0)
    .limit(count)
    .getWithoutData(query)
  records.incrementBy('sold', 1)
  return records
    .update()
    .then(res => {
      const result = res.data
      remain = result.total_count - result.limit
      const succeedIds = result.operation_result.reduce((list, item) => {
        if (!!item.success && !!item.success.id) {
          list.push(item.success.id)
        }
        return list
      }, [])
      return succeedIds
    })
    .then(succeedIds => {
      const query = new BaaS.Query()
      query.in('id', succeedIds)
      return TicketInventoryTable.expand(['bundle', 'ticket', 'type'])
        .setQuery(query)
        .limit(count)
        .find()
        .then(res => res.data.objects)
        .catch(err => {
          console.log('获取 tickets 信息时出错: ', err)
          throw err
        })
    })
    .then(tickets => {
      const availableTickets = tickets.reduce((result, item) => {
        if (!checkTicketInformationIntegrity(item)) {
          return result
        }
        if (item.sold === 1) {
          result.push(item)
        }
        return result
      }, [])
      return {remain, availableTickets}
    })
    .catch(err => {
      console.log('获取可用 tickets 时出错: ', err)
      throw err
    })
}

/**
 * 检查 order_id 的唯一性
 */
function checkOrderIdUniqueness(orderId) {
  const tableId = constants.BAAS_TABLE_ID.order
  const OrderTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  query.compare('order_id', '=', orderId)
  return OrderTable.setQuery(query)
    .count()
    .then(count => count === 0)
    .catch(err => {
      console.log('检查 order_id 唯一性时出错: ', err)
      throw err
    })
}

/**
 * 生成 order_id
 */
let remainingRetriesNumber = 15
function genOrderId() {
  let orderId = Math.random()
    .toString()
    .slice(2, 14)
  return checkOrderIdUniqueness(orderId).then(isUnique => {
    if (isUnique) {
      return orderId
    } else if (remainingRetriesNumber > 0) {
      remainingRetriesNumber--
      return genOrderId()
    } else {
      throw new Error('订单过多，订单号位数不足')
    }
  })
}

/**
 * 生成订单
 */
function createOrderRecord(tickets, reservationDate, name, phone, userId) {
  try {
    const {PRIZE_BUY_ONE_GET_ONE_FREE, COMPLIMENTARY} = constants.SPECIAL_TICKET_TYPE
    const tableId = constants.BAAS_TABLE_ID.order
    const OrderTable = new BaaS.TableObject(tableId)
    const ticket_ids = []
    const ticket_skus = []
    const amount = tickets.reduce((total, item) => {
      ticket_ids.push(item.id)
      ticket_skus.push(item.sku)
      let price = 0
      if (item.bundle_special_ticket_type !== COMPLIMENTARY) {
        price =
          item.is_discount && item.discount_price !== null && item.discount_price !== undefined
            ? item.discount_price
            : item.price
      }
      total = total + price
      return Math.round(total * 100) / 100
    }, 0)
    const order = OrderTable.create()
    const tickets_with_barcode = tickets
    const tickets_barcode_list = tickets.map(ticket => ticket.barcode)
    const order_numbers = tickets.map(ticket => ticket.order_number)
    const accesso_product_ids = tickets.map(ticket => ticket.accesso_product_id)

    tickets = tickets.map(ticket => {
      const _ticket = {
        ...ticket,
      }
      delete _ticket.barcode
      return _ticket
    })

    return genOrderId()
      .then(orderId => {
        const record = {
          tickets,
          tickets_with_barcode,
          tickets_barcode_list,
          order_numbers,
          accesso_product_ids,
          order_id: orderId,
          ticket_ids,
          ticket_skus,
          amount,
          reservation_date: reservationDate,
          pickup_person: name,
          phone,
          // cover: ticket_bundle.cover_small,
          cover_in_details: ticket_bundle.cover_in_details,
          cover_order_list: ticket_bundle.cover_order_list,
          created_by: userId,
        }

        if (ticket_bundle.is_discount) {
          record.utm_source = utmSource
        }
        if (
          (ticket_bundle.is_discount && ticket_bundle.special_ticket_type !== PRIZE_BUY_ONE_GET_ONE_FREE) ||
          complimentaryTicketPrice !== 0
        ) {
          record.utm_medium = utmMedium
          record.prize_redemption_log_id = prizeRedemptionLogId
        }

        order.set(record)

        return order.save()
      })
      .then(res => {
        orderData = res.data
        return orderData
      })
      .catch(err => {
        console.log('创建订单时出错: ', err)
        return ticketStatusRollback(lockedTickets).then(() => {
          throw new Error('创建订单时出错')
        })
      })
  } catch (err) {
    console.log('error: 创建订单时出错', err)
    throw err
  }
}

/**
 * 将 order_id 关联到门票库存记录中
 */
function saveOrderIdToTicketInventory(order) {
  try {
    let tableId = constants.BAAS_TABLE_ID.ticket_inventory
    const TicketInventoryTable = new BaaS.TableObject(tableId)
    const query = new BaaS.Query()
    query.in('id', order.ticket_ids)
    const records = TicketInventoryTable.getWithoutData(query)
    records.set('order_id', order.order_id)
    return records.update()
  } catch (err) {
    console.log('error: 创建订单后，保存订单与门票的关联关系出错', err)
    throw err
  }
}

/**
 * 根据前端传过来的 tickets 信息，从库存中挑出合适的门票，并返回
 */
function chooseTickets(ticketsInfo, reservationDate, userId) {
  const {COMPLIMENTARY} = constants.SPECIAL_TICKET_TYPE
  return Promise.all(
    ticketsInfo.map(ticketInfo => {
      return checkTicketIsActive(ticketInfo.sku)
        .then(res => {
          return chooseUnsoldTicketsBySkuAndCount(ticketInfo.sku, reservationDate, ticketInfo.count, userId)
        })
        .catch(err => err) // 防止出现某个 promise 出现未 catch 的错误，导致程序立即返回，无法对其他 promise 中已成功锁定的票做状态回滚
    })
  )
    .then(tickets => {
      tickets.forEach(item => {
        if (Error.prototype.isPrototypeOf(item)) {
          throw item
        }
      })
      const selectedTickets = tickets
        .reduce((list, ticket) => {
          list = list.concat(ticket)
          return list
        }, [])
        .map(ticket => {
          if (!ticket_bundle && ticket.bundle.special_ticket_type !== COMPLIMENTARY) {
            ticket_bundle = ticket.bundle
          }
          return {
            bundle_name: ticket.bundle.name,
            bundle_english_name: ticket.bundle.english_name,
            ticket_type_name: ticket.type.name,
            ticket_type_english_name: ticket.type.english_name,
            ticket_name: ticket.ticket.name,
            sku: ticket.sku,
            id: ticket.id,
            generated_at: ticket.generated_at,
            expires_at: ticket.expires_at,
            price: ticket.ticket.price,
            currency: ticket.ticket.currency,
            barcode: ticket.barcode,
            order_number: ticket.order_number,
            accesso_product_id: ticket.bundle.accesso_product_id,
            package_name: ticket.package_name,
            origin_type: ticket.origin_type,
            is_discount: ticket.ticket.is_discount,
            discount_price: ticket.ticket.discount_price,
            bundle_is_discount: ticket.bundle.is_discount,
            bundle_special_ticket_type: ticket.bundle.special_ticket_type,
          }
        })
      return selectedTickets
    })
    .catch(err => {
      console.log('error: 从库存中选择门票时出错', err)
      throw err
    })
}

// 检查门票是否已下架
function checkTicketIsActive(sku) {
  try {
    let tableId = constants.BAAS_TABLE_ID.ticket
    const TicketTable = new BaaS.TableObject(tableId)
    const query = new BaaS.Query()
    query.compare('sku', '=', sku)
    return TicketTable.setQuery(query)
      .expand(['bundle'])
      .find()
      .then(res => {
        if (!res.data.objects.length) {
          throw new Error('门票未找到')
        }
        const ticket = res.data.objects[0]
        if (!ticket.is_active) {
          throw new Error(`${ticket.name}已下架`)
        }
        if (!ticket.bundle.is_active) {
          throw new Error('门票已下架')
        }
      })
  } catch (err) {
    console.log('error: 检查门票是否已下架时出错', err)
    throw err
  }
}

module.exports = function(event, callback) {
  let {tickets, reservationDate, name, phone, prize_redemption_log_id, utm_source, utm_medium} = event.data
  const userId = event.request.user.id
  if (!isMobilePhone(phone)) {
    callback('手机号码无效')
  }
  name = name.trim()
  if (name.length === 0 || name.length > 24) {
    callback('名字无效')
  }
  validateTickets(tickets)

  if (utm_source) utmSource = utm_source
  if (prize_redemption_log_id) prizeRedemptionLogId = prize_redemption_log_id
  if (utm_medium) utmMedium = utm_medium

  chooseTickets(tickets, reservationDate, userId)
    .then(tickets => checkTicketsProperties(tickets, userId))
    .then(tickets => createOrderRecord(tickets, reservationDate, name, phone, userId))
    .then(order => saveOrderIdToTicketInventory(order))
    .then(() => {
      delete orderData.tickets_barcode_list
      delete orderData.tickets_with_barcode
      callback(null, {
        message: 'success',
        order: orderData,
      })
    })
    .catch(err => {
      console.log(err)
      if (orderData) {
        deleteOrder(orderData.id)
          .then(() => {
            callback('创建订单失败, 订单删除成功')
          })
          .catch(err => {
            console.log('delateOrder 回滚失败')
            callback('创建订单失败')
          })
      } else {
        Promise.all([ticketStatusRollback(lockedTickets), redemptionLogLockedRollback()])
          .then(() => {
            callback(err)
          })
          .catch(err => {
            console.log('ticketStatusRollback & redemptionLogLockedRollback 回滚失败')
            callback('创建订单失败')
          })
      }
    })
}
