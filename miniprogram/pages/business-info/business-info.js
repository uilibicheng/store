import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

Component({
  properties: {
  },

  data: {
    invitationCode: '',
    storeLogoList: [],
    storeQRCodeList: [],
    storeName: '',
    storeTel: '',
    storeAddressList: [''],
  },

  methods: {
    onLoad(options) {
      if (options.modify) {
        this.initStoreInfo()
      } else if (options.invitation_code) {
        this.setData({
          invitationCode: options.invitation_code,
        })
      }
    },

    initStoreInfo() {
      const {userStoreInfo} = app.globalData
      this.setData({
        storeLogoList: userStoreInfo.logo ? [userStoreInfo.logo] : [],
        storeQRCodeList: userStoreInfo.qrcode ? [userStoreInfo.qrcode] : [],
        storeName: userStoreInfo.name || '',
        storeTel: userStoreInfo.phone || '',
        storeAddressList: userStoreInfo.address && userStoreInfo.address.length > 0 ? userStoreInfo.address : [''],
      })
    },

    uploadStoreLogo() {
      wx.chooseImage({
        count: 1,
        success: res => {
          io.uploadImage(res.tempFilePaths, 'store')
            .then(res => {
              this.setData({
                storeLogoList: res,
              })
            })
        }
      })
    },

    deleteStoreLogo() {
      this.setData({
        storeLogoList: [],
      })
    },

    uploadStoreQRCode() {
      wx.chooseImage({
        count: 1,
        success: res => {
          io.uploadImage(res.tempFilePaths, 'store')
            .then(res => {
              this.setData({
                storeQRCodeList: res,
              })
            })
        }
      })
    },

    deleteStoreQRCode() {
      this.setData({
        storeQRCodeList: [],
      })
    },

    handleStoreNameInput(e) {
      this.setData({
        storeName: e.detail.value,
      })
    },

    handleStoreTelInput(e) {
      this.setData({
        storeTel: e.detail.value,
      })
    },

    addAddress() {
      let storeAddressList = [...this.data.storeAddressList]
      storeAddressList.push('')
      this.setData({
        storeAddressList,
      })
    },
    handleChooseLocation(e) {
      const {index} = e.currentTarget.dataset
      const {address, name} = e.detail
      let storeAddressList = [...this.data.storeAddressList]
      storeAddressList[index] = address + name
      this.setData({
        storeAddressList,
      })
    },
    handleStoreAddressInput(e) {
      const {index} = e.currentTarget.dataset
      let storeAddressList = [...this.data.storeAddressList]
      storeAddressList[index] = e.detail.value
      this.setData({
        storeAddressList,
      })
    },
    deleteAddressItem(e) {
      const {index} = e.currentTarget.dataset
      let storeAddressList = [...this.data.storeAddressList]
      storeAddressList.splice(index, 1)
      this.setData({
        storeAddressList,
      })
    },


    submitInfo() {
      const {invitationCode,
        storeLogoList,
        storeQRCodeList,
        storeName,
        storeTel,
        storeAddressList
      } = this.data

      if (!storeName.trim()) {
        wx.showToast({
          title: '请填写商家名称',
          icon: 'none',
        })
        return
      }
      if (!storeTel.trim()) {
        wx.showToast({
          title: '请填写联系方式',
          icon: 'none',
        })
        return
      }

      wx.showLoading({mask: true})
      let params = {
        name: storeName.trim(),
        phone: storeTel.trim(),
      }
      if (invitationCode) params.invitation_code = invitationCode
      if (storeLogoList.length > 0) params.logo = storeLogoList[0]
      else params.logo = ''
      if (storeQRCodeList.length > 0) params.qrcode = storeQRCodeList[0]
      else params.qrcode = ''
      let effectiveAddressList = []
      storeAddressList.forEach(item => {
        if (item.trim()) effectiveAddressList.push(item.trim())
      })
      if (effectiveAddressList.length > 0) params.address = effectiveAddressList
      else params.address = []

      console.log('params', params)

      wx.BaaS.invoke(
        constants.REMOTE_FUNCTION[invitationCode ? 'create_store' : 'modify_store'],
        params
      ).then(res => {
        wx.hideLoading()
        if (res.code === 0) {
          app.globalData.isStoreUser = true
          wx.showToast({
            title: '提交成功',
            mask: true,
          })
          setTimeout(() => {
            router.relaunch({
              name: 'business-index',
            })
          }, 500)
        } else {
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

    noop() {},
  }
})
