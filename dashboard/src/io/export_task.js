import io from './base'
import {TABLE_ID} from '../config/constants'

const {EXPORT_TASK} = TABLE_ID
export const getExportTaskRecord = (id = '') => {
  return io.getRecordById(EXPORT_TASK, id)
}
