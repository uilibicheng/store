import {BAAS_SCHEMA_ID, REMOTE_FUNCTION} from '../config/constants'

export default {
  /**
   * 获取订单列表
   */
  fetchOrder(status, offset = 0, limit = 20) {
    const Order = new wx.BaaS.TableObject(BAAS_SCHEMA_ID.order)
    const query = new wx.BaaS.Query()
    if (!!status && status !== 'all') {
      query.compare('status', '=', status)
    }
    query.compare('created_by', '=', wx.BaaS.storage.get('uid'))
    return Order.setQuery(query)
      .orderBy('-created_at')
      .limit(limit)
      .offset(offset)
      .find()
  },

  /**
   * 获取订单详情
   */
  getOrder(orderId) {
    return wx.BaaS.invokeFunction(REMOTE_FUNCTION.GET_ORDER, {
      orderId,
    }).then(res => {
      if (res.data && res.data.message === 'success') {
        return {
          data: res.data.order,
        }
      } else if (res.error && res.error.message) {
        throw res.error
      }
    })
  },
}
