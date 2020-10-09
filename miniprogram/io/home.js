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
  getMerchantList() {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant)
    const query = new wx.BaaS.Query()
    query.compare('status', '=', 1)
    return getTable()
      .setQuery(query)
      .expand(['merchant_type_id'])
      .limit(1000)
      .find()
  }
}
