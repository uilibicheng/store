import io from '../../io/index'
Component({
  properties: {
  },

  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    bannerList: [],
    searchValue:'',
    programList:[]
  },

  methods: {
    onLoad(options) {
      this.getBannerLists()
      this.getProgramLists()
    },
    onShow() {
    },
    getBannerLists(){
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
    }
  }
})
