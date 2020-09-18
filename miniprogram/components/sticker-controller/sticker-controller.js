import Preload from '../../lib/preload'
import io from '../../io/index'
import {ROUTE} from '../../config/constants'

Component({
  properties: {
    hasPrevNext: {
      type: Boolean,
      value: true,
    },

    hideCoverBar: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    stickers: [],
    currentIndex: 0,
  },

  attached() {},

  methods: {
    init() {
      const {currentIndex} = this.data

      Promise.all([io.fetchSticker(), io.fetchStickerUnlockLog()]).then(res => {
        const stickers = res[0].data.objects
        const unlockLogs = res[1].data.objects

        console.log(stickers)
        const imageList = stickers.map(item => item.image)

        const preload = new Preload()
        preload.init(imageList).then(tempFilePaths => {
          stickers.forEach(item => {
            if (tempFilePaths[item.image]) {
              item.tempFilePath = tempFilePaths[item.image]
            }
            item.unlockCount = 0
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

          const unlockedStickers = stickers.filter(item => {
            return !item.has_lock || item.scanedQrcode || item.unlockCount >= 2
          })

          const lockedStickers = stickers.filter(item => {
            return item.has_lock && !item.scanedQrcode && item.unlockCount < 2
          })

          this.setData({
            stickers: unlockedStickers.concat(lockedStickers),
            unlockedStickerCount: unlockedStickers.length,
          })

          const sticker = stickers[currentIndex].tempFilePath
          this.triggerEvent('selecteDefaultSticker', {sticker}, {})
        })
      })
    },

    onSelect(e) {
      const {index} = e.currentTarget.dataset
      this.setData({currentIndex: index})
      this.changeSticker(index)
    },

    onPrev(e) {
      let {unlockedStickerCount, currentIndex} = this.data
      currentIndex -= 1
      if (currentIndex < 0) {
        currentIndex = unlockedStickerCount - 1
      }
      this.setData({currentIndex})
      this.changeSticker(currentIndex)
    },

    onNext(e) {
      const prevIndex = this.data.currentIndex
      let {unlockedStickerCount, currentIndex} = this.data
      currentIndex += 1
      if (currentIndex > unlockedStickerCount - 1) {
        currentIndex = 0
      }
      this.setData({currentIndex})
      this.changeSticker(currentIndex)
    },

    changeSticker(index) {
      const {stickers} = this.data
      const sticker = stickers[index].tempFilePath
      this.triggerEvent('onSelect', {sticker}, {})
    },

    navToUnlockSticker(e) {
      const {id} = e.currentTarget.dataset
      wx.navigateTo({url: '/' + ROUTE.STICKER_UNLOCK + `?sticker_id=${id}`})
    },

    onCreateSharePoster() {
      this.triggerEvent('onCreateSharePoster', {}, {})
    },
  },
})
