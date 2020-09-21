import axios from 'axios'
import np from 'nprogress'
import {message} from 'antd'

const URL = {
  BASE: 'https://cloud.minapp.com/userve/v2.1/',
  USER_INFO: 'https://cloud.minapp.com/userve/v1/',
  CLOUD: 'https://cloud.minapp.com/userve/v1.3/cloud-function/',
}

const client = axios.create({
  baseURL: URL.BASE,
  withCredentials: true, // 必须手动开启为 true，允许跨域请求发送身份凭证信息
})

const fileDownloadClient = axios.create({
  responseType: 'blob',
})

var initClient = client => {
  client.interceptors.request.use(
    req => {
      np.start()
      return req
    },
    err => {
      np.done()
      message.error(err.toString())
      return Promise.reject(err)
    }
  )

  client.interceptors.response.use(
    res => {
      np.done()
      return res
    },
    err => {
      np.done()
      message.error(err.toString())
      return Promise.reject(err)
    }
  )
}

initClient(client)
initClient(fileDownloadClient)

export default {
  client,
  getUserInfo() {
    return client.get('user-profile/', {baseURL: URL.USER_INFO})
  },

  getUserList(params = {}) {
    const {offset = 0, limit = 20, where, orderBy = '-created_at', expand = ''} = params
    return client.get('miniapp/user_profile/', {
      params: {
        where,
        offset,
        limit,
        order_by: orderBy,
        expand,
      },
    })
  },

  /**
   * 数据操作
   * 与 JS SDK 定义一致，find 方法查询数据列表，get 方法根据 id 获取单条数据
   * 定义 frist 方法根据查询条件获取第一条数据
   */
  find(table, params = {}) {
    const {offset = 0, limit = 20, where, orderBy = '-created_at', expand = ''} = params
    return client.get(`table/${table}/record/`, {
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
    return client.get(`table/${table}/record/${id}/`)
  },

  create(table, data) {
    return client.post(`table/${table}/record/`, data)
  },

  update(table, recordId, data) {
    return client.put(`table/${table}/record/${recordId}/`, data)
  },

  delete(table, recordId) {
    return client.delete(`table/${table}/record/${recordId}/`)
  },

  // 批量更新
  updateByQuery(table, data, params = {}) {
    const {offset = 0, limit = 20, where} = params
    return client.put(`table/${table}/record/`, data, {
      params: {
        where,
        offset,
        limit: limit === -1 ? undefined : limit, // limit = -1 时不设 limit, 使用大批量异步更新接口
      },
    })
  },

  // 批量删除
  deleteByQuery(table, params = {}) {
    const {offset = 0, limit = 20, where} = params
    return client.delete(`table/${table}/record/`, {
      params: {
        where,
        offset,
        limit: limit === -1 ? undefined : limit, // limit = -1 时不设 limit, 使用大批量异步更新接口
      },
    })
  },

  /**
   * 文件上传
   */
  getUploadFileConfig(data) {
    return client.post('upload/', data)
  },

  uploadFile(config, onUploadProgress = () => {}) {
    const formData = new FormData()
    formData.append('file', config.file)
    formData.append('policy', config.policy)
    formData.append('authorization', config.authorization)

    return client.post(config.upload_url, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      withCredentials: false,
      onUploadProgress,
    })
  },

  /**
   * 内容库
   */
  findContent(contentGroupId, params) {
    return client.get(`content/${contentGroupId}/text/`, {params})
  },

  getContent(contentGroupId, contentId) {
    return client.get(`content/${contentGroupId}/text/${contentId}/`)
  },

  updateContent(contentGroupId, contentId, data) {
    return client.put(`content/${contentGroupId}/text/${contentId}/`, data)
  },

  /**
   * 文件
   */
  getFileCategory(categroyId) {
    return client.get(`file/`, {
      params: {
        category: categroyId,
      },
      baseURL: 'https://cloud.minapp.com/userve/v2.2/',
    })
  },

  /**
   * 云函数
   */
  invokeCloudFunc(functionName, data, sync = true) {
    return client.post(
      `${functionName}/job/`,
      {
        data,
        sync,
      },
      {baseURL: URL.CLOUD}
    )
  },
}

export {fileDownloadClient}
