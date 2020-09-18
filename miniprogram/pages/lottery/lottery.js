import {ROUTE} from '../../config/constants'

Page({
  data: {
    showLottery: false,
    qrcode: '',
  },

  onLoad(options) {
    console.log('lottery onLoad', options)
    const lotteryPlugin = requirePlugin('lotteryPlugin')
    lotteryPlugin.init({
      appid: 'wxdc10b0aab890a622', // 日本乐高商店应用
      // appid: 'wxc1f09e5b32e50d96', // 插件测试应用
      hasNavbar: true,
      navbarTheme: 'white',
      navbarBackgroundColor: '#006CBA',
    })

    console.log('lotteryPlugin', lotteryPlugin)

    const lotteryId = options.lottery_id || null
    const inviter = options.inviter || null
    let scene = options.scene || null
    if (scene) scene = decodeURIComponent(scene)
    console.log('scene', scene)
    const currentPages = getCurrentPages()

    this.setData({lotteryId, inviter, scene, currentPages}, () => {
      this.setData({showLottery: true})
    })
    console.log('onLoad inivter', inviter)
  },

  getQrcode() {
    console.log('获取二维码')

    console.log(`${this.lotterySid}&${this.inviter}`)
    wx.BaaS.getWXACode(
      'wxacodeunlimit',
      {
        page: 'pages/lottery/lottery',
        scene: `${this.lotterySid}&${this.inviter}`,
        width: 408,
      },
      true,
      'qrcode',
    )
      .then(res => {
        const qrcode = res.download_url
        this.setData({qrcode})
      })
      .catch(err => {
        console.log('获取二维码 err', err)
      })
  },

  updateShareInfo(e) {
    console.log('shareInfo', e.detail)
    const {lotteryId, lotterySid, inviter, username, prize_name, prize_image} = e.detail

    this.lotteryId = lotteryId
    this.lotterySid = lotterySid
    this.inviter = inviter
    this.username = username
    this.prize_name = prize_name
    this.prize_image = prize_image
  },

  navToCheckPrize() {
    wx.navigateTo({url: `/${ROUTE.PERSONAL}`})
  },

  onShareAppMessage() {
    let path = '/pages/lottery/lottery'
    if (this.lotteryId) path += '?lottery_id=' + this.lotteryId
    if (this.inviter) path += '&inviter=' + this.inviter
    console.log('onShareAppMessage path', path)

    return {
      path,
      title: `${this.username}邀你抽奖${this.prize_name}`,
      imageUrl: this.prize_image,
    }
  },

  goToIndex() {
    wx.reLaunch({
      url: `/${ROUTE.INDEX}`,
    })
  },
})
