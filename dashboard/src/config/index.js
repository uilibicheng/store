export const DEV = process.env.NODE_ENV === 'development'

export const ENV_ID = 'ec67c77e63eb627a9cb5'
export const CATEGORY_ID = DEV ? '' : ''

const tableList = [
  'access',
  'settings',
  'admin_operation_log',
  'store',
  'tailored',
  'order',
  'invitation_code',
  'article',
  'article_category',
]
const table = {userprofile: '_userprofile', richtextcontent: '_richtextcontent'}
tableList.forEach(item => {
  table[item] = item
})
export const TABLE = table

const cloudFunctionList = ['export_data', 'import_order']
const cloudFunction = {}
cloudFunctionList.forEach(item => {
  cloudFunction[item] = DEV ? 'dev_' + item : item
})
export const CLOUD_FUNCTION = cloudFunction
