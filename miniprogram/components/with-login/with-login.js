import baas from '../../lib/baas'

Component({
  properties: {
    forceShowModal: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    showModal: false,
  },

  methods: {
    onTap() {
      if (baas.isAuth()) {
        this.onSuccess()
      } else {
        this.showModal()
      }
    },

    showModal() {
      this.setData({showModal: true})
    },

    hideModal() {
      this.setData({showModal: false, forceShowModal: false})
    },

    onSuccess() {
      this.triggerEvent('onSuccess', {}, {})
      this.hideModal()
    },

    onFail() {
      this.triggerEvent('onFail', {}, {})
      this.hideModal()
    },

    noop() {},
  },
})
