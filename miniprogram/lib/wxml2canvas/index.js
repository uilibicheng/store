/**
 * 基于 wxml2canvas 修改
 * https://github.com/wg-front/wxml2canvas
 */

import Util from './util'

const imageMode = [
  'scaleToFill',
  'aspectFit',
  'aspectFill',
  'widthFix',
  'top',
  'bottom',
  'center',
  'left',
  'right',
  'top left',
  'top right',
  'bottom left',
  'bottom right',
]

class Wxml2Canvas {
  constructor(options = {}) {
    this.device = (wx.getSystemInfoSync && wx.getSystemInfoSync()) || {}

    if (!options.zoom) {
      this.zoom = this.device.windowWidth / 375
    } else {
      this.zoom = options.zoom || 1
    }

    this.element = options.element
    this.context = options.context
    this.width = options.width * this.zoom || 0
    this.height = options.height * this.zoom || 0
    this.destZoom = options.destZoom || 3
    this.destWidth = this.width * this.destZoom
    this.destHeight = this.height * this.destZoom
    this.translateX = options.translateX * this.zoom || 0
    this.translateY = options.translateY * this.zoom || 0
    this.gradientBackground = options.gradientBackground || null
    this.background = options.background || '#ffffff'
    this.finishDraw = options.finish || function finish(params) {}
    this.errorHandler = options.error || function error(params) {}
    this.progress = options.progress || function progress(params) {}
    this.textAlign = options.textAlign || 'left'
    this.fullText = options.fullText || false
    this.font = options.font || '14px PingFang SC'

    this._init()
  }

  draw(data = {}, that) {
    const self = this
    this.data = data
    this.fef = that

    this.progress(10)
    this._preloadImage(data.list)
      .then(result => {
        this.progress(30)
        self._draw()
      })
      .catch(res => {
        self.errorHandler(res)
      })
  }

  measureWidth(text, font) {
    if (font) {
      this.ctx.font = font
    }
    const res = this.ctx.measureText(text) || {}
    return res.width || 0
  }

  _init() {
    this.progressPercent = 0 // 绘制进度百分比
    this.data = null
    this.ref = null
    this.allPic = []
    this.screenList = []
    this.asyncList = []
    this.imgUrl = ''
    this.progressPercent = 0
    this.distance = 0
    this.progress(0)

    this.ctx = wx.createCanvasContext(this.element, this.context)
    this.ctx.font = this.font
    this.ctx.setTextBaseline('top')
    this.ctx.setStrokeStyle('white')

    this.debug = this.device.platform === 'devtools'

    this._drawBakcground()
  }

  _drawBakcground() {
    if (this.gradientBackground) {
      const line = this.gradientBackground.line || [0, 0, 0, this.height]
      const color = this.gradientBackground.color || ['#fff', '#fff']
      const style = {fill: {line, color}}
      this._drawRectToCanvas(0, 0, this.width, this.height, style)
    } else {
      const style = {fill: this.background}
      this._drawRectToCanvas(0, 0, this.width, this.height, style)
    }
  }

  _draw() {
    const self = this
    let list = this.data.list || []
    let index = 0
    const all = []
    let count = 0

    list.forEach(item => {
      if (item.type === 'wxml') {
        count += 3
      } else {
        count += 1
      }
    })

    this.distance = 60 / (count || 1) // 进度条的间距
    this.progressPercent = 30
    this.asyncList = list.filter(item => item.delay == true)
    list = list.filter(item => item.delay != true)
    drawList(list)

    Promise.all(all)
      .then(results => {
        index = 0
        drawList(self.asyncList, true)

        Promise.all(all).then(results => {
          self.progress(90)
          setTimeout(() => {
            self._saveCanvasToImage()
          }, 0)
        })
      })
      .catch(e => {
        console.log('_draw err', e)
        self.errorHandler(e)
      })

    function drawList(list = [], noDelay) {
      list.forEach((item, i) => {
        all[index++] = new Promise((resolve, reject) => {
          const attr = item.style
          item.progress = self.distance
          if (noDelay) {
            item.delay = 0
          }
          if (item.type === 'radius-image') {
            self._drawCircle(item, attr, resolve, reject, 'image')
          } else if (item.type === 'text') {
            self._drawText(item, attr, resolve, reject)
          } else if (item.type === 'line') {
            self._drawLine(item, attr, resolve, reject)
          } else if (item.type === 'circle') {
            self._drawCircle(item, attr, resolve, reject)
          } else if (item.type === 'rect') {
            self._drawRect(item, attr, resolve, reject)
          } else if (item.type === 'image') {
            self._drawRect(item, attr, resolve, reject, 'image')
          } else if (item.type === 'wxml') {
            self._drawWxml(item, attr, resolve, reject)
          } else {
            resolve()
          }
        })
      })
    }
  }

  _saveCanvasToImage() {
    const self = this

    // 延时保存有两个原因，一个是等待绘制delay的元素，另一个是安卓上样式会错乱
    setTimeout(
      () => {
        self.progress(95)

        const obj = {
          x: 0,
          y: 0,
          width: self.width,
          height: self.height,
          canvasId: self.element,
          fileType: 'jpg',
          quality: 1,
          success: function(res) {
            self.progress(100)
            self.imgUrl = res.tempFilePath
            self.finishDraw(self.imgUrl)
          },
          fail: function(res) {
            self.errorHandler({errcode: 1000, errmsg: 'save canvas error', e: res})
          },
        }

        if (self.destZoom !== 3) {
          obj.destWidth = self.destWidth
          obj.destHeight = self.destHeight
        }

        wx.canvasToTempFilePath(obj, self.context)
      },
      self.device.system.indexOf('iOS') === -1 ? 300 : 100
    )
  }

