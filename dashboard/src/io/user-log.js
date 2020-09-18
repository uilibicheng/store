import io from './base'
import {TABLE_ID} from '../config/constants'

const {USER_LOG} = TABLE_ID
export const getUserLogList = (params = {}) => {
  return io.getRecordList(USER_LOG, params)
}

export const createUserLogRecord = (params = {}) => {
  return io.createRecord(USER_LOG, params)
}
