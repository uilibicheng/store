import { BAAS_SCHEMA_ID } from '../config/constants'

export default {
  getMerchantTypeList() {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant_type)
    const query = new wx.BaaS.Query()
    return getTable()
      .setQuery(query)
      .limit(1000)
      .find()
  },

  getMerchantTypeDetail(id) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant_type)
    return getTable().get(id)
  },

  getCouponDetail(id) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.coupon)
    return getTable().expand('merchant_id').get(id)
  }
}
