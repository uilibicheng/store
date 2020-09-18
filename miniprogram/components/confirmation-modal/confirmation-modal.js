Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    content: {
      type: String,
      value: '',
    },
    contentAlignLeft: {
      type: Boolean,
      value: false,
    },
  },
  options: {
    multipleSlots: true,
  },
  methods: {
    handleCancel() {
      this.triggerEvent('onCancel')
    },
    handleConfirm() {
      this.triggerEvent('onConfirm')
    },
  },
})
