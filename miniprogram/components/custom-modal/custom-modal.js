Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    title: {
      type: String,
      value: '',
    },
    content: {
      type: String,
      value: '',
    },
    type: {
      type: Number,
      value: 0,
    },
    contentAlignLeft: {
      type: Boolean,
      value: false,
    },
  },

  data: {},

  methods: {
    test: function(e) {
      console.log('move', e)
    },
  },
})
