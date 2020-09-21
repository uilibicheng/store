import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

let initialOrderObj = {
  order_id: '',
  tailored_image: [],
  store_note: '',
  clothes: {},
}

Component({
  properties: {
  },

  data: {
    clothesType: constants.CLOTHES_TYPE,
    clothesTypeList: constants.CLOTHES_TYPE_LIST,
    createdOrderList: [],
    batchQRCode: '',
    contactName: '',
    orderList: [],
  },

  methods: {
    onLoad() {
      constants.CLOTHES_TYPE_LIST.forEach(item => {
        initialOrderObj.clothes[item.value] = 0
      })
      this.setData({
        orderList: [simpleClone(initialOrderObj)],
      })
    },

    addOrderItem() {
      let orderList = simpleClone(this.data.orderList)
      orderList.push(simpleClone(initialOrderObj))
      this.setData({
        orderList,
      })
    },

    deleteOrderItem(e) {
      const {index} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      orderList.splice(index, 1)
      this.setData({
        orderList,
      })
    },

    handleOrderIdInput(e) {
      const {index} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      orderList[index].order_id = e.detail.value
      this.setData({
        orderList,
      })
    },

    handleStoreNoteInput(e) {
      const {index} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      orderList[index].store_note = e.detail.value
      this.setData({
        orderList,
      })
    },

    handleContactNameInput(e) {
      this.setData({
        contactName: e.detail.value,
      })
    },

    addClothesAmount(e) {
      const {index, type} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      orderList[index].clothes[type]++
      this.setData({
        orderList,
      })
    },

    minusClothesAmount(e) {
      const {index, type} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      if (orderList[index].clothes[type] === 0) return
      orderList[index].clothes[type]--
      this.setData({
        orderList,
      })
    },

    uploadTailoredImage(e) {
      const {index} = e.currentTarget.dataset
      wx.chooseImage({
        success: res => {
          wx.showLoading({mask: true})
          io.uploadImage(res.tempFilePaths, 'tailored')
            .then(res => {
              let orderList = simpleClone(this.data.orderList)
              orderList[index].tailored_image = orderList[index].tailored_image.concat(res)
              wx.hideLoading()
              this.setData({
                orderList,
              })
            })
        }
      })
    },

    deleteTailoredImage(e) {
      const {index, imgindex} = e.currentTarget.dataset
      let orderList = simpleClone(this.data.orderList)
      orderList[index].tailored_image.splice(imgindex, 1)
      this.setData({
        orderList,
      })
    },

    handleSubmit() {
      wx.showLoading({mask: true})
      console.log(this.data.orderList, this.data.contactName)
      const {contactName, orderList} = this.data

      if (!contactName.trim()) {
        wx.hideLoading()
        wx.showToast({
          title: '请填写客户名称',
          icon: 'none',
        })
        return
      }

      const verify = this.verifyOrderList(orderList)
      if (verify) {
        wx.hideLoading()
        wx.showToast({
          title: verify,
          icon: 'none',
        })
        return
      }

      wx.BaaS.invoke(
        constants.REMOTE_FUNCTION.create_order,
        {contact_name: contactName, order_list: orderList}
      ).then(res => {
        if (res.code === 0) {
          let createdOrderList = []
          res.data.operation_result.forEach(item => {
            if (item.success) createdOrderList.push(item.success)
          })
          Promise.all(createdOrderList.map(item => {
            return io.getStoreOrder(item.id)
          })).then(res => {

            createdOrderList = res.map(item => {
              return item.data
            })
            console.log('order list =', createdOrderList)
            return createdOrderList

          }).then(createdOrderList => {

            // Promise.all(createdOrderList.map(item => {
            //   const qrcodeParams = {
            //     scene: item.id,
            //     page: 'pages/index/index',
            //     is_hyaline: true,
            //   }
            //   return wx.BaaS.getWXACode('wxacodeunlimit', qrcodeParams).then(res => res.image)
            // })).then(imgList => {
            //   createdOrderList = createdOrderList.map((item, index) => {
            //     item.qrcode = imgList[index]
            //     return item
            //   })
            //   this.setData({
            //     createdOrderList,
            //   })
            //   wx.hideLoading()
            // })

            const qrcodeParams = {
              scene: createdOrderList[0].batch_no,
              page: 'pages/index/index',
              is_hyaline: true,
            }
            wx.BaaS.getWXACode('wxacodeunlimit', qrcodeParams).then(res => {
              this.setData({
                createdOrderList,
                batchQRCode: res.image,
              })
              wx.hideLoading()
            })

          })

        } else {
          wx.hideLoading()
          wx.showToast({
            title: res.error.message,
            icon: 'none',
            mask: true,
          })
        }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },

    verifyOrderList(orderList) {
      for (let i = 0; i < orderList.length; i++) {
        if (!orderList[i].order_id.trim()) {
          return '请填写订单号'
        }
        const clothesAmount = Object.keys(orderList[i].clothes)
          .reduce((acc, cur) => acc + orderList[i].clothes[cur], 0)
        console.log('clothesAmount', clothesAmount)
        if (clothesAmount === 0) {
          return '请选择服装品类数量'
        }
      }
      return false
    },

    noop() {},
  }
})
