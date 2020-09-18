import {BAAS_SCHEMA_ID, PRIZE_TYPE} from '../config/constants'

export default {
  /**
   * 获取奖品兑换记录列表
   */
  fetchPrizeRedemptionLog(offset = 0, limit = 20) {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const query = new wx.BaaS.Query()
    return Log.setQuery(query)
      .orderBy('-created_at')
      .offset(offset)
      .limit(limit)
      .find()
  },

  fetchNormalAndPromotionalBundlePrizeLog(offset = 0, limit = 20) {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const query1 = wx.BaaS.Query.or(
      new wx.BaaS.Query().notExists('prize_redemption_log_id'),
      new wx.BaaS.Query().isNull('prize_redemption_log_id'),
    )
    const query2 = wx.BaaS.Query.and(
      query1,
      new wx.BaaS.Query().compare('type', '=', PRIZE_TYPE.NORMAL)
    )
    const queryOr = wx.BaaS.Query.or(
      query2,
      new wx.BaaS.Query().compare('type', '=', PRIZE_TYPE.PROMOTIONAL_BUNDLE)
    )
    return Log.setQuery(queryOr)
      .orderBy(['-type', '-created_at'])
      .offset(offset)
      .limit(limit)
      .find()
  },

  fetchPromotionalBundlePrizeLog(offset = 0, limit = 20) {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const query = new wx.BaaS.Query().compare('type', '=', PRIZE_TYPE.PROMOTIONAL_BUNDLE)
    return Log.setQuery(query)
      .orderBy(['-type', '-created_at'])
      .offset(offset)
      .limit(limit)
      .find()
  },

  fetchAreaLimitPrizeLog(offset = 0, limit = 20) {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const query = new wx.BaaS.Query()
    query.compare('type', '=', PRIZE_TYPE.AREA_LIMIT)
    return Log.setQuery(query)
      .orderBy(['-type', '-created_at'])
      .offset(offset)
      .limit(limit)
      .find()
  },

  checkPromotionalBundleRedeemed() {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    const query = new wx.BaaS.Query()
    query.compare('type', '=', PRIZE_TYPE.PROMOTIONAL_BUNDLE)
    return Log.setQuery(query)
      .count()
      .then(count => count > 0)
  },

  getPrizeRedemptionLog(id) {
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log)
    return Log.get(id).then(res => res.data)
  },
}