  _preloadImage(list = []) {
    const self = this
    const all = []
    let count = 0

    function imageInfo(target, url, resolve, reject) {
      wx.getImageInfo({
        src: url,
        success(res) {
          const index = self._findPicIndex(target)
          if (index > -1) {
            self.allPic[index].local = url
            self.allPic[index].width = res.width
            self.allPic[index].height = res.height
          }
          resolve({tempFilePath: url})
        },
        fail(err) {
          reject(err)
        },
      })
    }

    list.forEach((item, i) => {
      if (item.url && self._findPicIndex(item.url) === -1) {
        // 避免重复下载同一图片
        self.allPic.push({
          url: item.url,
          local: '',
        })
        all[count++] = new Promise((resolve, reject) => {
          // 非http(s)域名的就不下载了
          if (
            !/^http/.test(item.url) ||
            /^http:\/\/(tmp)|(usr)\//.test(item.url) ||
            /^http:\/\/127\.0\.0\.1/.test(item.url)
          ) {
            if (item.isBase64) {
              const fileManager = wx.getFileSystemManager()

              fileManager.writeFile({
                filePath: item.url,
                data: item.isBase64.replace(/data:image\/(.*);base64,/, ''),
                encoding: 'base64',
                success(res) {
                  imageInfo(item.url, item.url, resolve, reject)
                },
                fail(res) {
                  reject(res)
                },
              })
            } else {
              imageInfo(item.url, item.url, resolve, reject)
            }
          } else {
            wx.downloadFile({
              url: item.url.replace(/^https?/, 'https'),
              success(res) {
                wx.getImageInfo({
                  src: item.url,
                  success(img) {
                    const index = self._findPicIndex(item.url)
                    if (index > -1) {
                      self.allPic[index].local = res.tempFilePath
                      self.allPic[index].width = img.width
                      self.allPic[index].height = img.height
                    }
                    resolve({tempFilePath: item.url})
                  },
                  fail(err) {
                    reject(err)
                  },
                })
              },
              fail: res => {
                reject({errcode: 1001, errmsg: 'download pic error'}) // eslint-disable-line
              },
            })
          }
        })
      }
    })

    return Promise.all(all)
  }

  _findPicIndex(url) {
    const index = this.allPic.findIndex(pic => pic.url === url)
    return index
  }

  _drawRect(item, style, resolve, reject, isImage, isWxml) {
    const zoom = this.zoom
    let leftOffset = 0
    const topOffset = 0
    let width = style.width
    let height = style.height
    let imgWidth = style.width
    let imgHeight = style.height
    let mode = null

    try {
      item.x = this._resetPositionX(item, style)
      item.y = this._resetPositionY(item, style)

      let url
      if (isImage) {
        const index = this._findPicIndex(item.url)
        if (index > -1) {
          url = this.allPic[index].local
          imgWidth = this.allPic[index].width
          imgHeight = this.allPic[index].height
        } else {
          url = item.url
        }
      }

      style.padding = style.padding || []
      if (isWxml === 'inline-wxml') {
        item.x = item.x + ((style.padding[3] && style.padding[3]) || 0)
        item.y = item.y + ((style.padding[0] && style.padding[0]) || 0)
      }

      leftOffset = item.x + style.width + ((style.padding[1] && style.padding[1]) || 0)

      if (!isWxml) {
        width = width * zoom
        height = height * zoom
      }

      if (style.dataset && style.dataset.mode && imageMode.indexOf(style.dataset.mode) > -1) {
        mode = {
          type: style.dataset.mode,
          width: imgWidth,
          height: imgHeight,
        }
      }

      this._drawRectToCanvas(item.x, item.y, width, height, style, url, mode)
      this._updateProgress(item.progress)

      if (resolve) {
        resolve()
      } else {
        return {
          leftOffset,
          topOffset,
        }
      }
    } catch (e) {
      reject && reject({errcode: isImage ? 1003 : 1002, errmsg: isImage ? 'drawImage error' : 'drawRect error', e})
    }
  }

  _drawRectToCanvas(x, y, width, height, style, url, mode) {
    let {fill, border, boxShadow, borderRadius} = style
    borderRadius = parseInt(borderRadius)
    const _border = Util.transferBorder(border) || {width: 0}

    this.ctx.save()
    this._drawBoxShadow(boxShadow, boxShadow => {
      // 真机上填充渐变色时，没有阴影，先画个相等大小的纯色矩形来实现阴影
      if (fill && typeof fill !== 'string' && !this.debug) {
        this.ctx.setFillStyle(boxShadow.color || '#ffffff')
        this.ctx.fillRect(x, y, width, height)
      }
    })

    this._clipRadius(x, y, width, height, _border, borderRadius)

    if (url) {
      // 开发者工具有bug，先不裁剪
      if (mode) {
        this._resetImageByMode(url, x + _border.width, y + _border.width, width, height, mode)
      } else {
        console.log('drawImage', url)
        this.ctx.drawImage(url, x + _border.width, y + _border.width, width, height)
      }
    } else {
      this._setFill(fill, () => {
        this.ctx.fillRect(x + _border.width, y + _border.width, width, height)
      })
    }
    this.ctx.restore()
    this.ctx.save()

    if (_border && _border.width) {
      this._drawBorder(border, style, border => {
        this._drawRadiusBorder(x, y, width, height, _border, borderRadius)
      })
    }

    this.ctx.draw(true)
    this.ctx.restore()
  }

