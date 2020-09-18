const moment = require('moment-timezone')
const constants = require('./constants')
const getUnionid = require('./utils/getUnionid')

let prizeRedemptionLogId = ''
let lockedFlag = false
let locked = 0
let lotteryLog = null

let redemptionQuantity = 1

/**
 * 回滚，将 prize_redemption_log 的 locked - 1
 */
async function redemptionLogLockedRollback() {
  if (!lockedFlag) return null
  const logTableId = constants.BAAS_TABLE_ID.redemption_log_lottery
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
      prize: {
        ...lotteryLog.prize,
        code: '',
      },
    })
    return record2.update()
  }
  return res
}

function prizeInventoryRollback(prizeId) {
  let tableId = constants.BAAS_TABLE_ID.prize
  const PrizeTable = new BaaS.TableObject(tableId)
  const record = PrizeTable.getWithoutData(prizeId)
  record.incrementBy('redeemed_count', -1 * redemptionQuantity)
  return record.update().catch(err => {
    console.log('error: 库存回滚时出错', err)
    throw err
  })
}

function getPrize(prizeId) {
  let tableId = constants.BAAS_TABLE_ID.prize
  const PrizeTable = new BaaS.TableObject(tableId)
  return PrizeTable.get(prizeId)
    .then(res => res.data)
    .catch(err => {
      console.log('error: 获取奖品数据时出错', err)
      throw err
    })
}

function canPrizeBeRedeemed(prizeId) {
  let tableId = constants.BAAS_TABLE_ID.prize
  const PrizeTable = new BaaS.TableObject(tableId)
  const record = PrizeTable.getWithoutData(prizeId)
  record.incrementBy('redeemed_count', 1 * redemptionQuantity)
  return record
    .update()
    .then(res => {
      if (res.data.redeemed_count > res.data.total_count) {
        return prizeInventoryRollback(prizeId).then(() => {
          throw new Error('该奖品已无库存，无法兑换')
        })
      }
      return res.data
    })
    .catch(err => {
      console.log('error: 判断奖品是否能兑换时出错', err)
      throw err
    })
}

/**
 * 检查兑换码的唯一性
 */
function checkCodeUniqueness(code) {
  let tableId = constants.BAAS_TABLE_ID.prize_redemption_log
  const LogTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  query.compare('redemption_code', '=', code)
  return LogTable.setQuery(query)
    .count()
    .then(count => count === 0)
    .catch(err => {
      console.log('检查 redemption_code 唯一性时出错: ', err)
      throw err
    })
}

/**
 * 生成 redemption_code
 */
let remainingRetriesNumber = 15
function genRedemptionCode() {
  let code = Math.random()
    .toString()
    .slice(2, 18)
  return checkCodeUniqueness(code).then(isUnique => {
    if (isUnique) {
      return code
    } else if (remainingRetriesNumber > 0) {
      remainingRetriesNumber--
      return genRedemptionCode()
    } else {
      throw new Error('兑换记录过多，兑换码位数不足')
    }
  })
}

function createLog(prize, userId) {
  let tableId = constants.BAAS_TABLE_ID.prize_redemption_log
  const LogTable = new BaaS.TableObject(tableId)
  const record = LogTable.create()

  return genRedemptionCode()
    .then(code => {
      const params = {
        prize_id: prize.id,
        prize: {
          name: prize.name,
          english_name: prize.english_name,
          id: prize.id,
          images: prize.images,
          price: prize.price,
          currency: prize.currency,
          type: prize.type,
          cover: prize.cover,
        },
        english_name: prize.english_name,
        redemption_code: code,
        type: prize.type,
        created_by: userId,
      }

      if (prizeRedemptionLogId) params.prize_redemption_log_id = prizeRedemptionLogId
      if (prize.type === 'promotional_bundle') {
        params.status = 'redeemed'
        params.redeemed_at = moment().unix()
        params.redemption_quantity = redemptionQuantity
      }

      record.set(params)
      return record.save()
    })
    .then(async res => {
      if (!!prizeRedemptionLogId && lockedFlag) {
        const logTableId = constants.BAAS_TABLE_ID.redemption_log_lottery
        const LogTable = new BaaS.TableObject(logTableId)
        const record = LogTable.getWithoutData(prizeRedemptionLogId)
        record.set({
          prize: {
            ...lotteryLog.prize,
            code: res.data.id,
          },
        })
        await record.update()
      }
      return res
    })
    .then(res => res.data)
    .catch(err => {
      console.log('error: 生成兑换记录时出错', err)
      return prizeInventoryRollback(prize.id).then(() => {
        throw err
      })
    })
}

function calcRedeemedPrizeCount(days, prizeId, userId) {
  const logTableId = constants.BAAS_TABLE_ID.prize_redemption_log
  const LogTable = new BaaS.TableObject(logTableId)
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
    new BaaS.Query().compare('status', '=', constants.REDEMPTION_LOG_STATUS.PENDING),
    new BaaS.Query().compare('status', '=', constants.REDEMPTION_LOG_STATUS.REDEEMED)
  )
  const queryDateAndUserId = new BaaS.Query()
  queryDateAndUserId.compare('created_at', '>', date)
  queryDateAndUserId.compare('created_by', '=', userId)
  queryDateAndUserId.compare('prize_id', '=', prizeId)
  const query = BaaS.Query.and(queryStatus, queryDateAndUserId)
  return LogTable.setQuery(query)
    .count()
    .catch(err => {
      console.log('统计已兑换礼品数量时出错', err)
      throw err
    })
}

