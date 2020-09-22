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
  }
}
