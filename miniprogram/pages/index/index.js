import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const INDEX_COVER_LSIT = [
  'https://cloud-minapp-32931.cloud.ifanrusercontent.com/1j4i1JXo4jg496x4.png',
  'https://cloud-minapp-32931.cloud.ifanrusercontent.com/1j4i1JrufTYvGmjp.png',
]

let _getWikiContentLocked = false

Component({
  properties: {
  },

  data: {
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),
    orderStatus: constants.ORDER_STATUS,
    clothesType: constants.CLOTHES_TYPE,
    showPage: false,
    isAuth: baas.isAuth(),
    indexCoverList: INDEX_COVER_LSIT,
    coverIndex: null,
    pageHeaderStyle: '',
    userPhoneList: [],
    userOrderInfo: null,
    wikiContentList: [],
    wikiContentOffset: 0,
    refreshTriggered: false,
    storeNameList: [],
    slogan: '',
  },

  methods: {
    onLoad(options) {
      wx.showLoading({
        mask: true,
      })
      if(!baas.isLogin()) {
        baas.authLogin().then(res => {
          this.initOnLoad(options)
        })
      } else {
        this.initOnLoad(options)
      }
    },

    initOnLoad(options) {
      // console.log('options:', options)
      this.setData({
        isAuth: baas.isAuth(),
      })
      if (!baas.isAuth()) { // 未授权
        wx.hideLoading()
        // 如果带着订单号进来，带参重定向去授权页
        if (options && options.scene) {
          router.relaunch({
            name: 'auth',
            data: {
              scene: options.scene,
            },
          })
        } else {
          // 普通途径进来，显示首页等待授权
          this.setData({
            showPage: true,
          })
          // 获取小百科
          this.getWikiContent()

          this.handleIncreaseCoverIndex()

          this.getSloganSetting()
        }

      } else {  // 已授权

        wx.BaaS.auth.getCurrentUser().then(user => {
          const userInfo = user.toJSON()
          wx.hideLoading()
          // 如果是商家，重定向到商家首页
          if (userInfo.is_store_user) {
            app.globalData.isStoreUser = true
            router.relaunch({
              name: 'business-index',
            })
          } else if (options && options.scene) {
            // 客户带参进来，判断是否已经绑定手机号，重定向到关联订单页或授权手机页
            if (userInfo.phone.length > 0) {
              router.relaunch({
                name: 'relate-order',
                data: {
                  scene: options.scene,
                },
              })
            } else {
              router.relaunch({
                name: 'auth',
                data: {
                  scene: options.scene,
                },
              })
            }
          } else {
            // 普通已授权用户
            this.setData({
              showPage: true,
              userPhoneList: userInfo.phone,
            })
            // 查订单
            this.getLatestUserOrder()
            // 获取小百科
            this.getWikiContent()

            this.handleIncreaseCoverIndex()

            this.getSloganSetting()
          }
        })

      }
    },

    onShow() {
    },

    onRefresh() {
      console.log('onRefresh')
      this.setData({
        isAuth: baas.isAuth(),
        wikiContentList: [],
        wikiContentOffset: 0,
      }, this.initOnLoad)
    },

    // onReachBottom() {
    //   if (_getWikiContentLocked) return
    //   _getWikiContentLocked = true
    //   console.log('index onReachBottom')
    //   this.getWikiContent()
    // },

    // onPageScroll(e) {
    //   this.setData({
    //     pageHeaderStyle: e.scrollTop > 100 ? 'background-color: #E7E0D6;' : '',
    //   })
    // },

    onScrollerScroll(e) {
      this.setData({
        pageHeaderStyle: e.detail.scrollTop > 70 ? 'background-color: #E7E0D6;' : '',
      })
    },

    onScrollerBottom() {
      if (_getWikiContentLocked) return
      _getWikiContentLocked = true
      console.log('index onScrollerBottom')
      this.getWikiContent()
    },

    userInfoHandler(data) {
      wx.showLoading({
        mask: true,
      })
      baas.authLogin(data)
        .then(res => {
          this.setData({
            isAuth: baas.isAuth(),
          })
          this.navToAuth()
        })
        .catch(err => {
          console.log('err:', err)
        })
        .then(wx.hideLoading)
    },

    getLatestUserOrder() {
      return io.getUserOrderList({limit: 1, with_count: true})
        .then(res => {
          if (res.data.objects.length > 0) {
            const dataList = res.data.objects.map(item => {
              item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
              item.store_name_format = item.store_name ? item.store_name.replace(/有限公司$/, '') : ''
              return item
            })
            res.data.objects = dataList

            // 获取轮播商家名称 list
            // let storeNameList = []
            // res.data.objects.forEach(item => {
            //   if (item.store_name) storeNameList.push(item.store_name)
            // })
            // storeNameList = [...new Set(storeNameList)]
            // console.log('storeNameList', storeNameList)

            this.setData({
              userOrderInfo: res.data,
              // storeNameList,
            })
          }
        })
    },

    navToOrderDetail() {
      app.globalData.orderInfo = this.data.userOrderInfo.objects[0]
      router.push({
        name: 'order',
      })
    },

    getWikiContent() {
      _getWikiContentLocked = true
      let {wikiContentList, wikiContentOffset} = this.data
      return io.getIndexWiki(wikiContentOffset)
        .then(res => {
          const dataList = res.data.objects.map(item => {
            item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
            return item
          })
          this.setData({
            wikiContentList: wikiContentList.concat(dataList),
            wikiContentOffset: wikiContentOffset + 20,
            refreshTriggered: false,
          }, () => {
            _getWikiContentLocked = !res.data.meta.next
          })
        })
    },

    getSloganSetting() {
      return io.getSloganSetting()
        .then(res => {
          this.setData({
            slogan: res.data.objects[0].value || '',
          })
        })
    },

    handleIncreaseCoverIndex() {
      let coverIndex = baas.getStorage('cover_index')
      if (!coverIndex) coverIndex = 1
      this.setData({
        coverIndex: coverIndex % INDEX_COVER_LSIT.length
      })
    },

    navToAddPhoneNumber() {
      router.relaunch({
        name: 'add-phone-number',
      })
    },

    navToAuth() {
      router.relaunch({
        name: 'auth',
      })
    },

    navToSearchOrder() {
      app.globalData.autoFocus = true
      this.navToOrderList()
    },

    navToOrderList() {
      router.switchTab({
        name: 'order-list',
      })
    },

    navToArticle(e) {
      const {index} = e.currentTarget.dataset
      app.globalData.articleInfo = this.data.wikiContentList[index]
      router.push({
        name: 'wiki-article'
      })
    },

    onShareAppMessage() {
      return {
        title: '欢迎进入小裁神商店',
        path: `/${this.route}`,
        imageUrl: 'https://cloud-minapp-32931.cloud.ifanrusercontent.com/1j7WcnkSgSgiWoKb.png',
      }
    },

    noop() {},
  }
})