  _clipRadius(x, y, width, height, border, radius = 0) {
    if (!border) border = {width: 0}
    if (!radius) radius = 0

    const ctx = this.ctx
    ctx.setLineWidth(border.width)

    const fixBorder = border.width / 2
    const leftTop = {x, y}

    const rightTop = {x: x + width + 2 * border.width, y}

    const rightBottom = {x: x + width + 2 * border.width, y: y + height + 2 * border.width}

    const leftBottom = {x, y: y + height + 2 * border.width}

    ctx.beginPath()
    if (radius === width) {
      ctx.arc(leftTop.x + radius / 2, y + radius / 2, radius / 2, 0, 2 * Math.PI)
    } else {
      ctx.moveTo(leftTop.x + fixBorder, y + radius)
      ctx.arc(leftTop.x + radius, y + radius, radius - fixBorder, Util.deg2Rad(180), Util.deg2Rad(270))

      ctx.lineTo(rightTop.x - radius, rightTop.y + fixBorder)
      ctx.arc(rightTop.x - radius, rightTop.y + radius, radius - fixBorder, Util.deg2Rad(270), Util.deg2Rad(360))

      ctx.lineTo(rightBottom.x - fixBorder, rightBottom.y - radius)
      ctx.arc(rightBottom.x - radius, rightBottom.y - radius, radius - fixBorder, Util.deg2Rad(0), Util.deg2Rad(90))

      ctx.lineTo(leftBottom.x + radius, leftBottom.y - fixBorder)
      ctx.arc(leftBottom.x + radius, leftBottom.y - radius, radius - fixBorder, Util.deg2Rad(90), Util.deg2Rad(180))

      ctx.lineTo(leftTop.x + fixBorder, y + radius)
    }
    ctx.closePath()
    ctx.setStrokeStyle('rgba(0, 0, 0, 0)')
    ctx.stroke()
    ctx.clip()
  }

  // 创建矩形路径
  _drawRadiusBorder(x, y, width, height, border, radius) {
    if (!border) border = {width: 0}
    if (!radius) radius = 0
    this.ctx.setStrokeStyle(border.color)
    this.ctx.setLineWidth(border.width)
    this.ctx.setLineJoin('miter')
    const ctx = this.ctx
    const fixBorder = border.width / 2
    const leftTop = {x, y}

    const rightTop = {x: x + width + 2 * border.width, y}

    const rightBottom = {x: x + width + 2 * border.width, y: y + height + 2 * border.width}

    const leftBottom = {x, y: y + height + 2 * border.width}

    ctx.beginPath()
    if (radius === width) {
      ctx.arc(leftTop.x + radius / 2, y + radius / 2, radius / 2, 0, 2 * Math.PI)
    } else {
      ctx.moveTo(leftTop.x + fixBorder, y + radius)
      ctx.arc(leftTop.x + radius, y + radius, radius - fixBorder, Util.deg2Rad(180), Util.deg2Rad(270))

      ctx.lineTo(rightTop.x - radius, rightTop.y + fixBorder)
      ctx.arc(rightTop.x - radius, rightTop.y + radius, radius - fixBorder, Util.deg2Rad(270), Util.deg2Rad(360))

      ctx.lineTo(rightBottom.x - fixBorder, rightBottom.y - radius)
      ctx.arc(rightBottom.x - radius, rightBottom.y - radius, radius - fixBorder, Util.deg2Rad(0), Util.deg2Rad(90))

      ctx.lineTo(leftBottom.x + radius, leftBottom.y - fixBorder)
      ctx.arc(leftBottom.x + radius, leftBottom.y - radius, radius - fixBorder, Util.deg2Rad(90), Util.deg2Rad(180))

      ctx.lineTo(leftTop.x + fixBorder, y + radius)
    }
    ctx.closePath()
    ctx.stroke()
  }

  _resetImageByMode(url, x, y, width, height, mode) {
    const self = this
    let offsetX = 0
    let offsetY = 0
    let imgWidth = mode.width
    let imgHeight = mode.height

    switch (mode.type) {
      case 'scaleToFill':
        imgWidth = width
        imgHeight = height
        self.ctx.drawImage(url, x, y, width, height)
        break
      case 'widthFix':
        height = width / ((imgWidth || 1) / (imgHeight || 1))
        self.ctx.drawImage(url, x, y, width, height)
        break
      case 'aspectFit':
        if (imgWidth > imgHeight) {
          const realHeight = width / ((imgWidth || 1) / (imgHeight || 1))
          offsetY = -(height - realHeight) / 2
          imgWidth = width
          imgHeight = realHeight
        } else {
          const realWidth = height / ((imgHeight || 1) / (imgWidth || 1))
          offsetX = -(width - realWidth) / 2
          imgWidth = realWidth
          imgHeight = height
        }

        _clip()
        break
      case 'aspectFill':
        if (imgWidth > imgHeight) {
          const realWidth = imgWidth / ((imgHeight || 1) / (height || 1))
          offsetX = (realWidth - width) / 2
          imgWidth = realWidth
          imgHeight = height
        } else {
          const realHeight = imgHeight / ((imgWidth || 1) / (width || 1))
          offsetY = (realHeight - height) / 2
          imgWidth = width
          imgHeight = realHeight
        }

        _clip()
        break
      case 'top left':
        _clip()
        break
      case 'top':
        offsetX = (mode.width - width) / 2
        _clip()
        break
      case 'top right':
        offsetX = mode.width - width
        _clip()
        break
      case 'left':
        offsetY = (mode.height - height) / 2
        _clip()
        break
      case 'center':
        offsetX = (mode.width - width) / 2
        offsetY = (mode.height - height) / 2
        _clip()
        break
      case 'right':
        offsetX = mode.width - width
        offsetY = (mode.height - height) / 2
        _clip()
        break
      case 'bottom left':
        offsetY = mode.height - height
        _clip()
        break
      case 'bottom':
        offsetX = (mode.width - width) / 2
        offsetY = mode.height - height
        _clip()
        break
      case 'bottom right':
        offsetX = mode.width - width
        offsetY = mode.height - height
        _clip()
        break
      default:
        imgWidth = width
        imgHeight = height
        break
    }

    function _clip() {
      self.ctx.save()
      self.ctx.beginPath()
      self.ctx.rect(x, y, width, height)
      self.ctx.clip()
      self.ctx.drawImage(url, x - offsetX, y - offsetY, imgWidth, imgHeight)
      self.ctx.closePath()
      self.ctx.restore()
    }
  }

