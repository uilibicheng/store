// components/burying-form/burying-form.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleEmptyFormSubmit(e) {
      let formID = e.detail.formId
      wx.BaaS.wxReportTicket(formID)
    },
  },
})
