import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  /**
   * 获取套票
   */
  getTicketBundle(id) {
    const TicketBundle = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.ticket_bundle)
    return TicketBundle.get(id)
  },

  /**
   * 获取套票列表
   */
  fetchTicketBundle(isDiscount = false, offset = 0, limit = 20) {
    const TicketBundle = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.ticket_bundle)
    const query = new wx.BaaS.Query()
    query.compare('is_discount', '=', isDiscount)
    if (isDiscount) {
      query.compare('special_ticket_type', '=', 'share_discount')
    }
    query.compare('is_active', '=', true)
    return TicketBundle.setQuery(query)
      .orderBy(['priority', '-created_at'])
      .limit(limit)
      .offset(offset)
      .find()
  },
}