  _drawText(item, style, resolve, reject, type, isWxml) {
    const zoom = this.zoom
    let leftOffset = 0
    let topOffset = 0

    try {
      style.fontSize = this._parseNumber(style.fontSize)
      const fontSize = Math.ceil((style.fontSize || 14) * zoom)
      this.ctx.setTextBaseline('top')
      this.ctx.font = `${style.fontWeight ? style.fontWeight : 'normal'} ${fontSize}px ${style.fontFamily ||
        'PingFang SC'}`
      this.ctx.setFillStyle(style.color || '#454545')

      let text = item.text || ''
      let textWidth = Math.floor(this.measureWidth(text, style.font || this.ctx.font))
      const lineHeight = this._getLineHeight(style)
      const textHeight = Math.ceil(textWidth / (style.width || textWidth)) * lineHeight
      let width = Math.ceil((style.width || textWidth) * (!isWxml ? zoom : 1))
      const whiteSpace = style.whiteSpace || 'wrap'
      let x = 0
      let y = 0

      if (typeof style.padding === 'string') {
        style.padding = Util.transferPadding(style.padding)
      }
      item.x = this._resetPositionX(item, style)
      item.y = this._resetPositionY(item, style, textHeight)
      this._drawBoxShadow(style.boxShadow)

      if (style.background || style.border) {
        this._drawTextBackgroud(item, style, textWidth, textHeight, isWxml)
      }

      // 行内文本
      if (type === 'inline-text') {
        width = item.maxWidth
        if (item.leftOffset + textWidth > width) {
          // 如果上一个行内元素换行了，这个元素要继续在后面补足一行
          let lineNum = Math.max(Math.floor(textWidth / width), 1)
          const length = text.length
          const singleLength = Math.floor(length / lineNum)
          const widthOffset = item.leftOffset ? item.leftOffset - item.originX : 0
          let {endIndex: currentIndex, single, singleWidth} = this._getTextSingleLine(
            text,
            width,
            singleLength,
            0,
            widthOffset
          )
          x = this._resetTextPositionX(item, style, singleWidth)
          y = this._resetTextPositionY(item, style)
          this.ctx.fillText(single, x, y)
          leftOffset = x + singleWidth
          topOffset = y

          // 去除第一行补的内容，然后重置
          text = text.substring(currentIndex, text.length)
          currentIndex = 0
          lineNum = Math.max(Math.floor(textWidth / width), 1)
          textWidth = Math.floor(this.measureWidth(text, style.font || this.ctx.font))
          item.x = item.originX // 还原换行后的x
          for (let i = 0; i < lineNum; i++) {
            const {endIndex, single, singleWidth} = this._getTextSingleLine(text, width, singleLength, currentIndex)
            currentIndex = endIndex
            if (single) {
              x = this._resetTextPositionX(item, style, singleWidth, width)
              y = this._resetTextPositionY(item, style, i + 1)
              this.ctx.fillText(single, x, y)
              if (i === lineNum - 1) {
                leftOffset = x + singleWidth
                topOffset = lineHeight * lineNum
              }
            }
          }

          const last = text.substring(currentIndex, length)
          const lastWidth = this.measureWidth(last)

          if (last) {
            x = this._resetTextPositionX(item, style, lastWidth, width)
            y = this._resetTextPositionY(item, style, lineNum + 1)
            this.ctx.fillText(last, x, y)
            leftOffset = x + lastWidth
            topOffset = lineHeight * (lineNum + 1)
          }
        } else {
          x = this._resetTextPositionX(item, style, textWidth, width)
          y = this._resetTextPositionY(item, style)
          this.ctx.fillText(item.text, x, y)
          leftOffset = x + textWidth
          topOffset = lineHeight
        }
      } else {
        // block文本，如果文本长度超过宽度换行
        if (width && textWidth > width && whiteSpace !== 'nowrap') {
          let lineNum = Math.max(Math.floor(textWidth / width), 1)
          const length = text.length
          const singleLength = Math.floor(length / lineNum)
          let currentIndex = 0

          // lineClamp参数限制最多行数
          if (style.lineClamp && lineNum + 1 > style.lineClamp) {
            lineNum = style.lineClamp - 1
          }

          for (let i = 0; i < lineNum; i++) {
            const {endIndex, single, singleWidth} = this._getTextSingleLine(text, width, singleLength, currentIndex)
            currentIndex = endIndex
            x = this._resetTextPositionX(item, style, singleWidth, width)
            y = this._resetTextPositionY(item, style, i)
            this.ctx.fillText(single, x, y)
          }

          // 换行后剩余的文字，超过一行则截断增加省略号
          let last = text.substring(currentIndex, length)
          let lastWidth = this.measureWidth(last)
          if (lastWidth > width) {
            const {single, singleWidth} = this._getTextSingleLine(last, width, singleLength)
            lastWidth = singleWidth
            last = single.substring(0, single.length - 1) + '...'
          }

          x = this._resetTextPositionX(item, style, lastWidth, width)
          y = this._resetTextPositionY(item, style, lineNum)
          this.ctx.fillText(last, x, y)
        } else {
          x = this._resetTextPositionX(item, style, textWidth, width)
          y = this._resetTextPositionY(item, style)
          this.ctx.fillText(item.text, x, y)
        }
      }

      this.ctx.draw(true)

      this._updateProgress(item.progress)

      if (resolve) {
        resolve()
      } else {
        return {
          leftOffset,
          topOffset,
        }
      }
    } catch (e) {
      reject && reject({errcode: 1004, errmsg: 'drawText error', e: e})
    }
  }

