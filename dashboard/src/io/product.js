import io from './base'
import {TABLE_ID} from '../config/constants'

export const getProductList = (params = {}) => {
  return io.getProductList(TABLE_ID.TICKET, params)
}

export const getProductDetailById = (id = '') => {
  return io.getProductRecordById(TABLE_ID.TICKET, id)
}

export const updateProductRecord = (recordId = '', params = {}) => {
  return io.updateRecord(TABLE_ID.TICKET, recordId, params)
}

export const createProductRecord = (params = {}) => {
  return io.createRecord(TABLE_ID.TICKET, params)
}

export const uploadFileData = (params = {}) => {
  return io.uploadData(TABLE_ID.TICKET_INVENTORY, params)
}
