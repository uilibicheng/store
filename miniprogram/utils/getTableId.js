import * as constants from '../config/constants'

export default function(key) {
  const result = constants.DEV ? constants.BAAS_TABLE_ID_DEV[key] : constants.BAAS_TABLE_ID[key]
  if (!result) {
    throw new Error('Table not found')
  } else {
    return result
  }
}
