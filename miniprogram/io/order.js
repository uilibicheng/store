import {BAAS_SCHEMA_ID} from '../config/constants'
import baas from '../lib/baas'

const getTableObject = () => new wx.BaaS.TableObject(BAAS_SCHEMA_ID.order)

export default {
  getUserOrderList(params) {
    const {limit = 20, offset = 0, search_order_num = '', with_count = false} = params
    const query = new wx.BaaS.Query()
    query.compare('user_id', '=', baas.getUid())
    if (search_order_num) query.contains('order_id', search_order_num)
    return getTableObject()
      .setQuery(query)
      .orderBy('-created_at')
      .limit(limit)
      .offset(offset)
      .find({withCount: with_count})
  },

  getUserTailoredList(offset) {
    const query = new wx.BaaS.Query()
    query.isNotNull('tailored_id')
    query.compare('user_id', '=', baas.getUid())
    return getTableObject()
      .setQuery(query)
      .orderBy('-created_at')
      .offset(offset)
      .find()
  },

  getStoreOrderList(params) {
    const {
      uid = '',
      offset = 0,
      order_by = '-created_at',
      search_text = '',
      status = ''} = params
    let query = new wx.BaaS.Query()
    if (search_text) {
      const query1 = new wx.BaaS.Query()
      query1.contains('order_id', search_text)
      const query2 = new wx.BaaS.Query()
      query2.contains('contact_name', search_text)
      query = wx.BaaS.Query.or(query1, query2)
    }
    if (status) {
      query.in('product_status', [status])
    }
    query.compare('user_id', '!=', uid)
    return getTableObject()
      .setQuery(query)
      .orderBy(order_by)
      .offset(offset)
      .find()
  },

  getStoreOrder(id) {
    return getTableObject().get(id)
  },

  getOrderByBatchNo(batchNo) {
    let query = new wx.BaaS.Query()
    query.compare('batch_no', '=', batchNo)
    return getTableObject()
      .setQuery(query)
      .find()
  },

}
