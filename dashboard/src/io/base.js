import axios from 'axios'
import np from 'nprogress'
import {genUserLogRecord} from '../utils/user-log'

const URL = {
  v1: 'https://cloud.minapp.com/userve/v1/',
  v13: 'https://cloud.minapp.com/userve/v1.3/',
  v15: 'https://cloud.minapp.com/userve/v1.5/',
  v18: 'https://cloud.minapp.com/userve/v1.8/',
}

const client = axios.create({
  baseURL: URL.v18, // user dash api 的请求地址
  withCredentials: true, // 必须手动开启为 true，允许跨域请求发送身份凭证信息
})

client.interceptors.request.use(
  function(config) {
    np.start()
    genUserLogRecord(config)
    return config
  },
  function(error) {
    np.done()
  }
)

client.interceptors.response.use(
  response => {
    np.done()
    return response
  },
  error => {
    np.done()
    return Promise.reject(error)
  }
)

const newClient = axios.create({})
newClient.interceptors.request.use(
  req => {
    np.start()
    genUserLogRecord(req)
    return req
  },
  err => np.done()
)
newClient.interceptors.response.use(
  res => {
    np.done()
    return res
  },
  err => {
    np.done()
    return Promise.reject(err)
  }
)

export default {
  getRecordList(tableId, {offset = 0, limit = 20, where, order_by = ''}) {
    return client.get(`table/${tableId}/record/`, {
      params: {
        where,
        offset,
        limit,
        order_by: order_by || '-created_at',
      },
    })
  },

  getInventoryRecordList(tableId, {offset = 0, limit = 20, where}) {
    return client.get(`table/${tableId}/record/`, {
      params: {
        where,
        offset,
        limit,
        order_by: '-priority',
        expand: 'ticket,bundle,type',
      },
    })
  },

  getProductList(tableId, {offset = 0, limit = 20, where}) {
    return client.get(`table/${tableId}/record/`, {
      params: {
        where,
        offset,
        limit,
        order_by: '-priority',
        expand: 'type,bundle',
      },
    })
  },

  getRecordById(tableId, id) {
    return client.get(`table/${tableId}/record/${id}/`)
  },

  getProductRecordById(tableId, id) {
    return client.get(`table/${tableId}/record/${id}/`, {
      params: {
        expand: 'bundle',
      },
    })
  },

  getRecord(tableId, recordId) {
    return client.get(`table/${tableId}/record/${recordId}/`)
  },

  deleteRecord(tableId, recordId) {
    return client.delete(`table/${tableId}/record/${recordId}/`)
  },

  deleteRecordList(tableId, params) {
    return client.delete(`table/${tableId}/record/`, {
      params,
    })
  },

  createRecord(tableId, data) {
    return client.post(`table/${tableId}/record/`, data)
  },

  updateRecord(tableId, recordId, data) {
    return client.put(`table/${tableId}/record/${recordId}/`, data)
  },

  updateRecordList(tableId, data, {offset = 0, limit = 20, where}) {
    return client.put(`table/${tableId}/record/`, data, {
      params: {
        where,
        offset,
        limit,
      },
    })
  },

  getUploadFileConfig(data) {
    return newClient.post(`${URL.v1}upload/`, data, {
      withCredentials: true,
    })
  },

  uploadFile(config, onUploadProgress = () => {}) {
    let formData = new FormData()
    formData.append('file', config.file)
    formData.append('policy', config.policy)
    formData.append('authorization', config.authorization)
    return newClient.post(config.upload_url, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
      withCredentials: false,
      onUploadProgress,
    })
  },

  uploadData(recordId, data) {
    return newClient.post(`${URL.v18}table/${recordId}/record/?enable_trigger=0&opt_type=import`, data, {
      withCredentials: true,
    })
  },

  getUserInfo() {
    return client.get(`${URL.v1}user-profile/`)
  },

  getContentList(contentGroupId, params) {
    return client.get(`content/${contentGroupId}/text/`, {params})
  },

  getContent(contentGroupId, contentId) {
    return client.get(`content/${contentGroupId}/text/${contentId}/`)
  },

  updateContent(contentGroupId, contentId, data) {
    return client.put(`content/${contentGroupId}/text/${contentId}/`, data)
  },

  createExportJob(tableId, data) {
    return newClient.post(`${URL.v15}schema/${tableId}/export/`, data, {
      withCredentials: true,
    })
  },

  checkExportJobResult(tableId, jobId) {
    return newClient.get(`${URL.v15}schema/${tableId}/export/${jobId}/`, {
      withCredentials: true,
    })
  },

  refundOrder(data) {
    return newClient.post(`${URL.v1}wechat/refund/`, data, {
      withCredentials: true,
    })
  },

  invokeCloudFunction(cloudFunctionName, data = {}) {
    return newClient.post(
      `${URL.v13}cloud-function/${cloudFunctionName}/job/`,
      {data},
      {
        withCredentials: true,
      }
    )
  },
}
