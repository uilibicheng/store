const DEV = process.env.NODE_ENV === 'development'

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

const cloudFunctionList = ['export_data']
const cloudFunction = {}
cloudFunctionList.forEach(item => {
  cloudFunction[item] = DEV ? 'dev_' + item : item
})

module.exports = {
  TABLE: table,
  CLOUD_FUNCTION: cloudFunction,
  EXPORT_EXCEL_CATEGORY_ID: DEV ? '5d9dbd4f95e3e55f1be3e2a1' : '5d9dbd45f412b76631e042ad',
}
