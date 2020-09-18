import io from '../../io/index'
import {ROUTE} from '../../config/constants'

Page({
  data: {
    stickers: [],
    hasScanQrcodeBtn: false,
    hasShareBtn: false,
    hasInviter: false,
  },

  onLoad(options) {
    const {sticker_id, inviter} = options

    if (inviter) {
      this.setData({hasInviter: true})
      this.initUnlockSticker(sticker_id)
      this.createStickerUnlockLog(sticker_id, +inviter)
    } else {
      this.initStickers(sticker_id)
    }
  },

  initStickers(sticker_id) {
    Promise.all([io.fetchHasLockSticker(), io.fetchStickerUnlockLog()]).then(res => {
      const stickers = res[0].data.objects
      const unlockLogs = res[1].data.objects

      stickers.forEach(item => {
        item.unlockCount = 0
        item.unlock_method = item.unlock_method || []
        item.hasShareBtn = item.unlock_method.includes('share')

        unlockLogs.forEach(log => {
          if (log.sticker_id === item.id) {
            if (log.unlock_method === 'scan_qrcode') {
              item.scanedQrcode = true
            } else {
              item.unlockCount += 1
            }
          }
        })
      })

      const lockedStickers = stickers.filter(item => {
        return item.has_lock && !item.scanedQrcode && item.unlockCount < 2
      })

      const currentStickerIndex = lockedStickers.findIndex(item => item.id === sticker_id)
      this.getUnlockMethod(lockedStickers, currentStickerIndex)

      this.setData({stickers: lockedStickers}, () => {
        this.setData({currentStickerIndex})
      })
    })
  },

  initUnlockSticker(sticker_id) {
    io.fetchStickerById(sticker_id).then(res => {
      const unlockSticker = res.data.objects[0]
      this.setData({unlockSticker})
    })
  },

  createStickerUnlockLog(sticker_id, inviter) {
    io.fetchStickerUnlockLogCount(sticker_id, inviter).then(count => {
      if (inviter == wx.BaaS.storage.get('uid')) {
        wx.redirectTo({url: '/' + ROUTE.STICKER_CAMERA})
        return
      }
      if (count >= 2) return
      io.createStickerUnlockLog(sticker_id, inviter, 'share')
    })
  },

  getUnlockMethod(stickers, currentStickerIndex) {
    const unlockMethod = stickers[currentStickerIndex].unlock_method || []
    this.setData({
      hasScanQrcodeBtn: unlockMethod.includes('scan_qrcode'),
      hasShareBtn: unlockMethod.includes('share'),
    })
  },

  onSwiperChange(e) {
    const {current} = e.detail
    const {stickers} = this.data
    this.getUnlockMethod(stickers, current)
    this.setData({currentStickerIndex: current})
  },

  scanQrcode() {
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['qrCode'],
      success: res => {
        console.log(res)
        const path = res.path
        if (path) {
          const data = this.parseQrcodePath(path)
          const {sticker_id, scan_qrcode} = data
          if (sticker_id && scan_qrcode) {
            const inviter = wx.BaaS.storage.get('uid')
            io.createStickerUnlockLog(sticker_id, inviter, 'scan_qrcode')
              .then(res => {
                this.setData({afterScanQrcode: true, hasInviter: true})
                this.initUnlockSticker(sticker_id)
                wx.showToast({title: '解锁成功！'})
              })
              .catch(err => {
                this.setData({afterScanQrcode: true, hasInviter: true})
                this.initUnlockSticker(sticker_id)
                wx.showToast({title: '解锁成功！'})
              })
          }
        } else {
          console.log('err')
        }
      },
    })
  },

  onShareAppMessage() {
    const {stickers, currentStickerIndex} = this.data
    const inviter = wx.BaaS.storage.get('uid')
    const image = stickers[currentStickerIndex].image
    const stickerId = stickers[currentStickerIndex].id

    return {
      title: '日本乐高乐园',
      path: `/${ROUTE.STICKER_UNLOCK}?inviter=${inviter}&sticker_id=${stickerId}`,
      imageUrl: image,
    }
  },

  navToHome() {
    wx.reLaunch({url: '/' + ROUTE.INDEX})
  },

  navBack() {
    wx.navigateBack({delta: 1})
  },

  parseQrcodePath(path) {
    const query = path.split('?')[1]
    const data = {}
    if (query) {
      const queryArr = query.split('&')
      queryArr.forEach(item => {
        const arr = item.split('=')
        if (arr[0] === 'sticker_id') {
          data.sticker_id = arr[1]
        }
        if (arr[0] === 'scan_qrcode') {
          data.scan_qrcode = arr[1]
        }
      })
    }
    return data
  },
})
