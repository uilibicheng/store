const {TABLE} = require('../../config')
const io = require('./base')

const baseMethodList = ['find', 'first', 'get', 'create', 'update', 'delete', 'updateByQuery']

const common = {}

for (const key in TABLE) {
  const baseReq = {}
  const table = TABLE[key]

  baseMethodList.forEach(method => {
    baseReq[method] = (...args) => io[method](table, ...args)
  })

  common[_ToCamelCase(key)] = baseReq
}

function _ToCamelCase(name) {
  return name.replace(/_(\w)/g, (match, letter) => letter.toUpperCase())
}

module.exports = common
