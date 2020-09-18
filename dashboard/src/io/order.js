import io from './base'
import {TABLE_ID} from '../config/constants'

const ORDER = TABLE_ID.ORDER
export const getOrderList = (params = {}) => {
  return io.getRecordList(ORDER, params)
}

export const updateOrder = (recordID, data) => {
  return io.updateRecord(ORDER, recordID, data)
}

export const getOrder = id => {
  return io.getRecord(ORDER, id)
}