  _drawTextBackgroud(item, style, textWidth, textHeight, isWxml) {
    if (!style.width) return
    const zoom = isWxml ? 1 : this.zoom
    let width = style.width || textWidth
    let height = style.height || textHeight
    const rectStyle = {
      fill: style.background,
      border: style.border,
    }
    style.padding = style.padding || [0, 0, 0, 0]
    width += (style.padding[1] || 0) + (style.padding[3] || 0)
    height += (style.padding[0] || 0) + (style.padding[2] || 0)
    width = width * zoom
    height = height * zoom
    this._drawRectToCanvas(item.x, item.y, width, height, rectStyle)
  }

  _drawCircle(item, style, resolve, reject, isImage, isWxml) {
    const zoom = this.zoom
    let r = style.r
    try {
      item.x = this._resetPositionX(item, style)
      item.y = this._resetPositionY(item, style)

      let url

      if (isImage) {
        // url = item.url
        const index = this._findPicIndex(item.url)
        url = this.allPic[index].local
      }

      if (!isWxml) {
        r = r * zoom
      }

      this._drawCircleToCanvas(item.x, item.y, r, style, url)

      this._updateProgress(item.progress)
      resolve && resolve()
    } catch (e) {
      reject &&
        reject({errcode: isImage ? 1006 : 1005, errmsg: isImage ? 'drawCircleImage error' : 'drawCircle error', e})
    }
  }

  _drawCircleToCanvas(x, y, r, style, url) {
    const {fill, border, boxShadow} = style

    this.ctx.save()

    this._drawBoxShadow(boxShadow, res => {
      // 真机上填充渐变色时，没有阴影，先画个相等大小的纯色矩形来实现阴影
      if ((fill && typeof fill !== 'string') || (url && res.color)) {
        this.ctx.setFillStyle(res.color || '#ffffff')
        this.ctx.beginPath()
        this.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI)
        this.ctx.closePath()
        this.ctx.fill()
      }
    })

    this.ctx.restore()

