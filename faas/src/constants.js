const BAAS_TABLE_ID_PROD = {
  ticket_bundle: 73273,
  ticket: 73277,
  ticket_inventory: 73281,
  order: 73271,
  settings: 73289,
  prize: 73286,
  prize_redemption_log: 73288,
  user: 73294,
  export_task: 73299,
  redemption_log_assistance: 72860,
  redemption_log_lottery: 70522,
  lottery_winner: 73301,
  lottery: 70519,
  lottery_log: 70520,
  message: 74993,
  notification: 76130,
}

const BAAS_TABLE_ID_DEV = {
  ticket_bundle: 73274,
  ticket: 73278,
  ticket_inventory: 73282,
  order: 73272,
  settings: 73292,
  prize: 73290,
  prize_redemption_log: 73291,
  user: 73293,
  export_task: 73299,
  redemption_log_assistance: 70427,
  redemption_log_lottery: 70529,
  lottery_winner: 73300,
  lottery: 70526,
  lottery_log: 70527,
  message: 74992,
  notification: 76129,
}

const cloud_function_name = {
  EXPORT_DATA: 'export_data',
  CREATE_EXPORT_JOB_ID: 'create_export_job_id',
  SEND_MESSAGE: 'send_message',
}

const test_cloud_function_name = {
  EXPORT_DATA: 'dev_export_data',
  CREATE_EXPORT_JOB_ID: 'dev_create_export_job_id',
  SEND_MESSAGE: 'dev_send_message',
}

const EMAIL_LIST_PROD = [
  'Megumi.Honda@LEGOLAND.jp',
  'Sarah.Shen@merlinentertainments.biz',
]

const EMAIL_LIST_DEV = ['jiamingli@ifanr.com']

const CLOUD_FUNCTION_NAME = process.env.NODE_ENV === 'production' ? cloud_function_name : test_cloud_function_name

const BAAS_TABLE_ID = process.env.NODE_ENV === 'production' ? BAAS_TABLE_ID_PROD : BAAS_TABLE_ID_DEV

const EMAIL_LIST = process.env.NODE_ENV === 'production' ? EMAIL_LIST_PROD : EMAIL_LIST_DEV

const EMAIL_TITLE_MAP = {
  [BAAS_TABLE_ID.ticket_inventory]: 'Inventory list export',
  [BAAS_TABLE_ID.order]: 'Sales record list export',
  [BAAS_TABLE_ID.prize_redemption_log]: 'Redemption record list export',
}

const ORDER_STATUS = {
  NOT_PAID: 'not_paid',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CLOSED: 'closed',
}

const REDEMPTION_LOG_STATUS = {
  PENDING: 'pending',
  CLOSED: 'closed',
  REDEEMED: 'redeemed',
}

const PRIZE_TYPE = {
  NORMAL: 'normal',
  PROMOTIONAL_BUNDLE: 'promotional_bundle',
  AREA_LIMIT: 'area_limit',
}

const EXPORT_DATA_CATEGORY_ID = '5cd38981ad1b2436065092d0'

const API = 'https://cloud.minapp.com/dserve/v1.8/schema'

const SPECIAL_TICKET_TYPE = {
  SHARE_DISCOUNT: 'share_discount',
  PRIZE_BUY_ONE_GET_ONE_FREE: 'prize_buy_one_get_one_free',
  PRIZE_DISCOUNT: 'prize_discount',
  COMPLIMENTARY: 'complimentary',
}

const TICKET_UTM_SOURCE = {
  ASSISTANCE: 'assistance',
  LOTTERY: 'lottery',
  SHARE: 'share',
}

const MESSAGE_STATUS = {
  UNSENT: 'unsent',
  SENDING: 'sending',
  SENT: 'sent',
  FAIL: 'fail',
}

const HOURS_OFFSET_BEIJING_PRO = +1 /** 正式版使用日本时间，和北京时间的差距为 +1 */
const HOURS_OFFSET_BEIJING_DEV = +0 /** 调试时使用北京时间 */
const HOURS_OFFSET_BEIJING = process.env.NODE_ENV === 'production' ? HOURS_OFFSET_BEIJING_PRO : HOURS_OFFSET_BEIJING_DEV

const MESSAGE_TEMPLATE_ID = 'ApmJv2esJcoKEvPHR6E-0jVeNMHl1T0AqGmPMBqpPjE'

module.exports = {
  BAAS_TABLE_ID,
  BAAS_TABLE_ID_DEV,
  ORDER_STATUS,
  REDEMPTION_LOG_STATUS,
  TIMEZONE: 'Asia/Tokyo',
  PRIZE_TYPE,
  EXPORT_DATA_CATEGORY_ID,
  API,
  CLOUD_FUNCTION_NAME,
  EMAIL_TITLE_MAP,
  EMAIL_LIST,
  SPECIAL_TICKET_TYPE,
  TICKET_UTM_SOURCE,
  HOURS_OFFSET_BEIJING,
  MESSAGE_STATUS,
  MESSAGE_TEMPLATE_ID,
}
