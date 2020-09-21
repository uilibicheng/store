// components/tailored-panel/tailored-panel.js
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
    orderInfo: {
      type: Object,
      value: null,
    },
    modifiedTailoredData: {
      type: Object,
      value: null,
    },
  },

  data: {
    dataType: 'body', // body、clothes
    clothesType: constants.CLOTHES_TYPE,

    tailoredData: null, // 最终选中的量体对象
    productTypeList: [],  // 订单拥有的品类列表
    productTypeListIndex: 0, // 当前选中的品类 index
    curTypeProductList: [], // 当前选中品类的衣服列表
    curTypeProductListIndex: 0, // 当前选中的衣服 index
  },

  lifetimes: {
    attached() {
      // console.log('modify panel', this.data.orderInfo)
      if (this.data.orderInfo.tailored_body_data) {
        this.setData({
          tailoredData: this.data.orderInfo.tailored_body_data,
        })
      }
      this.initTailoringData()
    },
  },

  observers: {
    'modifiedTailoredData'(modifiedTailoredData) {
      // console.log('observers:', modifiedTailoredData)
      if (modifiedTailoredData) {
        this.setData({
          tailoredData: modifiedTailoredData,
        })
        if (this.data.dataType === 'clothes') {
          const {curTypeProductListIndex} = this.data
          let curTypeProductList = simpleClone(this.data.curTypeProductList)
          curTypeProductList[curTypeProductListIndex].tailoring_data = modifiedTailoredData
          this.setData({
            curTypeProductList,
          })
        }
      }
    }
  },

  methods: {
    initTailoringData() {
      let productTypeList = []
      const orderInfo = simpleClone(this.data.orderInfo)
      orderInfo.product_list.forEach(item => {
        if (item.tailoring_data && item.tailoring_data.length > 0 &&
          productTypeList.indexOf(item.clothes_type) === -1) {
          productTypeList.push(item.clothes_type)
        }
      })
      // console.log('productTypeList', productTypeList)
      if (productTypeList.length === 0) return

      const { productTypeListIndex } = this.data
      let curTypeProductList = orderInfo.product_list.filter(item => {
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
    },

    switchDataType(e) {
      const { type } = e.currentTarget.dataset
      const orderInfo = simpleClone(this.data.orderInfo)
      if (type !== this.data.dataType) {
        let tailoredData
        if (type === 'body') {
          tailoredData = orderInfo.tailored_body_data
        } else {
          if (this.data.curTypeProductList.length === 0) {
            tailoredData = null
          } else {
            const { curTypeProductListIndex } = this.data
            tailoredData = this.data.curTypeProductList[curTypeProductListIndex].tailoring_data
          }
        }
        this.setData({
          dataType: type,
          tailoredData,
        })
      }
    },

    handleProductTypeChange(e) {
      const { index } = e.currentTarget.dataset
      const { productTypeList } = this.data
      const orderInfo = simpleClone(this.data.orderInfo)
      let curTypeProductList = orderInfo.product_list.filter(item => {
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

    onTailoredDataChange(e) {
      // console.log('event:', e)
      const tailoredData = e.detail
      let orderInfo = simpleClone(this.data.orderInfo)
      const {dataType, productTypeList, productTypeListIndex, curTypeProductListIndex} = this.data

      if (dataType === 'body') {
        this.triggerEvent('ontailoredchange', {tailoredData, type: 'body'})
      } else {
        const targetIndex = orderInfo.product_list.findIndex(item => {
          return item.clothes_type === productTypeList[productTypeListIndex] &&
            item.clothes_type_index === (curTypeProductListIndex + 1)
        })
        this.triggerEvent('ontailoredchange', {tailoredData, type: 'clothes', targetIndex})
      }
    },

  },
})
