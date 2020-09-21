const fs = require('fs')
const xlsx = require('node-xlsx')

const {TABLE, EXPORT_EXCEL_CATEGORY_ID} = require('../config')
const io = require('../io')
const request = require('../io/request')
const requestQueue = require('../lib/request-queue')
const format = require('../utils/format')

const TMP_FILE_NAME = `/tmp/export-data.xlsx`
const PAGE_SIZE = 1000

module.exports = async function(param = {}) {
  const {queryConfig, excelConfig} = param
  let prevStepTime = Date.now()

  try {
    const exportTaskId = await io.createExportTask(param)
    console.log('创建 exportTask 耗时：', Date.now() - prevStepTime, 'ms')
    prevStepTime = Date.now()

    const data = excelConfig.rows || (await getDataWithRequestQueue(queryConfig))
    console.log('获取数据耗时：', Date.now() - prevStepTime, 'ms')
    prevStepTime = Date.now()

    await genExcel(data, excelConfig)
    console.log('构建 Excel 文件耗时：', Date.now() - prevStepTime, 'ms')
    prevStepTime = Date.now()

    const fileLink = await uploadExcel()
    console.log('上传 Excel 文件耗时：', Date.now() - prevStepTime, 'ms')
    prevStepTime = Date.now()

    await io.updateExportTask(exportTaskId, {download_link: fileLink})
    console.log('保存 download_link 耗时：', Date.now() - prevStepTime, 'ms')

    return Promise.resolve(fileLink)
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
 * 分组并使用请求队列获取数据
 */
async function getDataWithRequestQueue(queryConfig = {}) {
  const totalCount = await getData({...queryConfig, limit: 1}).then(res => res.data.meta.total_count)
  console.log('获取数据总条数：', totalCount)

  const groupCount = Math.ceil(totalCount / PAGE_SIZE) || 1
  console.log('分组总数:', groupCount)

  const group = Array(groupCount).fill(undefined)
  const req = requestQueue.hoc(getData)

  const all = group.map((item, index) =>
    req({
      ...queryConfig,
      offset: index * PAGE_SIZE,
      limit: PAGE_SIZE,
    })
      .then(res => {
        const result = res.data.objects
        group[index] = result
        console.log(`获取数据第 ${index + 1} 组数据成功`)
      })
      .catch(err => {
        console.log(`获取数据第 ${index + 1} 组数据失败`)
        throw new Error(err)
      })
  )

  return Promise.all(all).then(res => flatten(group))
}

function getData(queryConfig = {}) {
  const {table = '', offset = 0, limit = PAGE_SIZE, where, orderBy = '-created_by', expand = ''} = queryConfig
  const _table = typeof table === 'number' ? table : TABLE[camelCaseTo_(table)]

  return request.base.find(_table, {offset, limit, where, orderBy, expand})
}

function genExcel(sourceData = [], excelConfig = {}) {
  const {
    title,
    sheetName,
    rows = null,
    cols = [], // 二维数组，item[0] 为每列要取的的字段，item[1] 为列标题，item[2] 为扩展配置 例：['title', '标题', {}]
  } = excelConfig
  const colsField = cols.map(item => item[0])
  const colsTitle = cols.map(item => item[1])

  const closWidth = colsField.map(field => ({wch: isDateField(field) ? 20 : 12}))
  const options = {'!cols': closWidth}

  const data =
    rows ||
    sourceData.map((item, index) =>
      colsField.map((field, cidx) => {
        const val = parseFieldValue(item, field, cols[cidx][2], index)
        return isDateField(field) ? toDate(val) : toStr(val)
      })
    )

  data.unshift(colsTitle) // 添加列标题

  if (title) {
    data.unshift([title]) // 添加首行标题

    const range = {s: {c: 0, r: 0}, e: {c: colsTitle.length - 1, r: 0}}
    options['!merges'] = [range]
  }

  let buffer = null
  try {
    const name = formatSheetName(sheetName || 'sheet')
    buffer = xlsx.build([{name, data, options}])
  } catch (e) {
    console.log('创建 Excel 文件失败')
    return Promise.reject(e)
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(TMP_FILE_NAME, buffer, err => {
      if (err) {
        console.log('写入 Excel 临时文件失败')
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function uploadExcel() {
  const file = new BaaS.File()

  return file
    .upload(TMP_FILE_NAME, {category_id: EXPORT_EXCEL_CATEGORY_ID})
    .then(res => res.data.file_link)
    .catch(err => {
      console.log('上传文件失败')
      throw new Error(err)
    })
}

/**
 * 解析字段值
 * @param {object} data
 * @param {string} field created_by.nickname
 * @param {object} colOptions 列扩展配置
 * @param {number} index
 */
function parseFieldValue(data, field = '', colOptions = {}, index = 0) {
  const {
    defaultValue, // 默认值，支持插值 index
    template, // 字段串，支持插值
    mapping, // 字段值映射表，object
    renderIndex,
    indexStartFrom = 1,
  } = colOptions
  index = index + indexStartFrom

  if (!field) {
    // defaultValue, renderIndex, template 只能同时存在一个
    if (defaultValue !== undefined) {
      return mapping ? mapping[defaultValue] : renderMustache(defaultValue, {...data, index})
    }

    if (renderIndex) {
      return renderIndex === true ? index : renderMustache(renderIndex, {...data, index})
    }

    if (template) {
      return renderMustache(template, {...data, index})
    }
  }

  // 从多层对象中按 field 取得值，比如用于展开 pointer 的场景
  const arr = field.split('.')
  const val =
    arr.reduce((acc, cur) => {
      acc = acc || {}
      return acc[cur]
    }, data) || defaultValue

  if (isObject(val)) {
    return template ? renderMustache(template, val) : val
  } else {
    return mapping ? mapping[val] : val
  }
}

/**
 * 将二维数组展平成一维数组
 */
function flatten(arr) {
  return [].concat.apply([], arr)
}

/**
 * 判断是否保存时间数据的字段
 */
function isDateField(field) {
  return /_at$|_time$/.test(field)
}

function toDate(val) {
  return val ? format.formatDate(val, 'YYYY-MM-DD hh:mm:ss') : ''
}

function isObject(data) {
  return Object.prototype.toString.call(data) === '[object Object]'
}

function toStr(row) {
  if (!row) return ''
  return isObject(row) ? JSON.stringify(row) : row.toString()
}

function camelCaseTo_(name) {
  return name.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function formatSheetName(str) {
  return str && str.length > 28 ? str.substring(0, 28) + '...' : str
}

function renderMustache(str, data) {
  if (!isObject(data)) return data
  if (typeof str !== 'string') return str

  const regx1 = /({{[^}}]*}})/g
  const regx2 = /{{(.+)}}/
  const mustacheList = str.match(regx1) || []
  mustacheList.forEach(item => {
    const result = item.match(regx2)
    const key = result[1]
    if (key) {
      const value = data[key]
      str = str.replace(item, value)
    }
  })
  return str
}