function canUserRedeemPromotionalBundle(userId, prizeId) {
  const logTableId = constants.BAAS_TABLE_ID.prize_redemption_log
  const LogTable = new BaaS.TableObject(logTableId)
  const query = new BaaS.Query()
  query.compare('created_by', '=', userId)
  query.compare('prize_id', '=', prizeId)
  return LogTable.setQuery(query)
    .count()
    .then(count => count === 0)
    .catch(err => {
      console.log('判断用户是否可以兑换优惠大礼包时出错', err)
      throw err
    })
}

function calcRedeemPromotionalBundleQuantity(userId) {
  const logTableId = constants.BAAS_TABLE_ID.order
  const LogTable = new BaaS.TableObject(logTableId)
  const query = new BaaS.Query()
  query.compare('created_by', '=', userId)
  query.compare('status', '=', constants.ORDER_STATUS.PAID)
  return LogTable.setQuery(query).limit(100).offset(0).find()
    .then(res => {
      if (res.data.objects.length === 0) {
        throw new Error('在小程序购票后即可领取新人大礼')
      } else {
        redemptionQuantity = res.data.objects.reduce(
          (acc, cur) => acc + cur.tickets.length,
          0
        )
        return null
      }
    })
    .catch(err => {
      console.log('计算可兑换新人大礼份数时出错', err)
      throw err
    })
}

function canUserRedeemPrize(userId, prizeId) {
  let prize
  return Promise.all([getPrize(prizeId).catch(err => err)])
    .then(res => {
      prize = res[0]
      if (Error.prototype.isPrototypeOf(prize)) {
        throw res[0]
      }
      if (prize.type === constants.PRIZE_TYPE.PROMOTIONAL_BUNDLE) {
        return canUserRedeemPromotionalBundle(userId, prizeId).then(result => {
          if (!result) {
            throw new Error('你已经兑换过优惠大礼包，无法再次兑换')
          } else {
            return calcRedeemPromotionalBundleQuantity(userId)
          }
        })
      } else {
        throw new Error('奖品兑换失败')
      }
    })
    .then(() => {
      const redeemLimitation = prize.redeem_limitation
      if (isNaN(redeemLimitation.day) || isNaN(redeemLimitation.count)) {
        // 判断是否没有设置购票限制
        return null
      }
      return calcRedeemedPrizeCount(redeemLimitation, prizeId, userId).then(count => {
        if (count + 1 > redeemLimitation.count) {
          throw new Error(`“${prize.name}”已超出兑换限制`)
        }
      })
    })
    .catch(err => {
      console.log('判断用户是否能兑换礼品时出错', err)
      throw err
    })
}

async function canUserRedeemPrizeByLottery(userId, prizeId) {
  try {
    // 检查购买数量限制
    const prize = await getPrize(prizeId)
    const redeemLimitation = prize.redeem_limitation
    if (!isNaN(redeemLimitation.day) && !isNaN(redeemLimitation.count)) {
      const count = await calcRedeemedPrizeCount(redeemLimitation, prizeId, userId)
      if (count + 1 > redeemLimitation.count) {
        throw new Error(`“${prize.name}”已超出兑换限制`)
      }
    }

    // 锁记录
    const date = moment().unix()
    const logTableId = constants.BAAS_TABLE_ID.redemption_log_lottery
    const LogTable = new BaaS.TableObject(logTableId)
    const record = LogTable.getWithoutData(prizeRedemptionLogId)
    record.incrementBy('locked', 1)
    const res = await record.update()
    if (res.status !== 200) {
      throw new Error('检查奖品兑换记录出错')
    }
    lockedFlag = true
    locked = res.data.locked
    lotteryLog = res.data
    if (locked !== 1) {
      throw new Error('该优惠券已使用或已过期')
    }
    if (res.data.prize.related_prize.id !== prizeId) {
      throw new Error('优惠券商品与所购商品不一致')
    }
    const unionid = await getUnionid(userId)
    if (res.data.unionid !== unionid) {
      throw new Error('查无此优惠券')
    }

    const record2 = LogTable.getWithoutData(prizeRedemptionLogId)
    record2.set({
      status: 'redeemed',
      used_at: date,
    })
    await record2.update()

    return null
  } catch (err) {
    console.log('判断用户是否能兑换抽奖礼品时出错出错', err)
    throw err
  }
}

module.exports = function(event, callback) {
  let {prizeId} = event.data

  if (event.data.prize_redemption_log_id) prizeRedemptionLogId = event.data.prize_redemption_log_id

  const userId = event.request.user.id

  const checking = prizeRedemptionLogId ? canUserRedeemPrizeByLottery : canUserRedeemPrize
  checking(userId, prizeId)
    .then(() => getPrize(prizeId))
    .then(prize => canPrizeBeRedeemed(prizeId))
    .then(prize => createLog(prize, userId))
    .then(log => {
      callback(null, {
        message: 'success',
        log,
      })
    })
    .catch(err => {
      if (!prizeRedemptionLogId) {
        callback(err)
      } else {
        redemptionLogLockedRollback()
          .then(() => {
            callback(err)
          })
          .catch(error => {
            console.log('error: 抽奖优惠券回滚时错误', error)
            callback('奖品兑换失败')
          })
      }
    })
}
