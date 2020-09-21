import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const headerTitleMap = {
  0: '身体数据',
  1: '小裁神',
  2: '成衣数据',
}

let _tailoredListLocked = false

Component({
  properties: {
  },

  data: {
    clothesType: constants.CLOTHES_TYPE,
    headerTitle: '小裁神',
    showTailoredLog: false,
    tailoredList: [],
    tailoredOffset: 0,
    sizePanelData: null,
    isShortScreen: false,
    swiperCurIndex: 1,

    latestTailored: null,
    tailoredBodyData: null,
    tailoredData: null, // 最终选中的量体对象
    productTypeList: [],  // 订单拥有的品类列表
    productTypeListIndex: 0, // 当前选中的品类 index
    curTypeProductList: [], // 当前选中品类的衣服列表
    curTypeProductListIndex: 0, // 当前选中的衣服 index

    showBodyModal: false,
    showClothesModal: false,
  },

  methods: {
    onLoad() {
      this.getTailoredList()
    },

    handleShowTailoredLog() {
      const {showTailoredLog} = this.data
      this.setData({
        showTailoredLog: !showTailoredLog,
      })
    },

    handleSwiperChange(e) {
      const {current} = e.detail
      this.setData({
        headerTitle: headerTitleMap[current],
      })
    },

    changeSwiperIndex(e) {
      const {index} = e.currentTarget.dataset
      this.setData({
        swiperCurIndex: index * 1,
      })
    },

    getTailoredList() {
      _tailoredListLocked = true
      const {tailoredOffset, tailoredList} = this.data
      if (tailoredOffset === 0) {
        wx.showLoading({
          mask: true,
        })
      }
      return io.getUserTailoredList(tailoredOffset).then(res => {
        const dataList = res.data.objects.map(item => {
          item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
          return item
        })
        this.setData({
          tailoredList: tailoredList.concat(dataList),
          tailoredOffset: tailoredOffset + 20,
        }, () => {
          _tailoredListLocked = !res.data.meta.next
          wx.hideLoading()
        })
        if (tailoredOffset === 0 && dataList.length > 0) {
          this.setData({
            latestTailored: dataList[0]
          }, this.handleLatestTailoredInfo)
        }
      })
    },

    handleGetMoreTailored() {
      if (_tailoredListLocked) return
      _tailoredListLocked = true
      this.getTailoredList()
    },

    handleLatestTailoredInfo() {
      // console.log('handleLatestTailoredInfo')

      // 初始化中间量体图片数据
      this.initSizePanelData()

      // 初始化身体数据
      this.setData({
        tailoredBodyData: this.data.latestTailored.tailored_body_data,
      })

      // 初始化成衣数据
      let productTypeList = []
      this.data.latestTailored.product_list.forEach(item => {
        if (item.tailoring_data && item.tailoring_data.length > 0 &&
          productTypeList.indexOf(item.clothes_type) === -1) {
            productTypeList.push(item.clothes_type)
        }
      })
      // console.log('productTypeList', productTypeList)
      if (productTypeList.length === 0) return

      const {productTypeListIndex} = this.data
      let curTypeProductList = this.data.latestTailored.product_list.filter(item => {
        return item.clothes_type === productTypeList[productTypeListIndex] &&
          item.tailoring_data &&
          item.tailoring_data.length > 0
      })

      curTypeProductList = curTypeProductList.map(item => {
        item.name = this.data.clothesType[item.clothes_type] + ' ' + item.clothes_type_index
        return item
      })
      this.setData({
        productTypeList,
        curTypeProductList,
      })

      let tailoredData
      if (curTypeProductList.length === 0) {
        tailoredData = null
      } else {
        const {curTypeProductListIndex} = this.data
        tailoredData = curTypeProductList[curTypeProductListIndex].tailoring_data
      }
      this.setData({
        tailoredData,
      })
    },

    handleProductTypeChange(e) {
      const {index} = e.currentTarget.dataset
      const {productTypeList} = this.data
      let curTypeProductList = this.data.latestTailored.product_list.filter(item => {
        return item.clothes_type === productTypeList[index] &&
          item.tailoring_data &&
          item.tailoring_data.length > 0
      })

      curTypeProductList = curTypeProductList.map(item => {
        item.name = this.data.clothesType[item.clothes_type] + ' ' + item.clothes_type_index
        return item
      })

      this.setData({
        productTypeListIndex: index,
        curTypeProductList,
        curTypeProductListIndex: 0,
        tailoredData: curTypeProductList[0].tailoring_data,
      })
    },

    handleCurTypeProductChange(e) {
      const index = e.detail.value * 1

      this.setData({
        curTypeProductListIndex: index,
        tailoredData: this.data.curTypeProductList[index].tailoring_data,
      })
    },

    initSizePanelData() {
      const availableList = this.data.latestTailored.product_list.filter(item => {
        return (item.clothes_type === 'jacket' || item.clothes_type === 'pants') &&
          item.clothes_type_index == '1'
      })
      if (availableList.length === 0) return
      let sizePanelData = {}
      availableList.forEach(item => {
        if (item.clothes_type === 'jacket') {
          item.tailoring_data.forEach(typeItem => {
            if (typeItem.type === 'text') {
              typeItem.options.forEach(optionItem => {
                if (optionItem.name === '肩宽') {
                  sizePanelData.shoulder = optionItem.value
                }
                if (optionItem.name === '胸围') {
                  sizePanelData.bust = optionItem.value
                }
                if (optionItem.name === '腰围') {
                  sizePanelData.waist = optionItem.value
                }
                if (optionItem.name === '面料') {
                  sizePanelData.jacket = optionItem.value
                }
              })
            }
            if (typeItem.type === 'select') {
              typeItem.options.forEach(optionItem => {
                if (optionItem.name === '肩宽') {
                  sizePanelData.shoulder = optionItem.value
                }
                if (optionItem.name === '胸围') {
                  sizePanelData.bust = optionItem.value
                }
                if (optionItem.name === '腰围') {
                  sizePanelData.waist = optionItem.value
                }
                if (optionItem.name === '面料') {
                  sizePanelData.jacket = optionItem.value
                }
              })
            }
            if (typeItem.type === 'textarea') {
              if (typeItem.name === '肩宽') {
                sizePanelData.shoulder = typeItem.value
              }
              if (typeItem.name === '胸围') {
                sizePanelData.bust = typeItem.value
              }
              if (typeItem.name === '腰围') {
                sizePanelData.waist = typeItem.value
              }
              if (typeItem.name === '面料') {
                sizePanelData.jacket = typeItem.value
              }
            }
          })
        }
        if (item.clothes_type === 'pants') {
          item.tailoring_data.forEach(typeItem => {
            if (typeItem.type === 'text') {
              typeItem.options.forEach(optionItem => {
                if (optionItem.name === '裤长') {
                  sizePanelData.length = optionItem.value
                }
                if (optionItem.name === '面料') {
                  sizePanelData.pants = optionItem.value
                }
              })
            }
            if (typeItem.type === 'select') {
              typeItem.options.forEach(optionItem => {
                if (optionItem.name === '裤长') {
                  sizePanelData.length = optionItem.value
                }
                if (optionItem.name === '面料') {
                  sizePanelData.pants = optionItem.value
                }
              })
            }
            if (typeItem.type === 'textarea') {
              if (typeItem.name === '裤长') {
                sizePanelData.length = typeItem.value
              }
              if (typeItem.name === '面料') {
                sizePanelData.pants = typeItem.value
              }
            }
          })
        }
      })

      const screenRate = parseInt(device.getWindowHeight() / device.getWindowWidth() * 10)
      const isShortScreen = screenRate < 20 // 长宽比小于 18:9 的屏幕是短屏

      this.setData({sizePanelData, isShortScreen})
      console.log('screenRate', screenRate, isShortScreen)
      console.log('sizePanelData', sizePanelData)
    },

    handleShowBodyModal() {
      this.setData({
        showBodyModal: true,
      })
    },

    handleShowClothesModal() {
      this.setData({
        showClothesModal: true,
      })
    },

    closeModal() {
      this.setData({
        showBodyModal: false,
        showClothesModal: false,
      })
    },

    navToTailoredDetail(e) {
      const {index} = e.currentTarget.dataset
      app.globalData.orderInfo = this.data.tailoredList[index]
      router.push({
        name: 'tailored-detail',
      })
    },

    noop() {},
  }
})
