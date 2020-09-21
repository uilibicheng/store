import {TABLE} from '../config'
import io from './base'
import format from '../utils/format'

const baseMethodList = ['find', 'first', 'get', 'create', 'update', 'delete', 'updateByQuery', 'deleteByQuery']

const common = {}

for (const key in TABLE) {
  const baseReq = {}
  const table = TABLE[key]

  baseMethodList.forEach(method => {
    baseReq[method] = (...args) => io[method](table, ...args)
  })

  common[format._ToCamelCase(key)] = baseReq
}

export default common
