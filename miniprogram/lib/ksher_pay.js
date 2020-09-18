class HError {
  constructor(code, msg) {
    let error = new Error()
    error.code = code
    error.message = msg ? `${code}: ${msg}` : `${code}: ${this.mapErrorMessage(code)}`
    return error
  }

  // 前端错误信息定义
  mapErrorMessage(code) {
    switch (code) {
      case 600:
        return 'network disconnected'
      case 601:
        return 'request timeout'
      case 602:
        return 'uninitialized' // 未调用 BaaS.init()
      case 603:
        return 'unauthorized'  // 用户尚未授权
      case 604:
        return 'session missing' // 用户尚未登录
      case 605:
        return 'incorrect parameter type'
      case 607:
        return 'payment cancelled'
      case 608:
        return 'payment failed'   // error message 会被重写为微信返回的错误信息
      case 609:
        return 'wxExtend function should be executed to allow plugin use wx.login, wx.getUserInfo, wx.requestPayment'
      case 610:
        return 'errorTracker uninitialized'
      default:
        return 'unknown error'
    }
  }
}

const keysMap = {
  merchandiseSchemaID: 'merchandise_schema_id', // optional
  merchandiseRecordID: 'merchandise_record_id', // optional
  merchandiseSnapshot: 'merchandise_snapshot', // optional
  merchandiseDescription: 'merchandise_description', // required
  totalCost: 'total_cost', // required
}

function  wxPaymentRequest(...args){
  return wx.requestPayment(...args)
}

const baasRequest = function ({url, method = 'GET', data = {}, header = {}, dataType = 'json'}) {
  return wx.BaaS.auth.loginWithWechat().then(() => {
    return wx.BaaS.request.apply(null, arguments)
  })
}

const ksher_pay = (params) => {
  let paramsObj = {}

  for (let key in params) {
    paramsObj[keysMap[key]] = params[key]
  }

  paramsObj.gateway_type = 'qfpay'

  return baasRequest({
    url: '/hserve/v2.0/idp/pay/order/',
    method: 'POST',
    data: paramsObj,
  })
    .then(function (res) {
    let data = res.data || {}
    return new Promise((resolve, reject) => {
      wxPaymentRequest({
        appId: data.appId,
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: 'MD5',
        paySign: data.paySign,
        success: function (res) {
          res.transaction_no = data.transaction_no
          res.trade_no = data.trade_no
          return resolve(res)
        },
        complete: function (res) {
          // 兼容：微信 6.5.2 及之前版本中，用户取消支付不会触发 fail 回调，只会触发 complete 回调，回调 errMsg 为 'requestPayment:cancel'
          if (res.errMsg == 'requestPayment:fail cancel') {
            reject(new HError(607))
          }
        },
        fail: function (err) {
          // 微信不使用状态码来区分支付取消和支付失败，这里返回自定义状态码和微信的错误信息，便于用户判断和排错
          if (err.errMsg == 'requestPayment:fail cancel') {
            reject(new HError(607))
          } else {
            reject(new HError(608, err.errMsg))
          }
        },
      })
    })
  })
}

module.exports = ksher_pay
