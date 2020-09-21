// components/tailored-cascader/tailored-cascader.js

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

Component({
  properties: {
    tailoredData: {
      type: Object,
      value: null,
    },
  },

  data: {
    // tailoredSwitch: [],
  },

  observers: {
    'tailoredData'(tailoredData) {
      // console.log('observers tailoredData', tailoredData)
      // if (!tailoredData || tailoredData.length === 0) return
      // const tailoredSwitch = tailoredData.map(() => { return true })
      // console.log('tailoredSwitch', tailoredSwitch)
      // this.setData({
      //   tailoredSwitch,
      // })
    }
  },

  lifetimes: {
    attached() {
    }
  },

  methods: {
    // switchDataItemShow(e) {
    //   const { index } = e.currentTarget.dataset
    //   let tailoredSwitch = simpleClone(this.data.tailoredSwitch)
    //   tailoredSwitch[index] = !tailoredSwitch[index]
    //   this.setData({
    //     tailoredSwitch,
    //   })
    // },

    handleTextContentInput(e) {
      // console.log('handleTextContentInput', e)
      const {index, textIndex} = e.currentTarget.dataset
      const {value} = e.detail
      let tailoredData = simpleClone(this.data.tailoredData)
      if (value) {
        tailoredData[index].options[textIndex].value = value
      } else {
        delete tailoredData[index].options[textIndex].value
      }

      // console.log('handleTextContentInput', tailoredData)
      this.onTailoredDataChange(tailoredData)
    },

    handleCheckboxContentChange(e) {
      // console.log('handleCheckboxContentChange', e)
      const {index} = e.currentTarget.dataset
      const {value} = e.detail
      let tailoredData = simpleClone(this.data.tailoredData)
      let newOptions = tailoredData[index].options.map((item, index) => {
        if (value.indexOf(index + '') === (-1)) {
          delete item.value
        } else {
          item.value = true
        }
        return item
      })
      tailoredData[index].options = newOptions

      // console.log('handleCheckboxContentChange', tailoredData)
      this.onTailoredDataChange(tailoredData)
    },

    handleSelectContentChange(e) {
      // console.log('handleSelectContentChange', e)
      const {index, selectIndex} = e.currentTarget.dataset
      const {value} = e.detail
      let tailoredData = simpleClone(this.data.tailoredData)
      tailoredData[index].options[selectIndex].value =
        tailoredData[index].options[selectIndex].child_options[value * 1]

      // console.log('handleSelectContentChange', tailoredData)
      this.onTailoredDataChange(tailoredData)
    },

    handleTextareaContentInput(e) {
      // console.log('handleTextareaContentInput', e)
      const {index} = e.currentTarget.dataset
      const {value} = e.detail
      let tailoredData = simpleClone(this.data.tailoredData)
      if (value) {
        tailoredData[index].value = value
      } else {
        delete tailoredData[index].value
      }

      // console.log('handleTextareaContentInput', tailoredData)
      this.onTailoredDataChange(tailoredData)
    },

    onTailoredDataChange(tailoredData) {
      this.triggerEvent('ontailoredchange', tailoredData)
    },
  },
})
