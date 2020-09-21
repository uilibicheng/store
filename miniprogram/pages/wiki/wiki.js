import router from '../../lib/router'
import device from '../../lib/device'
import baas from '../../lib/baas'
import format from '../../lib/format'
import io from '../../io/index'
import * as constants from '../../config/constants'

const app = getApp()

const simpleClone = obj => JSON.parse(JSON.stringify(obj))

let _getArticelLocked = false

Component({
  properties: {
  },


  data: {
    statusBarHeight: device.getStatusBarHeight(),
    navBarHeight: device.getNavbarHeight(),
    isStoreUser: app.globalData.isStoreUser,

    wikiType: 'outfit', // outfit、product、picture
    showFilter: false,
    offset: 0,
    articleList: [],
    showNoData: false,

    categoryList: [],
    categoryName: {}, // 所有类型名字 Map {id: name}

    parentCategory: [], // 拥有二级选项的一级条件
    curParentCategory: {}, // 选中的一级条件

    childrenCategory: [], // 根据选中的一级条件显示的二级条件
    curChildrenCategory: [], // 选中的二级条件 list，用于渲染已选条件栏
    curChildrenCategoryMap: {}, // 选中的二级条件 map，用于样式渲染 {id: name}
    modifiedChildrenCategory: [], // 编辑状态
    modifiedChildrenCategoryMap: {},  // 编辑状态
  },

  methods: {
    onLoad() {
      this.getArticleCategory()
      if (baas.isLogin()) {
        this.setData({
          isStoreUser: app.globalData.isStoreUser,
        })
      } else {
        baas.authLogin().then(user => {
          this.setData({
            isStoreUser: !!user.is_store_user,
          })
        })
      }
    },

    getArticleCategory() {
      wx.showLoading({mask: true})
      return io.getArticleCategory(this.data.wikiType).then(res => {
        console.log('getArticleCategory', res.data.objects)
        // if (res.data.objects.length === 0)  wx.hideLoading()
        // 1. 生成类型名 map
        let categoryName = {}
        res.data.objects.forEach(item => {
          categoryName[item.id] = item.name
        })
        console.log('categoryName', categoryName)

        // 2. 生成一级条件列表
        let parentCategory = res.data.objects.filter(item => {
          const filterIndex = res.data.objects.findIndex(sitem => {
            return !!sitem.pid && sitem.pid === item.id
          })
          return !item.pid && filterIndex !== (-1)
        })
        // if (parentCategory.length === 0)  wx.hideLoading()
        console.log('parentCategory', parentCategory)

        // 3. 初始化二级列表
        let childrenCategory = res.data.objects.filter(item => {
          return !!item.pid && item.pid === parentCategory[0].id
        })
        console.log('childrenCategory', childrenCategory)

        // 4. 设置 categoryList、categoryName，parentCategory，清空其他条件
        this.setData({
          categoryList: res.data.objects,
          categoryName,
          parentCategory,
          curParentCategory: parentCategory[0] || {},
          childrenCategory,
          curChildrenCategory: [],
          curChildrenCategoryMap: {},
          modifiedChildrenCategory: [],
          modifiedChildrenCategoryMap: {},
        }, () => {
          wx.hideLoading()
          this.getArticleList()
        })

      })
    },

    getArticleList() {
      wx.showLoading({mask: true})
      _getArticelLocked = true
      const {offset, wikiType, curChildrenCategory} = this.data
      let params = {
        offset,
        type: wikiType,
      }
      if (curChildrenCategory.length > 0) {
        params.category = curChildrenCategory.map(item => {
          return item.id
        })
      }
      return io.getArticleList(params).then(res => {
        if (wikiType !== 'picture') {
          const dataList = res.data.objects.map(item => {
            item.created_at_format = format.formatDate(item.created_at, 'YYYY-MM-DD')
            return item
          })
          this.setData({
            articleList: offset === 0 ? dataList : this.data.articleList.concat(dataList),
            showNoData: dataList.length === 0,
          }, () => {
            _getArticelLocked = !res.data.meta.next
            wx.hideLoading()
          })
        } else {
          this.setData({
            showNoData: res.data.objects.length === 0,
          })
          if (res.data.objects.length === 0) {
            wx.hideLoading()
            return
          }
          this.renderPicture(res.data.objects)
          _getArticelLocked = !res.data.meta.next
        }
      })
    },

    renderPicture(dataList) {
      const data = dataList.shift()
      Promise.all([this.calcElementHeight('#leftList'), this.calcElementHeight('#rightList')])
        .then(heightRes => {
          const leftHeight = heightRes[0]
          const rightHeight = heightRes[1]
          let articleList = simpleClone(this.data.articleList)
          if (leftHeight <= rightHeight) {
            articleList[0].push(data)
          } else {
            articleList[1].push(data)
          }
          this.setData({
            articleList,
          }, () => {
            if (dataList.length > 0) this.renderPicture(dataList)
            else wx.hideLoading()
          })
        })
    },

    calcElementHeight(id) {
      return new Promise((resolve, reject) => {
        let query = wx.createSelectorQuery()
        query.select(id).boundingClientRect()
        query.exec(res => {
          console.log(id, parseInt(res[0].height))
          resolve(parseInt(res[0].height))
        })
      })
    },

    onScrollToLower() {
      if (_getArticelLocked) return
      _getArticelLocked = true
      console.log('onScrollToLower')
      this.setData({
        offset: this.data.offset + 20,
      }, this.getArticleList)
    },

    handleFilterShow() {
      const {
        showFilter,
        curChildrenCategory,
        curChildrenCategoryMap
      } = this.data
      if (!showFilter) {
        // 显示筛选栏的时候，初始化 modified 条件
        this.setData({
          modifiedChildrenCategory: curChildrenCategory,
          modifiedChildrenCategoryMap: curChildrenCategoryMap,
        })
      }
      this.setData({
        showFilter: !showFilter,
      })
    },

    switchWikiType(e) {
      const {type} = e.currentTarget.dataset
      if (this.data.wikiType === type) return
      this.setData({
        articleList: type !== 'picture' ? [] : [[], []],
        showNoData: false,
        showFilter: false,
        offset: 0,
        wikiType: type,
        curChildrenCategory: [],
      }, () => {
        this.getArticleCategory()
      })
    },

    deleteSelectedCategory(e) {
      const {index} = e.currentTarget.dataset
      let curChildrenCategory = simpleClone(this.data.curChildrenCategory)
      let curChildrenCategoryMap = simpleClone(this.data.curChildrenCategoryMap)
      delete curChildrenCategoryMap[curChildrenCategory[index].id]
      curChildrenCategory.splice(index, 1)
      this.setData({
        curChildrenCategory,
        curChildrenCategoryMap,
        showNoData: false,
        showFilter: false,
        offset: 0,
        articleList: this.data.wikiType !== 'picture' ? [] : [[], []],
      }, () => {
        this.getArticleList()
      })
    },

    switchParentCategory(e) {
      const {index} = e.currentTarget.dataset
      let curParentCategory = this.data.parentCategory[index]
      let childrenCategory = this.data.categoryList.filter(item => {
        return !!item.pid && item.pid === curParentCategory.id
      })
      console.log('childrenCategory', childrenCategory)
      this.setData({
        curParentCategory,
        childrenCategory,
      })
    },

    handleChildrenCategoryClicked(e) {
      const {index} = e.currentTarget.dataset
      // 反按
      if (this.data.wikiType !== 'picture') {
        if (this.data.curChildrenCategory[0] && this.data.curChildrenCategory[0].id === this.data.childrenCategory[index].id) return
        this.setData({
          curChildrenCategory: [this.data.childrenCategory[index]],
          curChildrenCategoryMap: {
            [this.data.childrenCategory[index].id]: this.data.childrenCategory[index].name,
          },
          showNoData: false,
          showFilter: false,
          offset: 0,
          articleList: [],
        }, () => {
          this.getArticleList()
        })
      } else {
        let modifiedChildrenCategory = simpleClone(this.data.modifiedChildrenCategory)
        let modifiedChildrenCategoryMap = simpleClone(this.data.modifiedChildrenCategoryMap)
        const findIndex = modifiedChildrenCategory.findIndex(item => {
          return item.id === this.data.childrenCategory[index].id
        })
        if (findIndex === (-1)) {
          modifiedChildrenCategory.push(this.data.childrenCategory[index])
          modifiedChildrenCategoryMap[this.data.childrenCategory[index].id] = this.data.childrenCategory[index].name
        } else {
          modifiedChildrenCategory.splice(findIndex, 1)
          delete modifiedChildrenCategoryMap[this.data.childrenCategory[index].id]
        }
        this.setData({
          modifiedChildrenCategory,
          modifiedChildrenCategoryMap,
        })
      }
    },

    handleFilterBtnClicked() {
      this.setData({
        curChildrenCategory: this.data.modifiedChildrenCategory,
        curChildrenCategoryMap: this.data.modifiedChildrenCategoryMap,
        showNoData: false,
        showFilter: false,
        offset: 0,
        articleList: [[], []],
      }, () => {
        this.getArticleList()
      })
    },

    navToAritcle(e) {
      const {index} = e.currentTarget.dataset
      app.globalData.articleInfo = this.data.articleList[index]
      router.push({
        name: 'wiki-article',
      })
    },

    navToPicture(e) {
      const {list, index} = e.currentTarget.dataset
      app.globalData.articleInfo = this.data.articleList[list][index]
      app.globalData.tagName = this.data.categoryName
      router.push({
        name: 'wiki-picture',
      })
    },

    noop() {},
  }
})
