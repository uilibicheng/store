import io from './base'
import {TABLE_ID} from '../config/constants'

const {USER} = TABLE_ID
export const getUserList = (params = {}) => {
  return io.getRecordList(USER, params)
}
