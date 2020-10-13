import { BAAS_SCHEMA_ID } from '../config/constants'

export default {
  getBannerList() {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.banner)
    const query = new wx.BaaS.Query()
    query.compare('is_display', '=', true)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('serial_number')
      .find()
  },
  getProgramList() {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.program)
    const query = new wx.BaaS.Query()
    query.compare('is_display', '=', true)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('serial_number')
      .find()
  },
  getMerchantList(params) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant)
    const query = new wx.BaaS.Query()
    query.compare('status', '=', 1)
    const query2 = new wx.BaaS.Query()
    if (params.name) {
      query2.contains('name', params.name)
    }
    let andQuery = wx.BaaS.Query.and(query, query2)
    return getTable()
      .setQuery(andQuery)
      .expand(['merchant_type_id'])
      .limit(1000)
      .find()
  }
}
