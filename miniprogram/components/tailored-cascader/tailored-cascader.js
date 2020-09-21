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
    tailoredSwitch: [],
  },

  observers: {
    'tailoredData'(tailoredData) {
      // console.log('observers tailoredData', tailoredData)
      if (!tailoredData || tailoredData.length === 0) return
      const tailoredSwitch = tailoredData.map(() => {return true})
      // console.log('tailoredSwitch', tailoredSwitch)
      this.setData({
        tailoredSwitch,
      })
    }
  },

  lifetimes: {
    attached() {
    }
  },

  methods: {
    switchDataItemShow(e) {
      const {index} = e.currentTarget.dataset
      let tailoredSwitch = simpleClone(this.data.tailoredSwitch)
      tailoredSwitch[index] = !tailoredSwitch[index]
      this.setData({
        tailoredSwitch,
      })
    },
  },
})
