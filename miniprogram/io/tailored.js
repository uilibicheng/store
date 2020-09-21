import {BAAS_SCHEMA_ID} from '../config/constants'

const getTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.tailored)

export default {
  getTailored(id) {
    return getTableObject().get(id)
  },

}
