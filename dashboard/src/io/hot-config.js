import io from './base'
import {TABLE_ID} from '../config/constants'

const tableId = TABLE_ID.HOT_CONFIG

export function getHotConfigRecord(type, parms = {}) {
  const data = {...parms}
  if (type !== undefined) data.where = {type: {$eq: type}}
  return io.getRecordList(tableId, data)
}

export function updateHotConfigRecord(recordId, data) {
  return io.updateRecord(tableId, recordId, data)
}
