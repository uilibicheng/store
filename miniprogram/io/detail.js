import { BAAS_SCHEMA_ID } from '../config/constants'

export default {
  getBannerListDetail(id) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant_banner)
    const query = new wx.BaaS.Query()
    query.compare('merchant_id', '=', id)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('serial_number')
      .find()
  },
  getMerchantDetail(id) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant)
    const query = new wx.BaaS.Query()
    query.compare('id', '=', id)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .expand(['merchant_type_id'])
      .orderBy('serial_number')
      .find()
  },
  getServerListDetail(arr) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.restaurant_service)
    const query = new wx.BaaS.Query()
    query.in('id', arr)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('serial_number')
      .find()
  },
  getMenuListDetail(arr){
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.menu)
    const query = new wx.BaaS.Query()
    query.in('merchant_id', arr)
    return getTable()
      .setQuery(query)
      .limit(1000)
      .orderBy('serial_number')
      .find()
  }
}
