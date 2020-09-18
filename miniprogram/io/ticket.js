import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  /**
   * 获取门票产品列表
   */
  fetchTicket(ticketBundleId, offset = 0, limit = 20) {
    const TicketBundle = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.ticket_bundle)
    const Ticket = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.ticket)
    const query = new wx.BaaS.Query()
    query.compare('bundle', '=', TicketBundle.getWithoutData(ticketBundleId))
    query.compare('is_active', '=', true)
    return Ticket.setQuery(query)
      .expand(['type'])
      .limit(limit)
      .offset(offset)
      .find()
  },
}
