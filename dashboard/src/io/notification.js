import io from './base'
import {TABLE_ID} from '../config/constants'

const {NOTIFICATION} = TABLE_ID
export const getNotificationList = (params = {}) => {
  return io.getRecordList(NOTIFICATION, params)
}

export const updateNotification = (recordID, data) => {
  return io.updateRecord(NOTIFICATION, recordID, data)
}

export const getNotificationRecord = id => {
  return io.getRecord(NOTIFICATION, id)
}

export const createNotificationRecord = (params = {}) => {
  return io.createRecord(NOTIFICATION, params)
}

export const deleteNotificationRecord = (recordId = '') => {
  return io.deleteRecord(NOTIFICATION, recordId)
}
