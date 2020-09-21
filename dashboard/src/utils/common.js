import {message} from 'antd'

import io from '../io'
import {TABLE, CLOUD_FUNCTION} from '../config'
import {getAcl} from '../utils/acl'
import format from '../utils/format'
import breadcrumb from './breadcrumb'

export default {
  // 获取 table
  getTable(tableName) {
    return TABLE[format.camelCaseTo_(tableName)]
  },

  // 发送管理员操作记录
  sendAdminOperationLog(props, action = '', page = '') {
    // 此处不 return，记录静默进行
    getAcl().then(acl => {
      const {currentUser, currentEmail} = acl
      // 获取当前页面
      const currentBreadcrumb = breadcrumb.current(props.location.pathname)

      page = page || currentBreadcrumb.menuTitle || currentBreadcrumb.name // 一般不外部传入
      action = action || page // 不传入 action 则直接用 page 值，如新增/修改时

      io.adminOperationLog.create({
        page,
        action,
        name: currentUser,
        email: currentEmail,
      })
    })
  },

  // 创建链接并自动下载
  createAutoDownload(fileLink) {
    const elink = document.createElement('a')
    elink.href = fileLink
    elink.style.display = 'none'
    elink.download = 'export-data.xlsx'
    document.body.appendChild(elink)
    elink.click()
    document.body.removeChild(elink)
  },

  // 调用云函数导出数据
  exportData(exportConfig) {
    return io
      .invokeCloudFunc(CLOUD_FUNCTION.export_data, exportConfig)
      .then(fileLink => {
        this.createAutoDownload(fileLink)
        message.success('导出数据成功')
      })
      .catch(er => message.success('导出数据失败'))
  },
}
