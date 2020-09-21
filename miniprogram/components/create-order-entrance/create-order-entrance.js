// components/create-order-entrance/create-order-entrance.js
import router from '../../lib/router'

Component({
  properties: {
  },

  data: {
  },

  methods: {
    navToCreateOrder() {
      router.push({
        name: 'business-create-order',
      })
    },
  }
})
