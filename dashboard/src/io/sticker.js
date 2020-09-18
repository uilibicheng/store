import io from './base'
import {TABLE_ID} from '../config/constants'

const {STICKER} = TABLE_ID
export const createStickerRecord = (params = {}) => {
  return io.createRecord(STICKER, params)
}

export const updateStickerRecord = (recordId = '', params = {}) => {
  return io.updateRecord(STICKER, recordId, params)
}

export const getStickerList = (params = {}) => {
  return io.getRecordList(STICKER, params)
}

export const getStickerDetail = id => {
  return io.getRecord(STICKER, id)
}

export const deleteStickerRecord = (recordId = '') => {
  return io.deleteRecord(STICKER, recordId)
}