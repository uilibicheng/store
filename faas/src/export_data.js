const constants = require('./constants')
const time = require('./utils/time')
const {EXPORT_DATA_CATEGORY_ID, API, BAAS_TABLE_ID, EMAIL_LIST, EMAIL_TITLE_MAP} = constants
const fs = require('fs')
const xlsx = require('node-xlsx')

const TMP_FILE_NAME = '/tmp/result.xlsx'
const HEADERS = {
  'X-Hydrogen-MiniApp-ID': global.__FAAS_EVENT.miniappId,
  'X-Hydrogen-Cloud-Function-Token': global.__FAAS_EVENT.token,
}
const LIMIT = 1000
const MAX_CONNECT_LIMIT = 5
const result = []
let totalCount = 0
let groupSize = 0

const UTM_SOURCE_MAP = {
  assistance: 'Merlinmagic',
  lottery: 'Luckydraw',
  share: 'SLBK share',
}

function convertRowToStr(row) {
  return row ? (Object.prototype.toString.call(row) === '[object Object]' ? JSON.stringify(row) : row.toString()) : row
}

/**
 * 转换为时间格式字段
 * @param {*} row
 */
function convertRowToDate(row) {
  return row ? new Date(checkType(row) * 1000).toLocaleString() : ''
}

function checkType(data) {
  return typeof data === 'number' ? data : time.timeWithTimeZone(data)
}

function updateExportJobIdRecord(tableID, recordId, fileLink) {
  const Schame = new BaaS.TableObject(tableID)
  const schame = Schame.getWithoutData(recordId)

  schame.set('file_download_link', fileLink)
  return schame.update()
}

/**
 * 获取总数据条数
 * @param {*} params
 */
function getTotalCount({tableId = '', where = {}}) {
  return BaaS.request
    .get(`${API}/${tableId}/record/`, {
      params: {
        where,
        offset: 0,
        limit: 20,
      },
      headers: HEADERS,
    })
    .then(res => {
      console.log('数据总条数:', res.data.meta.total_count)
      return res.data.meta.total_count
    })
    .catch(err => {
      console.log('获取数据总条数失败:', err)
      throw new Error(err)
    })
}

function getDataByGroup({tableId = '', where = {}, order_by = '-created_at', expand = ''}, offset = 0, limit = LIMIT) {
  return BaaS.request
    .get(`${API}/${tableId}/record/`, {
      params: {
        where,
        offset,
        limit,
        order_by,
        expand,
      },
      headers: HEADERS,
    })
    .then(res => {
      return res.data.objects
    })
    .catch(err => {
      console.log('获取分组数据失败:', err)
      throw new Error(err)
    })
}

function getTime(t) {
  const time = new Date(t * 1000)
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const day = time.getDate()
  const f = n => (n > 9 ? n : `0${n}`)
  return `${year}-${f(month)}-${f(day)}`
}

/**
 * 定时发送导出邮件
 * @param {*} recipient 收件人邮箱
 * @param {*} subject 邮件标题
 * @param {*} fileLink 邮件内容
 */
function sendTimingExportEmail(recipient, subject, fileLink, timeRange) {
  let tpl = `Please check weekly sales report`

  if (timeRange) {
    const lt = timeRange['$lt']
    const gt = timeRange['$gt']

    tpl = `Please check weekly sales report (from ${getTime(gt)} to ${getTime(lt)})`
  }

  const data = {
    recipient,
    subject,
    body: `${tpl}. File download link：${fileLink}`,
  }

  return BaaS.sendEmail(data)
}

/**
 * 创建 Excel 导出文件
 * @param {*} sourceData 源数据
 * @param {*} includeKeys 导出列
 * @param {*} customizeHeaders 列名
 * @param {*} timestampConvertKeys 需转化为时间格式字段
 * @param {*} scientificNotationConvertKeys 需处理科学计数法格式字段
 * @param {*} splitRowKeys 指定从 splitRow 中取属性值
 * @param {*} splitRow 需拆分的列字段
 */
