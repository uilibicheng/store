import {BAAS_SCHEMA_ID} from '../config/constants'

const getTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.settings)

export default {
  getSloganSetting() {
    const query = new wx.BaaS.Query()
    query.compare('key', '=', 'slogan')
    return getTableObject()
      .setQuery(query)
      .limit(1)
      .find()
  },

}
