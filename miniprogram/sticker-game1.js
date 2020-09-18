import cax from './pages/sticker-game/cax/index'

Page({
  data: {},

  onReady() {
    this.initStage()
  },

  initStage() {
    const stage = new cax.Stage(375, 375, 'canvas', this)
    this.photoGroup = new cax.Group()
    this.stickerGroup = new cax.Group()

    const photo = new cax.Bitmap('https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hTenb2GG9nVUvxf.jpg', () => {
      stage.update()
    })
    this.photoGroup.add(photo)

    const sticker = new cax.Bitmap('https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hOYboxZhxYNDJ1J', () => {
      stage.update()
    })

    this.stickerGroup.x = 100
    this.stickerGroup.y = 100

    sticker.x = 10
    sticker.y = 10
    sticker.width = 80
    sticker.height = 80

    const outline = new cax.Rect(100, 100, {
      strokeStyle: 'red',
    })

    const border = new cax.Rect(80, 80, {
      strokeStyle: 'yellow',
    })

    border.x = 10
    border.y = 10

    const closeBtn = new cax.Rect(20, 20, {
      fillStyle: 'yellow',
    })
    closeBtn.x = 10
    closeBtn.y = 10
    closeBtn.width = 20
    closeBtn.height = 20

    outline.on('touchstart', e => {
      console.log('touchstart', e)
    })

    outline.on('touchmove', e => {
      console.log('touchmove', e)
    })

    outline.on('drag', e => {
      console.log('drag', e)
    })

    closeBtn.on('touchend', e => {
      console.log('touchend', e)
    })

    const scaleBtn = new cax.Circle(10)
    const rotateBtn = new cax.Circle(10)

    this.stickerGroup.add(sticker, outline, border, closeBtn, scaleBtn, rotateBtn)

    stage.add(this.photoGroup, this.stickerGroup)
  },

  initSence() {
    this.scene = new Scene(1)
    this.layer = this.scene.layer('canvas')
    this.photoGroup = new Group()
    this.stickerGroup = new Group()
    const photo = new Sprite('https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hTenb2GG9nVUvxf.jpg')
    const sticker = new Sprite('https://cloud-minapp-27037.cloud.ifanrusercontent.com/1hOYboxZhxYNDJ1J')

    photo.attr({
      pos: [0, 0],
      size: [750, 750],
    })

    this.stickerGroup.attr({
      anchor: 0.5,
      pos: [190, 190],
      size: [204, 204],
      bgcolor: 'green',
    })

    sticker.attr({
      anchor: 0.5,
      pos: [102, 102],
      size: [160, 160],
      border: {
        style: 'solid',
        width: 2,
        color: 'yellow',
      },
    })

    const closeBtn = new Sprite()
    const scaleBtn = new Sprite()
    const rotateBtn = new Sprite()

    this.closeBtn = closeBtn

    closeBtn.attr({
      anchor: 0.5,
      pos: [20, 20],
      size: [40, 40],
      bgcolor: 'red',
      borderRadius: 40,
    })

    scaleBtn.attr({
      anchor: 0.5,
      pos: [180, 20],
      size: [40, 40],
      bgcolor: 'blue',
      borderRadius: 40,
    })

    rotateBtn.attr({
      anchor: 0.5,
      pos: [180, 180],
      size: [40, 40],
      bgcolor: 'yellow',
      borderRadius: 40,
    })

    const touchEvent = new WxTouchEvent()

    touchEvent.bind({
      //初始化后绑定事件
      touchMove: function(e) {
        console.log('touchEvent touchMove', e)
      },
      touchStart: function(e) {
        console.log('touchEvent touchStart', e)
      },
      // tap: function(e) {
      //   console.log(e)
      // }.bind(this),

      // longTap: function(e) {
      //   console.log(e)
      // },
      // rotate: function(e) {
      //   console.log(e)
      // }.bind(this),

      // pinch: function(e) {
      //   console.log(e)
      // },
    })

    closeBtn.on('touchstart', e => {
      console.log('touchstart', e)
      touchEvent.start(e.originEvent)
    })

    closeBtn.on('touchmove', e => {
      console.log('touchmove', e)
      touchEvent.move(e.originEvent)
    })

    closeBtn.on('touchend', e => {
      console.log('touchend', e)
      touchEvent.end(e.originEvent)
    })

    this.layer.append(this.photoGroup, this.stickerGroup)

    this.photoGroup.append(photo)
    this.stickerGroup.append(sticker, closeBtn, scaleBtn, rotateBtn)
  },
})
