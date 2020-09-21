// components/auth-modal/auth-modal.js
Component({
  properties: {
    showModal: {
      type: Boolean,
      value: false,
    },
    modalWidth: {
      type: String,
      value: '',
    },
    modalSize: {
      type: String,
      value: 'small', // 'small'、'big'
    },
    btnSize: {
      type: String,
      value: 'small', // 'small'、'big'
    },
    btnDisabled: {
      type: Boolean,
      value: false,
    },
    title: {
      type: String,
      value: '',
    },
    btnText: {
      type: String,
      value: '确定',
    },
  },

  data: {},

  methods: {
    onConfirm() {
      this.triggerEvent('onConfirm', {}, {})
    },

    noop() { },
  },
})
