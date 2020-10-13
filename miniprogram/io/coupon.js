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
  getCouponList(merchantIds) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.coupon)
    const query = new wx.BaaS.Query()
    if (merchantIds && merchantIds.length) {
      const MerchantTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant)
      let arr = merchantIds.map(item => {
        return MerchantTable().getWithoutData(item)
      })
      query.in('merchant_id', arr)
    }
    return getTable()
      .setQuery(query)
      .expand(['merchant_id'])
      .limit(1000)
      .find()
  },
  getCouponPackages(merchantIds){
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.packages)
    const query = new wx.BaaS.Query()
    if (merchantIds && merchantIds.length) {
      const MerchantTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant)
      let arr = merchantIds.map(item => {
        return MerchantTable().getWithoutData(item)
      })
      query.in('merchant_id', arr)
    }
    return getTable()
      .setQuery(query)
      .expand(['merchant_id'])
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
  },
  getPackageDetail(id) {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.packages)
    return getTable().get(id)
  }
}
