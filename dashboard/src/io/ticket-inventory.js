import io from './base'
import {TABLE_ID} from '../config/constants'

const TICKET_INVENTORY = TABLE_ID.TICKET_INVENTORY
export const getTicketInventoryList = (params = {}) => {
  return io.getInventoryRecordList(TICKET_INVENTORY, params)
}

export const updateTicketInventoryList = (data, params = {}) => {
  return io.updateRecordList(TICKET_INVENTORY, data, params)
}

export const deleteTicketInventoryList = (params = {}) => {
  return io.deleteRecordList(TICKET_INVENTORY, params)
}
