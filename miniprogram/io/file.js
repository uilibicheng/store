
const getFileObject = () => new wx.BaaS.File()

export default {
  uploadImage(rawFilePaths, categoryName = '') {
    return Promise.all(rawFilePaths.map(item => {
      let fileParams = {filePath: item}
      let metaData = {categoryName}
      return getFileObject().upload(fileParams, metaData)
    })).then(res => {
      // console.log('uploadImage', res)
      const resList = res.map(item => {
        return item.data.file.path
      })
      return resList
    })
  },
}