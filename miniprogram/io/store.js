import {BAAS_SCHEMA_ID} from '../config/constants'

const getTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.store)

export default {
  getUserStoreInfo(uid) {
    const query = new wx.BaaS.Query()
    query.compare('created_by', '=', uid)
    query.compare('active', '=', true)
    return getTableObject()
      .setQuery(query)
      .limit(1)
      .find()
  },

}
