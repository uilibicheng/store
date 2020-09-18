import io from './base'
import {TABLE_ID} from '../config/constants'

const {TICKET_TYPE} = TABLE_ID
export const getTicketTypeList = (params = {}) => {
  return io.getRecordList(TICKET_TYPE, params)
}

export const getTicketTypeDetailById = (id = '') => {
  return io.getRecordById(TICKET_TYPE, id)
}

export const updateTicketTypeRecord = (recordId = '', params = {}) => {
  return io.updateRecord(TICKET_TYPE, recordId, params)
}

export const createTicketTypeRecord = (params = {}) => {
  return io.createRecord(TICKET_TYPE, params)
}
