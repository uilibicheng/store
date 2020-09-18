import {BAAS_SCHEMA_ID} from '../config/constants'

export default {
  fetchStickerUnlockLog() {
    const StickerUnlockLog = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker_unlock_log)
    const query = new wx.BaaS.Query()
    query.compare('inviter', '=', +wx.BaaS.storage.get('uid'))

    return StickerUnlockLog.setQuery(query)
      .orderBy('-priority')
      .limit(200)
      .find()
  },

  fetchStickerUnlockLogCount(sticker_id, inviter) {
    const StickerUnlockLog = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker_unlock_log)
    const query = new wx.BaaS.Query()
    query.compare('sticker_id', '=', sticker_id)
    query.compare('inviter', '=', inviter)

    return StickerUnlockLog.setQuery(query).count()
  },

  createStickerUnlockLog(sticker_id, inviter, unlock_method) {
    const StickerUnlockLog = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.sticker_unlock_log)
    const record = StickerUnlockLog.create()
    record.set({
      sticker_id,
      inviter,
      unlock_method,
    })

    return record.save()
  },
}
