import io from './base'
import {TABLE_ID} from '../config/constants'

const {ACCESS_CONTROL} = TABLE_ID
export const getAccessControlList = (params = {}) => {
  return io.getRecordList(ACCESS_CONTROL, params)
}

export const getAccessControlRecord = id => {
  return io.getRecord(ACCESS_CONTROL, id)
}

export const getAccessControlRecordByEmail = email => {
  return getAccessControlList({where: {email: {$eq: email}}, limit: 1}).then(({data}) => {
    const hasUser = Array.isArray(data.objects) && !!data.objects.length
    return hasUser ? data.objects[0] : {}
  })
}

export const updateAccessControlRecord = (recordId = '', params = {}) => {
  return io.updateRecord(ACCESS_CONTROL, recordId, params)
}

export const deleteAccessControlRecord = (recordId = '') => {
  return io.deleteRecord(ACCESS_CONTROL, recordId)
}

export const createAccessControlRecord = (params = {}) => {
  return io.createRecord(ACCESS_CONTROL, params)
}
