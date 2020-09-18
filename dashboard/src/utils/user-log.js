import {PAGE_MAP} from '../config/constants'
import io from '../io'
import {message} from 'antd'
import {getStorage} from './local-storage'

const USER_INFO_KEY = 'userInfo'

export const genUserLogRecord = config => {
  let {method, data, url} = config
  let type = ''
  let page = ''
  let tag = true

  PAGE_MAP.forEach(v => {
    if (url.indexOf(v.id) > -1) {
      page = v.page
      tag = false
    }

    if (data && data.data && data.data.tableId === v.id) {
      page = v.page
      tag = false
    }
  })

  if (
    method === 'get' ||
    tag ||
    (method === 'put' && data.has_send_email_list) ||
    (method === 'post' && data.opt_type === 'createUserLogRecord')
  ) {
    return
  }

  if (method === 'put') {
    if (data.is_deleted) {
      type = '删除'
    } else if (data.is_active) {
      type = '上架'
    } else if (data.is_active === false) {
      type = '下架'
    } else {
      type = '编辑'
    }

    if (data.banner && data.opt_type === 'banner') {
      page = 'banner 设置'
      if (!data.opt_id) {
        type = '新增'
      }
    }

    if (data.introduction && data.opt_type === 'legoland-info') {
      page = '乐高商店信息管理'
    }

    if (data.inventory_warning_email) {
      page = '库存预警'
    }

    if (data.expired_warning_email) {
      page = '过期提醒'
    }

    if (data.closed_times) {
      page = '闭园日期'
    }
  } else if (method === 'post') {
    type = '新增'
    if (url.indexOf('create_export_job_id') > -1) {
      type = '导出列表'
    }

    if (url.indexOf('opt_type=import') > -1) {
      page = '产品列表'
      type = '导入'
    }
  } else if (method === 'delete') {
    type = '删除'
  }

  const userInfoStr = getStorage(USER_INFO_KEY)
  const userInfo = userInfoStr && typeof userInfoStr === 'string' && JSON.parse(userInfoStr)

  const params = {
    name: userInfo.nickname,
    email: userInfo.email,
    page,
    type,
    opt_type: 'createUserLogRecord', // 记录操作日志使用
  }

  io.createUserLogRecord(params).catch(err => {
    message.error(err.toString())
  })
}