    if (url) {
      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI)
      this.ctx.closePath()
      this.ctx.clip()
      this.ctx.drawImage(url, x, y, r * 2, r * 2)
      this.ctx.draw(true)
      this.ctx.restore()
    } else {
      this._setFill(fill, () => {
        this.ctx.beginPath()
        this.ctx.arc(x + r, y + r, r, 0, 2 * Math.PI)
        this.ctx.closePath()
        this.ctx.fill()
      })
    }

    this._drawBorder(border, style, border => {
      this.ctx.beginPath()
      this.ctx.arc(x + r, y + r, r + border.width / 2, 0, 2 * Math.PI)
      this.ctx.closePath()
      this.ctx.stroke()
    })

    this.ctx.draw(true)
    this.ctx.restore()
  }

  _drawLine(item, style, resolve, reject, isWxml) {
    const zoom = this.zoom
    try {
      const x1 = item.x * zoom + this.translateX
      const y1 = item.y * zoom + this.translateY
      const x2 = item.x2 * zoom + this.translateX
      const y2 = item.y2 * zoom + this.translateY
      this._drawLineToCanvas(x1, y1, x2, y2, style)

      this._updateProgress(item.progress)
      resolve && resolve()
    } catch (e) {
      reject && reject({errcode: 1007, errmsg: 'drawLine error', e})
    }
  }

  _drawLineToCanvas(x1, y1, x2, y2, style) {
    const {stroke, dash, boxShadow} = style

    this.ctx.save()
    if (stroke) {
      this._setStroke(stroke)
    }

    this._drawBoxShadow(boxShadow)

    if (dash) {
      const dash = [style.dash[0] || 5, style.dash[1] || 5]
      const offset = style.dash[2] || 0
      this.ctx.setLineDash(dash, offset || 0)
    }

    this.ctx.moveTo(x1, y1)
    this.ctx.setLineWidth((style.width || 1) * this.zoom)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
    this.ctx.draw(true)
    this.ctx.restore()
  }

  _drawWxml(item, style, resolve, reject) {
    const self = this
    let all = []
    try {
      this._getWxml(item, style).then(results => {
        // 上 -> 下
        const sorted = self._sortListByTop(results[0])
        let count = 0
        let progress = 0
        Object.keys(sorted).forEach(item => {
          count += sorted[item].length
        })
        progress = (this.distance * 3) / (count || 1)

        all = this._drawWxmlBlock(item, sorted, all, progress, results[1])
        all = this._drawWxmlInline(item, sorted, all, progress, results[1])

        Promise.all(all)
          .then(results => {
            resolve && resolve()
          })
          .catch(e => {
            reject && reject(e)
          })
      })
    } catch (e) {
      reject && reject({errcode: 1008, errmsg: 'drawWxml error'})
    }
  }

  _drawWxmlBlock(item, sorted, all, progress, results) {
    const self = this
    // 用来限定位置范围，取相对位置
    const limitLeft = results ? results.left : 0
    const limitTop = results ? results.top : 0
    Object.keys(sorted).forEach((top, topIndex) => {
      // 左 -> 右
      let list = sorted[top].sort((a, b) => {
        return a.left - b.left
      })

      list = list.filter(sub => sub.dataset.type && sub.dataset.type.indexOf('inline') === -1)

      list.forEach((sub, index) => {
        all[index] = new Promise((resolve, reject) => {
          sub = self._transferWxmlStyle(sub, item, limitLeft, limitTop)
          sub.progress = progress
          const type = sub.dataset.type
          if (sub.dataset.delay) {
            setTimeout(() => {
              drawWxmlItem()
            }, sub.dataset.delay)
          } else {
            drawWxmlItem()
          }
          function drawWxmlItem() {
            if (type === 'text') {
              self._drawWxmlText(sub, resolve, reject)
            } else if (type === 'image') {
              self._drawWxmlImage(sub, resolve, reject)
            } else if (type === 'radius-image') {
              self._drawWxmlCircleImage(sub, resolve, reject)
            } else if (type === 'background-image') {
              self._drawWxmlBackgroundImage(sub, resolve, reject)
            }
          }
        })
      })
    })

    return all
  }

  _drawWxmlInline(item, sorted, all, progress, results) {
    const self = this
    let topOffset = 0
    let leftOffset = 0
    let lastTop = 0
    const limitLeft = results ? results.left : 0
    const limitTop = results ? results.top : 0
    const p = new Promise((resolve, reject) => {
      let maxWidth = 0
      let minLeft = Infinity
      let maxRight = 0

      // 找出同一top下的最小left和最大right，得到最大的宽度，用于换行
      Object.keys(sorted).forEach(top => {
        const inlineList = sorted[top].filter(sub => sub.dataset.type && sub.dataset.type.indexOf('inline') > -1)
        inlineList.forEach(sub => {
          if (sub.left < minLeft) {
            minLeft = sub.left
          }
          if (sub.right > maxRight) {
            maxRight = sub.right
          }
        })
      })
      maxWidth = Math.ceil(maxRight - minLeft || self.width)

      Object.keys(sorted).forEach((top, topIndex) => {
        // 左 -> 右
        const list = sorted[top].sort((a, b) => {
          return a.left - b.left
        })

        // 换行的行内元素left放到后面，version2.0.6后无法获取高度，改用bottom值来判断是否换行了
        let position = -1
        for (let i = 0, len = list.length; i < len; i++) {
          if (list[i] && list[i + 1]) {
            if (list[i].bottom > list[i + 1].bottom) {
              position = i
              break
            }
          }
        }

        if (position > -1) {
          list.push(list.splice(position, 1)[0])
        }

        const inlineList = list.filter(sub => sub.dataset.type && sub.dataset.type.indexOf('inline') > -1)
        const originLeft = inlineList[0] ? inlineList[0].left : 0
        // 换行后和top不相等时，认为是换行了，要清除左边距；当左偏移量大于最大宽度时，也要清除左边距; 当左偏移小于左边距时，也要清除
        if (
          Math.abs(topOffset + lastTop - top) > 2 ||
          leftOffset - originLeft - limitLeft >= maxWidth ||
          leftOffset <= originLeft - limitLeft - 2
        ) {
          leftOffset = 0
        }

        lastTop = +top
        topOffset = 0

        inlineList.forEach((sub, index) => {
          sub = self._transferWxmlStyle(sub, item, limitLeft, limitTop)
          sub.progress = progress
          const type = sub.dataset.type
          if (type === 'inline-text') {
            const drawRes = self._drawWxmlInlineText(sub, leftOffset, maxWidth)
            leftOffset = drawRes.leftOffset
            topOffset = drawRes.topOffset
          } else if (type === 'inline-image') {
            const drawRes = self._drawWxmlImage(sub) || {}
            leftOffset = drawRes.leftOffset || 0
            topOffset = drawRes.topOffset || 0
          }
        })
      })
      resolve()
    })

    all.push(p)
    return all
  }

  _drawWxmlInlineText(sub, leftOffset = 0, maxWidth) {
    let text = sub.dataset.text || ''
    if (sub.dataset.maxlength && text.length > sub.dataset.maxlength) {
      text = text.substring(0, sub.dataset.maxlength) + '...'
    }

    const textData = {
      text,
      originX: sub.left,
      x: leftOffset || sub.left,
      y: sub.top,
      progress: sub.progress,
      leftOffset: leftOffset,
      maxWidth: maxWidth, // 行内元素的最大宽度，取决于limit的宽度
    }

    if (sub.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      sub.background = sub.backgroundColor
    } else {
      sub.background = 'rgba(0, 0, 0, 0)'
    }

    if (sub.dataset.background) {
      sub.background = sub.dataset.background
    }

    const res = this._drawText(textData, sub, null, null, 'inline-text', 'wxml')

    return res
  }

  _drawWxmlText(sub, resolve, reject) {
    let text = sub.dataset.text || ''
    if (sub.dataset.maxlength && text.length > sub.dataset.maxlength) {
      text = text.substring(0, sub.dataset.maxlength) + '...'
    }

    const textData = {
      text,
      x: sub.left,
      y: sub.top,
      progress: sub.progress,
    }
    if (sub.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      sub.background = sub.backgroundColor
    } else {
      sub.background = 'rgba(0, 0, 0, 0)'
    }

    if (sub.dataset.background) {
      sub.background = sub.dataset.background
    }

    this._drawText(textData, sub, resolve, reject, 'text', 'wxml')
  }

  _drawWxmlImage(sub, resolve, reject) {
    const imageData = {
      url: sub.dataset.url,
      x: sub.left,
      y: sub.top,
      progress: sub.progress,
    }

    const res = this._drawRect(imageData, sub, resolve, reject, 'image', 'inline-wxml')

    return res
  }

  _drawWxmlCircleImage(sub, resolve, reject) {
    const imageData = {
      url: sub.dataset.url,
      x: sub.left,
      y: sub.top,
      progress: sub.progress,
    }
    sub.r = sub.width / 2

    this._drawCircle(imageData, sub, resolve, reject, true, 'wxml')
  }

  _drawWxmlBackgroundImage(sub, resolve, reject) {
    let url = sub.dataset.url
    const index = this._findPicIndex(url)
    url = index > -1 ? this.allPic[index].local : url
    // let size = sub.backgroundSize.replace(/px/g, '').split(' ')

    const imageData = {
      url: url,
      x: sub.left,
      y: sub.top,
      progress: sub.progress,
    }

    this._drawRect(imageData, sub, resolve, reject, 'image', 'wxml')
  }

  _getWxml(item, style) {
    const self = this
    let query
    if (this.context) {
      query = this.context.createSelectorQuery()
    } else {
      query = wx.createSelectorQuery()
    }

    const p1 = new Promise((resolve, reject) => {
      // 会触发两次，要限制
      let count = 0
      query
        .selectAll(`${item.class}`)
        .fields(
          {
            dataset: true,
            size: true,
            rect: true,
            computedStyle: [
              'width',
              'height',
              'font',
              'fontSize',
              'fontFamily',
              'fontWeight',
              'fontStyle',
              'textAlign',
              'color',
              'lineHeight',
              'border',
              'borderColor',
              'borderStyle',
              'borderWidth',
              'verticalAlign',
              'boxShadow',
              'background',
              'backgroundColor',
              'backgroundImage',
              'backgroundPosition',
              'backgroundSize',
              'paddingLeft',
              'paddingTop',
              'paddingRight',
              'paddingBottom',
              // 新增
              'boxSizing',
              'borderRadius',
              'borderTopLeftRadius',
              'borderTopRightRadius',
              'borderBottomRightRadius',
              'borderBottomLeftRadius',
            ],
          },
          res => {
            console.log('SelectorQuery res:', res)
            if (count++ === 0) {
              const formated = self._formatImage(res)
              const list = formated.list
              res = formated.res

              self
                ._preloadImage(list)
                .then(result => {
                  resolve(res)
                })
                .catch(res => {
                  reject && reject({errcode: 1009, errmsg: 'drawWxml preLoadImage error'}) // eslint-disable-line
                })
            }
          }
        )
        .exec()
    })

    const p2 = new Promise((resolve, reject) => {
      if (!item.limit) {
        resolve({top: 0, width: self.width / self.zoom})
      }

      query
        .select(`${item.limit}`)
        .fields(
          {
            dataset: true,
            size: true,
            rect: true,
          },
          res => {
            resolve(res)
          }
        )
        .exec()
    })

    return Promise.all([p1, p2])
  }

  _getLineHeight(style) {
    let zoom = this.zoom
    if (style.dataset && style.dataset.type) {
      zoom = 1
    }
    let lineHeight
    if (!isNaN(style.lineHeight) && style.lineHeight > style.fontSize) {
      lineHeight = style.lineHeight
    } else {
      style.lineHeight = (style.lineHeight || '') + ''
      lineHeight = +style.lineHeight.replace('px', '')
      lineHeight = lineHeight || (style.fontSize || 14) * 1.2
    }
    return lineHeight * zoom
  }

  _formatImage(res = []) {
    const list = []
    res.forEach((item, index) => {
      const dataset = item.dataset
      const uid = Util.getUid()
      // let filename = `${wx.env.USER_DATA_PATH}/${uid}.jpg`
      const filename = `http://tmp/${uid}.jpg`
      if ((dataset.type === 'image' || dataset.type === 'radius-image') && dataset.url) {
        const sub = {
          url: dataset.base64 ? filename : dataset.url,
          isBase64: dataset.base64 ? dataset.url : false,
        }

        res[index].dataset = Object.assign(res[index].dataset, sub)
        list.push(sub)
      } else if (dataset.type === 'background-image' && item.backgroundImage.indexOf('url') > -1) {
        const url = item.backgroundImage.replace(/url\(("|')?/, '').replace(/("|')?\)$/, '')
        const sub = {
          url: dataset.base64 ? filename : url,
          isBase64: dataset.base64 ? url : false,
        }
        res[index].dataset = Object.assign(res[index].dataset, sub)
        list.push(sub)
      }
    })

    return {list, res}
  }

  _updateProgress(distance) {
    this.progressPercent += distance
    this.progress(this.progressPercent)
  }

  _sortListByTop(list = []) {
    const sorted = {}

    // 粗略地认为2px相差的元素在同一行
    list.forEach((item, index) => {
      let top = item.top
      if (!sorted[top]) {
        if (sorted[top - 2]) {
          top = top - 2
        } else if (sorted[top - 1]) {
          top = top - 1
        } else if (sorted[top + 1]) {
          top = top + 1
        } else if (sorted[top + 2]) {
          top = top + 2
        } else {
          sorted[top] = []
        }
      }
      sorted[top].push(item)
    })

    return sorted
  }

  _parseNumber(number) {
    return isNaN(number) ? +(number || '').replace('px', '') : number
  }

  _transferWxmlStyle(sub, item, limitLeft, limitTop) {
    const leftFix = +sub.dataset.left || 0
    const topFix = +sub.dataset.top || 0

    sub.width = this._parseNumber(sub.width)
    sub.height = this._parseNumber(sub.height)
    sub.left = this._parseNumber(sub.left) - limitLeft + (leftFix + (item.x || 0)) * this.zoom
    sub.top = this._parseNumber(sub.top) - limitTop + (topFix + (item.y || 0)) * this.zoom

    let padding = sub.dataset.padding || '0 0 0 0'
    if (typeof padding === 'string') {
      padding = Util.transferPadding(padding)
    }
    const paddingTop = Number(sub.paddingTop.replace('px', '')) + Number(padding[0])
    const paddingRight = Number(sub.paddingRight.replace('px', '')) + Number(padding[1])
    const paddingBottom = Number(sub.paddingBottom.replace('px', '')) + Number(padding[2])
    const paddingLeft = Number(sub.paddingLeft.replace('px', '')) + Number(padding[3])
    sub.padding = [paddingTop, paddingRight, paddingBottom, paddingLeft]

    // 新增
    sub.borderTopLeftRadius = Number(sub.borderTopLeftRadius.replace('px', ''))
    sub.borderTopRightRadius = Number(sub.borderTopRightRadius.replace('px', ''))
    sub.borderBottomRightRadius = Number(sub.borderBottomRightRadius.replace('px', ''))
    sub.borderBottomLeftRadius = Number(sub.borderBottomLeftRadius.replace('px', ''))

    return sub
  }

  /**
   * 支持负值绘制，从右边计算
   * @param {*} item
   * @param {*} style
   */
  _resetPositionX(item, style) {
    let zoom = this.zoom
    let x = 0

    if (style.dataset && style.dataset.type) {
      zoom = 1
    }

    // 通过wxml获取的不需要重置坐标
    if (item.x < 0 && item.type) {
      x = this.width + item.x * zoom - style.width * zoom
    } else {
      x = item.x * zoom
    }

    return x + this.translateX
  }

  /**
   * 支持负值绘制，从底部计算
   * @param {*} item
   * @param {*} style
   */
  _resetPositionY(item, style, textHeight) {
    let zoom = this.zoom
    let y = 0

    if (style.dataset && style.dataset.type) {
      zoom = 1
    }

    if (item.y < 0) {
      y = this.height + item.y * zoom - (textHeight || style.height * zoom)
    } else {
      y = item.y * zoom
    }

    return y + this.translateY
  }

  /**
   * 文字的padding、text-align
   * @param {*} item
   * @param {*} style
   * @param {*} textWidth
   */
  _resetTextPositionX(item, style, textWidth, width) {
    const textAlign = style.textAlign || 'left'
    let x = item.x
    if (textAlign === 'center') {
      x = (width - textWidth) / 2 + item.x
    } else if (textAlign === 'right') {
      x = width - textWidth + item.x
    }

    const left = style.padding ? style.padding[3] || 0 : 0

    return x + left + this.translateX
  }

  /**
   * 文字的padding、text-align
   * @param {*} item
   * @param {*} style
   * @param {*} textWidth
   */
  _resetTextPositionY(item, style, lineNum = 0) {
    let zoom = this.zoom
    if (style.dataset && style.dataset.type) {
      zoom = 1
    }

    const lineHeight = this._getLineHeight(style)
    const fontSize = Math.ceil((style.fontSize || 14) * zoom)

    const blockLineHeightFix =
      ((style.dataset && style.dataset.type) || '').indexOf('inline') > -1 ? 0 : (lineHeight - fontSize) / 2

    const top = style.padding ? style.padding[0] || 0 : 0

    // y + lineheight偏移 + 行数 + paddingTop + 整体画布位移
    return item.y + blockLineHeightFix + lineNum * lineHeight + top + this.translateY
  }

  /**
   * 当文本超过宽度时，计算每一行应该绘制的文本
   * @param {*} text
   * @param {*} width
   * @param {*} singleLength
   * @param {*} currentIndex
   * @param {*} widthOffset
   */
  _getTextSingleLine(text, width, singleLength, currentIndex = 0, widthOffset = 0) {
    let offset = 0
    let endIndex = currentIndex + singleLength + offset
    let single = text.substring(currentIndex, endIndex)
    let singleWidth = this.measureWidth(single)

    while (Math.round(widthOffset + singleWidth) > width) {
      offset--
      endIndex = currentIndex + singleLength + offset
      single = text.substring(currentIndex, endIndex)
      singleWidth = this.measureWidth(single)
    }

    return {
      endIndex,
      single,
      singleWidth,
    }
  }

  _drawBorder(border, style, callback) {
    let zoom = this.zoom
    if (style.dataset && style.dataset.type) {
      zoom = 1
    }
    border = Util.transferBorder(border)

    if (border && border.width) {
      // 空白阴影，清空掉边框的阴影
      this._drawBoxShadow()
      if (border) {
        this.ctx.setLineWidth(border.width * zoom)

        if (border.style === 'dashed') {
          const dash = style.dash || [5, 5, 0]
          const offset = dash[2] || 0
          const array = [dash[0] || 5, dash[1] || 5]
          this.ctx.setLineDash(array, offset)
        }
        this.ctx.setStrokeStyle(border.color)
      }
      callback && callback(border)
    }
  }

  _drawBoxShadow(boxShadow, callback) {
    boxShadow = Util.transferBoxShadow(boxShadow)
    if (boxShadow) {
      this.ctx.setShadow(boxShadow.offsetX, boxShadow.offsetY, boxShadow.blur, boxShadow.color)
    } else {
      this.ctx.setShadow(0, 0, 0, '#ffffff')
    }

    callback && callback(boxShadow || {})
  }

  _setFill(fill, callback) {
    if (fill) {
      if (typeof fill === 'string') {
        this.ctx.setFillStyle(fill)
      } else {
        const line = fill.line
        const color = fill.color
        const grd = this.ctx.createLinearGradient(line[0], line[1], line[2], line[3])
        grd.addColorStop(0, color[0])
        grd.addColorStop(1, color[1])
        this.ctx.setFillStyle(grd)
      }
      callback && callback()
    }
  }

  _setStroke(stroke, callback) {
    if (stroke) {
      if (typeof stroke === 'string') {
        this.ctx.setStrokeStyle(stroke)
      } else {
        const line = stroke.line
        const color = stroke.color
        const grd = this.ctx.createLinearGradient(line[0], line[1], line[2], line[3])
        grd.addColorStop(0, color[0])
        grd.addColorStop(1, color[1])
        this.ctx.setStrokeStyle(grd)
      }

      callback && callback()
    }
  }
}

export default Wxml2Canvas
