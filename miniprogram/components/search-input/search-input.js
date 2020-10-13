// components/index-icon/index-icon.js

let timer = null
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    programList: {
      type: Array,
      value: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchValue: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSearch() {
      console.log(111, this.data.searchValue)
      let eventDetail = {
        value: this.data.searchValue,
      }
      this.triggerEvent('onsearch', eventDetail, {})
    },
    onCancel() {
      this.setData({
        searchValue: '',
      })
    },
    onChange(event) {
      this.setData({
        searchValue: event.detail,
      })
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(() => {
        this.onSearch()
      }, 500)
    },
  }
})