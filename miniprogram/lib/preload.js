const tempFilePaths = {}

export default class Preload {
  init(images = []) {
    return new Promise((resolve, reject) => {
      const len = images.length
      let count = 0
      images.forEach(image => {
        if (tempFilePaths[image]) {
          console.log('image 已存在')
          count++
          if (count === len) {
            resolve(tempFilePaths)
          }
        }

        wx.downloadFile({
          url: image,
          success: res => {
            const {tempFilePath} = res
            tempFilePaths[image] = tempFilePath
          },
          fail: err => {
            tempFilePaths[image] = ''
          },
          complete: () => {
            count++
            if (count === len) {
              resolve(tempFilePaths)
            }
          },
        })
      })
    })
  }
}
