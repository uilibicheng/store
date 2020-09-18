import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  fetchSticker() {
    const Sticker = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker)
    const query = new wx.BaaS.Query()
    query.compare('status', '=', 'active')

    return Sticker.setQuery(query)
      .orderBy(['has_lock','-priority'])
      .limit(100)
      .find()
  },

  fetchHasLockSticker() {
    const Sticker = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker)
    const query = new wx.BaaS.Query()
    query.compare('status', '=', 'active')
    query.compare('has_lock', '=', true)

    return Sticker.setQuery(query)
      .orderBy(['has_lock','-priority'])
      .limit(100)
      .find()
  },

  fetchStickerById(id) {
    const Sticker = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker)
    const query = new wx.BaaS.Query()
    query.compare('id', '=', id)

    return Sticker.setQuery(query)
      .limit(1)
      .find()
  },
}
