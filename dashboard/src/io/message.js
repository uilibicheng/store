import io from './base'
import {TABLE_ID} from '../config/constants'

const {MESSAGE} = TABLE_ID
export const getMessageList = (params = {}) => {
  return io.getRecordList(MESSAGE, params)
}

export const updateMessage = (recordID, data) => {
  return io.updateRecord(MESSAGE, recordID, data)
}

export const getMessageRecord = id => {
  return io.getRecord(MESSAGE, id)
}

export const createMessageRecord = (params = {}) => {
  return io.createRecord(MESSAGE, params)
}

export const deleteMessageRecord = (recordId = '') => {
  return io.deleteRecord(MESSAGE, recordId)
}
