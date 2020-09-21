import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
  },

  data: {
    orderStatusType: constants.ORDER_STATUS,
    clothesType: constants.CLOTHES_TYPE,
    orderStatusList: constants.ORDER_STATUS_LIST,
    orderStatusListPicker: constants.ORDER_STATUS_LIST_PICKER,
    orderStatusListIndex: {
      measured: 0,
      booked: 1,
      arrived: 2,
      making: 3,
      send_out: 4,
      send_back: 5,
      delivered: 6,
    },
    modifyMode: false,
    orderInfo: null,
    modifiedOrderInfo: null,
    modifiedTailoredData: null,
    tailoredInfo: null,
  },

  methods: {
    onLoad() {
      const {orderInfo} = app.globalData
      console.log('app.globalData.orderInfo', orderInfo)
      this.setData({
        orderInfo,
      })
      if (orderInfo.tailored_id) {
        return io.getTailored(orderInfo.tailored_id)
          .then(res => {
            this.setData({
              tailoredInfo: res.data,
            })
          })
      }
    },

    switchToModifyMode() {
      let modifiedOrderInfo = simpleClone(this.data.orderInfo)
      if (modifiedOrderInfo.tailored_id) {
        modifiedOrderInfo = this.mergeData(modifiedOrderInfo)
        console.log('modifiedOrderInfo', modifiedOrderInfo)
      }
      this.setData({
        modifiedOrderInfo,
        modifyMode: true,
      })
    },

    mergeData(formData) {
      const {body_data, tailoring_data} = this.data.tailoredInfo
      formData.tailored_body_data = this.mergeBodyData(formData, body_data)
      formData.product_list = this.mergeTailoredData(formData.product_list, tailoring_data)
      return formData
    },
  
    mergeBodyData(formData, body_data) {
      const arr = body_data.reduce((result, item) => {
        const findData = formData.tailored_body_data.find(data => {
          return item.name === data.name
        })
        // 当 findData 存在即能在订单的身体数据找到该字段
        if (findData) {
          if (item.options && item.options.length) {
            findData.options = item.options.reduce((optionList, option) => {
              // 在订单里的 options 查找是否有该选项
              const findOption = findData.options.find(findDataChild => {
                return findDataChild.name === option.name
              })
              if (findOption) {
                // 当有 child_options 即是下拉框的时候
                if (option.child_options) {
                  findOption.child_options = option.child_options
                  // 当有 value 值 判断新量体表是是否有该选项
                  if (findOption.value) {
                    findOption.value = option.child_options.includes(findOption.value) ? findOption.value : ''
                  }
                }
              }
              optionList.push(findOption || option)
              return optionList
            }, [])
          }
        }
        result.push(findData || item)
        return result
      }, [])
      return arr
    },
  
    mergeTailoredData(product_list, tailoring_data) {
      const arr = product_list.reduce((productList, product) => {
        product.tailoring_data = tailoring_data.reduce((result, item) => {
          if (item.clothes_type === product.clothes_type) {
            const findData = product.tailoring_data.find(data => {
              return item.name === data.name
            })
            if (findData) {
              if (item.options && item.options.length) {
                findData.options = item.options.reduce((optionList, option) => {
                  // 在订单里的 options 查找是否有该选项
                  const findOption = findData.options.find(findDataChild => {
                    return findDataChild.name === option.name
                  })
                  if (findOption) {
                    // 当有 child_options 即是下拉框的时候
                    if (option.child_options) {
                      findOption.child_options = option.child_options
                      // 当有 value 值 判断新量体表是是否有该选项
                      if (findOption.value) {
                        findOption.value = option.child_options.includes(findOption.value) ? findOption.value : ''
                      }
                    }
                  }
                  optionList.push(findOption || option)
                  return optionList
                }, [])
              }
            }
            result.push(findData || item)
          }
          return result
        }, [])
        productList.push(product)
        return productList
      }, [])
      return arr
    },

    onTailoredDataChange(e) {
      const {tailoredData, type, targetIndex} = e.detail
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      if (type === 'body') {
        modifiedOrderInfo.tailored_body_data = tailoredData
      } else {
        modifiedOrderInfo.product_list[targetIndex].tailoring_data = tailoredData
      }
      this.setData({
        modifiedOrderInfo,
        modifiedTailoredData: tailoredData,
      })
      // console.log('onTailoredDataChange', modifiedOrderInfo)
    },

    handleModifyContackNameInput(e) {
      const {value} = e.detail
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      modifiedOrderInfo.contact_name = value
      this.setData({
        modifiedOrderInfo,
      })
    },

    handleModifOrderIdInput(e) {
      const {value} = e.detail
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      modifiedOrderInfo.order_id = value
      this.setData({
        modifiedOrderInfo,
      })
    },

    handleModifyStoreNoteInput(e) {
      const {value} = e.detail
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      modifiedOrderInfo.store_note = value
      this.setData({
        modifiedOrderInfo,
      })
    },

    handleModifyOrderStatus(e) {
      const valueIndex = e.detail.value * 1
      const productIndex = e.currentTarget.dataset.productIndex
      const {orderStatusListPicker} = this.data
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      modifiedOrderInfo.product_list[productIndex].status = orderStatusListPicker[valueIndex].value
      const status = modifiedOrderInfo.product_list[productIndex].status
      if ((status === 'send_out' || status === 'send_back') &&
        !modifiedOrderInfo.product_list[productIndex][status + '_count']) {
          modifiedOrderInfo.product_list[productIndex][status + '_count'] = 1
        }
      this.setData({
        modifiedOrderInfo,
      })
    },

    addStatusCount(e) {
      const productIndex = e.currentTarget.dataset.productIndex
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      const status = modifiedOrderInfo.product_list[productIndex].status
      if (!modifiedOrderInfo.product_list[productIndex][status + '_count']) {
        modifiedOrderInfo.product_list[productIndex][status + '_count'] = 2
      } else {
        modifiedOrderInfo.product_list[productIndex][status + '_count']++
      }
      this.setData({
        modifiedOrderInfo,
      })
    },

    minusStatusCount(e) {
      const productIndex = e.currentTarget.dataset.productIndex
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      const status = modifiedOrderInfo.product_list[productIndex].status
      if (modifiedOrderInfo.product_list[productIndex][status + '_count'] === 1 || 
        !modifiedOrderInfo.product_list[productIndex][status + '_count']) return
      modifiedOrderInfo.product_list[productIndex][status + '_count']--
      this.setData({
        modifiedOrderInfo,
      })
    },

    uploadTailoredImage() {
      wx.chooseImage({
        success: res => {
          wx.showLoading({mask: true})
          io.uploadImage(res.tempFilePaths, 'tailored')
            .then(res => {
              let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
              modifiedOrderInfo.tailored_image = modifiedOrderInfo.tailored_image.concat(res)
              wx.hideLoading()
              this.setData({
                modifiedOrderInfo,
              })
            })
        }
      })
    },

    deleteTailoredImage(e) {
      const {imgindex} = e.currentTarget.dataset
      let modifiedOrderInfo = simpleClone(this.data.modifiedOrderInfo)
      modifiedOrderInfo.tailored_image.splice(imgindex, 1)
      this.setData({
        modifiedOrderInfo,
      })
    },

    submitModifyOrder() {
      console.log('submit', this.data.modifiedOrderInfo)

      if (!this.data.modifiedOrderInfo.contact_name.trim()) {
        wx.showToast({
          title: '请填写客户名称',
          icon: 'none',
          mask: true,
        })
      }
      if (!this.data.modifiedOrderInfo.order_id.trim()) {
        wx.showToast({
          title: '请填写订单号',
          icon: 'none',
          mask: true,
        })
      }

      wx.showLoading({mask: true})

      wx.BaaS.invoke(
        constants.REMOTE_FUNCTION.modify_order,
        {modified_order: this.data.modifiedOrderInfo}
      ).then(res => {
        if (res.code === 0) {
          this.setData({
            orderInfo: res.data,
            modifiedOrderInfo: null,
            modifiedTailoredData: null,
            modifyMode: false,
          })
          app.globalData.modifiedOrderInfo = res.data
          wx.showToast({
            title: '修改成功',
            mask: true,
          })
          wx.hideLoading()
        } else {
          wx.showToast({
            title: res.error.message,
            icon: 'none',
            mask: true,
          })
          wx.hideLoading()
        }
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },

    reviewTailoredImage() {
      wx.previewImage({
        urls: this.data.orderInfo.tailored_image,
      })
    },

    noop() {},
  }
})
