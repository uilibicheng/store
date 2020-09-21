// components/normal-counter/normal-counter.js
Component({
  properties: {
    amount: {
      type: Number,
      value: 0,
    }
  },

  data: {
  },

  methods: {
    handleAddAmount() {
      this.triggerEvent('add')
    },

    handleMinusAmount() {
      this.triggerEvent('minus')
    },
  }
})
