import io from './base'
import {TABLE_ID} from '../config/constants'

const tableId = TABLE_ID.SETTING

export function getlegolandInfoById() {
  return io.getProductList(tableId, {
    where: {
      label: 'default',
    },
    orderBy: 'created_at',
    limit: 1
  })
}

export function updatelegolandInfoById(id, data) {
  return io.updateRecord(tableId, id, data)
}
