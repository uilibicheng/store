import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  /**
   * 获取默林游奖品记录
   */
  fetchPrizeRedemptionLogFromAssistance(offset = 0, limit = 10) {
    const UNIONID = wx.BaaS.storage.get('unionid')
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log_assistance)
    let query = new wx.BaaS.Query()
    const accountInfo = wx.getAccountInfoSync()
    query.compare('related_app', '=', accountInfo.miniProgram.appId)
    query.compare('unionid', '=', UNIONID)
    return Log.setQuery(query)
      .orderBy('-created_at')
      .offset(offset)
      .limit(limit)
      .find()
  },

  /**
   * 获取抽奖插件奖品记录
   */
  fetchPrizeRedemptionLogFromLottery(offset = 0, limit = 10) {
    const UNIONID = wx.BaaS.storage.get('unionid')
    const Log = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.prize_redemption_log_lottery)
    let query = new wx.BaaS.Query()
    const accountInfo = wx.getAccountInfoSync()
    query.compare('appid', '=', accountInfo.miniProgram.appId)
    query.compare('unionid', '=', UNIONID)
    query.compare('prize_type', '=', 'relate_to_app')
    return Log.setQuery(query)
      .orderBy('-created_at')
      .offset(offset)
      .limit(limit)
      .find()
  },
}
