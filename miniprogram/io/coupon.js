import { BAAS_SCHEMA_ID } from '../config/constants'

export default {
  getMerchantTypeList() {
    const getTable = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.merchant_type)
    const query = new wx.BaaS.Query()
    return getTable()
      .setQuery(query)
      .limit(1000)
      .find()
  }
}
