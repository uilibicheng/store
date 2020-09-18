import io from './base'
import {TABLE_ID} from '../config/constants'

const {PRIZE_REDEMPTION_LOG, PRIZE} = TABLE_ID
export const getPrizeRedemptionList = (params = {}) => {
  return io.getRecordList(PRIZE_REDEMPTION_LOG, params)
}

export const getPrizeRedemptionDetail = id => {
  return io.getRecord(PRIZE_REDEMPTION_LOG, id)
}

export const updatePrizeRedemption = (recordId = '', params = {}) => {
  return io.updateRecord(PRIZE_REDEMPTION_LOG, recordId, params)
}

export const getPrizeList = (params = {}) => {
  return io.getRecordList(PRIZE, params)
}

export const getPrizeDetail = id => {
  return io.getRecord(PRIZE, id)
}

export const getIsPromotionalBundle = (params = {}) => {
  return io.getRecordList(PRIZE, params)
}

export const createPrizeRecord = (params = {}) => {
  return io.createRecord(PRIZE, params)
}

export const updatePrizeRecord = (recordId = '', params = {}) => {
  return io.updateRecord(PRIZE, recordId, params)
}