function genExportFile(sourceData = [], params) {
  const {
    includeKeys = [],
    customizeHeaders = {},
    timestampConvertKeys = [],
    scientificNotationConvertKeys = [],
    splitRowKeys = [],
    splitRow = '',
  } = params
  const resultArr = []
  const rowArr = []

  // 配置列名
  rowArr.push(
    includeKeys.map(v => {
      return customizeHeaders[v]
    })
  )

  const handleRowKey = (key, value) => {
    return timestampConvertKeys.includes(key)
      ? convertRowToDate(value)
      : scientificNotationConvertKeys.includes(key)
      ? value
        ? "'" + convertRowToStr(value)
        : value // 处理科学计数法情况
      : convertRowToStr(value)
  }

  if (splitRowKeys.length) {
    sourceData.forEach(v => {
      Array.isArray(v[splitRow]) &&
        v[splitRow].forEach(i => {
          rowArr.push(
            includeKeys.map(k => {
              let value = k === 'quantity' ? 1 : splitRowKeys.includes(k) ? i[k] : v[k]

              if (k === 'refund_operator') {
                value = value ? value['email'] : ''
              }

              if (k === 'utm_source') {
                value = value ? UTM_SOURCE_MAP[value] : ''
              }

              return handleRowKey(k, value)
            })
          )
        })
    })
  } else {
    sourceData.forEach(v => {
      rowArr.push(
        includeKeys.map(k => {
          let value = v[k]
          if (k === 'operator') {
            value = value ? value['email'] : ''
          }
          if (k === 'utm_source') {
            value = value ? UTM_SOURCE_MAP[value] : ''
          }
          if (k === 'ticket') {
            value = value ? value['price'] : ''
          }
          return handleRowKey(k, value)
        })
      )
    })
  }

  resultArr[0] = {
    data: rowArr,
    name: 'sheet',
  }

  const buffer = xlsx.build(resultArr)
  return fs.writeFile(TMP_FILE_NAME, buffer, err => {
    if (err) {
      console.log('创建 Excel 导出文件失败')
      throw new Error(err)
    }
  })
}

function uploadFile() {
  const MyFile = new BaaS.File()
  return MyFile.upload(TMP_FILE_NAME, {category_id: EXPORT_DATA_CATEGORY_ID}).catch(err => {
    console.log('上传文件失败')
    throw new Error(err)
  })
}

module.exports = async function(event, callback) {
  try {
    const date = new Date().getTime()
    const params = event.data
    const groupInfoArr = []
    const groupInfoSplitArr = []

    totalCount = await getTotalCount(params)

    groupSize = Math.ceil(totalCount / LIMIT) || 1
    for (let i = 0; i < groupSize; i++) {
      groupInfoArr.push({
        offset: i * LIMIT,
        limit: LIMIT,
      })
    }

    console.log('groupInfoArr:', groupInfoArr)

    const length = Math.ceil(groupInfoArr.length / MAX_CONNECT_LIMIT)

    for (let i = 0; i < length; i++) {
      groupInfoSplitArr.push(groupInfoArr.splice(0, MAX_CONNECT_LIMIT))
    }

    console.log('groupInfoSplitArr:', groupInfoSplitArr)

    let num = 0

    const getSplitDataList = index => {
      return Promise.all(
        groupInfoSplitArr[index].map(v => {
          return getDataByGroup(params, v.offset, v.limit)
        })
      ).then(res => {
        ++num
        result.push(...Array.prototype.concat(...res))
        if (num < groupInfoSplitArr.length) {
          return getSplitDataList(num)
        } else {
          return result
        }
      })
    }

    const date0 = new Date().getTime()
    console.log('处理分组情况耗时:', date0 - date, 'ms')

    Promise.all([getSplitDataList(num)]).then(res => {
      const date1 = new Date().getTime()
      console.log('结果条数:', result.length)
      console.log('分组拉取数据次数:', num)
      console.log('拉取数据耗时:', date1 - date0, 'ms')

      genExportFile(result, params)

      const date2 = new Date().getTime()
      console.log('处理数据耗时:', date2 - date1, 'ms')

      uploadFile()
        .then(res => {
          const date3 = new Date().getTime()
          console.log('上传文件耗时:', date3 - date2, 'ms')
          console.log('总耗时:', date3 - date, 'ms')

          const fileLink = res.data.file_link

          updateExportJobIdRecord(BAAS_TABLE_ID.export_task, params.jobId, fileLink)
            .then(res => {
              const date4 = new Date().getTime()
              console.log('保存文件下载地址耗时:', date4 - date3, 'ms')
              console.log('总耗时:', date4 - date, 'ms')

              if (params.timing_email) {
                const timeRange =
                  params.tableId === BAAS_TABLE_ID.ticket_inventory ? params.where.order_time : params.where.created_at

                let title = EMAIL_TITLE_MAP[params.tableId]

                // 当导出所有未售出库存时，没有指定 timeRange
                if (!timeRange) {
                  title = 'Not sold ticket list export'
                }

                Promise.all(
                  EMAIL_LIST.map(v => {
                    return sendTimingExportEmail(v, title, fileLink, timeRange)
                  })
                ).then(
                  res => {
                    console.log('发送定时邮件成功')
                    callback(null, {
                      message: '保存文件下载地址成功',
                      fileLink,
                    })
                  },
                  err => {
                    console.log('发送定时邮件失败:', err)
                    callback(err)
                  }
                )
              } else {
                callback(null, {
                  message: '保存文件下载地址成功',
                  fileLink,
                })
              }
            })
            .catch(err => {
              callback(err)
            })
        })
        .catch(err => {
          callback(err)
        })
    })
  } catch (err) {
    callback(err)
  }
}
