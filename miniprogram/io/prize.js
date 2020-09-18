import {BAAS_SCHEMA_ID, TIMEZONE, REMOTE_FUNCTION, PRIZE_TYPE} from '../config/constants'
import moment from '../lib/moment-timezone.js'

export default {
  /**
   * 获取奖品列表
   */
  fetchPrize(type = PRIZE_TYPE.NORMAL, offset = 0, limit = 20) {
    const Prize = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize)
    const query = new wx.BaaS.Query()
    query.compare('type', '=', type)
    return Prize.setQuery(query)
      .orderBy(['priority', '-created_at'])
      .offset(offset)
      .limit(limit)
      .find()
  },

  getPrize(id) {
    const Prize = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize)
    return Prize.get(id).then(res => res.data)
  },

  redeemPrize(params) {
    return wx.BaaS.invokeFunction(REMOTE_FUNCTION.REDEEM_PRIZE, params).then(res => {
      if (res.data && res.data.message === 'success') {
        return {
          data: res.data.log,
        }
      } else if (res.error && res.error.message) {
        throw res.error
      }
    })
  },

  checkOverLimit(prizeId, limitation) {
    if (isNaN(limitation.day) || isNaN(limitation.count)) {
      return Promise.resolve(false)
    }
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const date =
      new Date(
        moment
          .tz(TIMEZONE)
          .hour(0)
          .minute(0)
          .second(0)
          .subtract(limitation.day, 'days')
          .format()
      ).getTime() / 1000
    const query = new wx.BaaS.Query()
    query.compare('prize_id', '=', prizeId)
    query.compare('status', '!=', 'closed')
    query.compare('created_at', '>', date)
    return Log.setQuery(query)
      .count()
      .then(count => count >= limitation.count)
  },
}
