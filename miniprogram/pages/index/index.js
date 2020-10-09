import io from '../../io/index'
Component({
  properties: {},

  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    bannerList: [],
    searchValue: '',
    programList: [],
    merchantList: []
  },

  methods: {
    onLoad(options) {
      this.getBannerLists()
      this.getProgramLists()
      this.getMerchantLists()
    },
    onShow() {},
    getBannerLists() {
      return io.getBannerList().then(res => {
        this.setData({
          bannerList: res.data.objects
        })
      })
    },
    getProgramLists() {
      return io.getProgramList().then(res => {
        this.setData({
          programList: res.data.objects
        })
      })
    },
    getMerchantLists() {
      const tempMoney = {
        0: '100以下',
        1: '100-200',
        2: '200-300',
        3: '300以上'
      }
      return io.getMerchantList().then(res => {
        res.data.objects.forEach(item => {
          item.consumption_person_money = tempMoney[item.consumption_person]
        })
        this.setData({
          merchantList: res.data.objects
        })
      })
    }
  }
})