import io from './base'
import {TABLE_ID} from '../config/constants'

const {TICKET_BUNDLE, TICKET_INVENTORY, TICKET_TYPE} = TABLE_ID
export const getTicketBundleList = (params = {}) => {
  return io.getRecordList(TICKET_BUNDLE, params)
}

export const updateTicketBundle = (recordID, data) => {
  return io.updateRecord(TICKET_BUNDLE, recordID, data)
}

export const createTicketBundle = data => {
  return io.createRecord(TICKET_BUNDLE, data)
}

export const getTicketBundle = id => {
  return io.getRecord(TICKET_BUNDLE, id)
}

export const getTicketInventoryList = (params = {}) => {
  return io.getRecordList(TICKET_INVENTORY, params)
}

export const getTicketTypeList = (params = {}) => {
  return io.getRecordList(TICKET_TYPE, params)
}

export const updateTicketType = (recordID, data) => {
  return io.updateRecord(TICKET_TYPE, recordID, data)
}

export const createTicketType = data => {
  return io.createRecord(TICKET_TYPE, data)
}
