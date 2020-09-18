import io from './base'
import {TABLE_ID} from '../config/constants'

const {SETTING} = TABLE_ID
export const getSettingList = (params = {}) => {
  return io.getRecordList(SETTING, params)
}

export const updateSetting = (recordID, data) => {
  return io.updateRecord(SETTING, recordID, data)
}

export const getSetting = id => {
  return io.getRecord(SETTING, id)
}
