// components/modal-container/modal-container.js
Component({
  properties: {
    backgroundColor: {
      type: String,
      value: '#E7E0D6',
    },
    showModal: {
      type: Boolean,
      value: false,
    },
    adjustPosition: {
      type: Boolean,
      value: false,
    },
  },

  data: {},

  methods: {
    onConfirm() {
      this.triggerEvent('onConfirm', {}, {})
    },

    onClose() {
      this.triggerEvent('onClose', {}, {})
    },

    noop() {},
  },
})
