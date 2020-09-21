const API = 'https://cloud.minapp.com/dserve/v2.3'

const headers = {
  'X-Hydrogen-MiniApp-ID': global.__FAAS_EVENT.miniappId,
  'X-Hydrogen-Cloud-Function-Token': global.__FAAS_EVENT.token,
}

module.exports = {
  /**
   * 数据操作
   * 与 JS SDK 定义一致，find 方法查询数据列表，get 方法根据 id 获取单条数据
   * 定义 frist 方法根据查询条件获取第一条数据
   */
  find(table, params = {}) {
    const {offset = 0, limit = 20, where, orderBy = '-created_at', expand = ''} = params
    return BaaS.request.get(`${API}/schema/${table}/record/`, {
      headers,
      params: {
        where,
        offset,
        limit,
        order_by: orderBy,
        expand,
      },
    })
  },

  first(...args) {
    return this.find(...args).then(res => {
      const objects = res.data.objects || []
      res.data = objects[0] || null
      return res
    })
  },

  get(table, id) {
    return BaaS.request.get(`${API}/schema/${table}/record/${id}/`, {headers})
  },

  create(table, data) {
    return BaaS.request.post(`${API}/schema/${table}/record/`, data, {headers})
  },

  update(table, recordId, data) {
    return BaaS.request.put(`${API}/schema/${table}/record/${recordId}/`, data, {headers})
  },

  delete(table, recordId) {
    return BaaS.request.delete(`${API}/schema/${table}/record/${recordId}/`, {headers})
  },

  // 批量更新
  updateByQuery(table, data, params = {}) {
    const {offset = 0, limit = 20, where} = params
    return BaaS.request.put(`${API}/schema/${table}/record/`, data, {
      headers,
      params: {
        where,
        offset,
        limit: limit === -1 ? undefined : limit, // limit = -1 时不设 limit, 使用大批量异步更新接口
      },
    })
  },
}
