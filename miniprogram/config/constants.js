export const BAAS_CLIENT_ID = 'b7a5589057d2da1e20d4'

export const DEV = false  // 测试环境开关

export const BAAS_SCHEMA_ID = {
  order: 'order',
  store: 'store',
  invitation_code: 'invitation_code',
  settings: 'settings',
  tailored_parameter: 'tailored_parameter',
  article_category: 'article_category',
  article: 'article',
  tailored: 'tailored',
  banner:'banner',
  program:'program',
  merchant:'merchant',
  merchant_type:'merchant_type',
  coupon:'coupon',
  packages:'packages'
}

export const CONSUMPTION_TYPE = {
  0: '100以下',
  1: '100-200',
  2: '200-300',
  3: '300以上',
}

const REMOTE_FUNCTION_PROD = {
  add_phone_number: 'add_phone_number',
  delete_phone_number: 'delete_phone_number',
  get_store_by_order_id: 'get_store _by_order_id',
  relate_order: 'relate_order',
  verify_invitation_code: 'verify_invitation_code',
  create_store: 'create_store',
  modify_store: 'modify_store',
  create_order: 'create_order',
  modify_order: 'modify_order',
  get_store_by_batch_no: 'get_store_by_batch_no',
}

const REMOTE_FUNCTION_DEV = {
  add_phone_number: 'dev_add_phone_number',
  delete_phone_number: 'dev_delete_phone_number',
  get_store_by_order_id: 'dev_get_store_by_order_id',
  relate_order: 'dev_relate_order',
  verify_invitation_code: 'dev_verify_invitation_code',
  create_store: 'dev_create_store',
  modify_store: 'dev_modify_store',
  create_order: 'dev_create_order',
  modify_order: 'dev_modify_order',
  get_store_by_batch_no: 'dev_get_store_by_batch_no',
}

export const REMOTE_FUNCTION = DEV ? REMOTE_FUNCTION_DEV : REMOTE_FUNCTION_PROD

export const ORDER_STATUS = {
  measured: '已量体',
  booked: '已订料',
  arrived: '已到料',
  making: '制衣中',
  send_out: '半成品寄出',
  send_back: '半成品寄回',
  delivered: '已交付',
}

export const ORDER_STATUS_LIST = [
  {name: '全部状态', value: ''},
  {name: '已量体', value: 'measured'},
  {name: '已订料', value: 'booked'},
  {name: '已到料', value: 'arrived'},
  {name: '制衣中', value: 'making'},
  {name: '半成品寄出', value: 'send_out'},
  {name: '半成品寄回', value: 'send_back'},
  {name: '已交付', value: 'delivered'},
]

export const ORDER_STATUS_LIST_PICKER = [
  {name: '已量体', value: 'measured'},
  {name: '已订料', value: 'booked'},
  {name: '已到料', value: 'arrived'},
  {name: '制衣中', value: 'making'},
  {name: '半成品寄出', value: 'send_out'},
  {name: '半成品寄回', value: 'send_back'},
  {name: '已交付', value: 'delivered'},
]

export const CLOTHES_TYPE = {
  jacket: '上衣',
  pants: '裤子',
  waistcoat: '马甲',
  shirt: '衬衫',
  overcoat: '大衣',
}

export const CLOTHES_TYPE_LIST = [
  {name: '上衣', value: 'jacket'},
  {name: '裤子', value: 'pants'},
  {name: '马甲', value: 'waistcoat'},
  {name: '衬衫', value: 'shirt'},
  {name: '大衣', value: 'overcoat'},
]

export const WIKI_TYPE = {
  outfit: '搭配',
  product: '单品',
  picture: '图鉴',
}
