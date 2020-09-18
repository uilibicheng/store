export const ROOT_ROUTE = ''
const debug = true

const table_id = {
  TICKET: 73277,
  TICKET_BUNDLE: 73273,
  ORDER: 73271,
  TICKET_INVENTORY: 73281,
  SETTING: 73289,
  TICKET_TYPE: 73275,
  PRIZE_REDEMPTION_LOG: 73288,
  PRIZE: 73286,
  ACCESS_CONTROL: 73295,
  MESSAGE: 74993,
  NOTIFICATION: 76130,
  USER_LOG: 73297,
  USER: 73262,
  EXPORT_TASK: 73299,
  STICKER: 75450,
}

const test_table_id = {
  TICKET: 73278,
  TICKET_BUNDLE: 73274,
  ORDER: 73272,
  TICKET_INVENTORY: 73282,
  SETTING: 73292,
  TICKET_TYPE: 73276,
  PRIZE_REDEMPTION_LOG: 73291,
  PRIZE: 73290,
  ACCESS_CONTROL: 73296,
  MESSAGE: 74992,
  NOTIFICATION: 76129,
  USER_LOG: 73298,
  USER: 73262,
  EXPORT_TASK: 73299,
  STICKER: 75449,
}

const cloud_function_name = {
  CHECK_TICKET_INVENTORY: 'check_ticket_inventory',
  GET_WX_QRCODE: 'get_wx_qrcode',
  EXPORT_DATA: 'export_data',
  CREATE_EXPORT_JOB_ID: 'create_export_job_id',
  SEND_MESSAGE: 'send_message',
  SEND_NOTIFICATION: 'send_notification',
}

const test_cloud_function_name = {
  CHECK_TICKET_INVENTORY: 'dev_check_ticket_inventory',
  GET_WX_QRCODE: 'dev_get_wx_qrcode',
  EXPORT_DATA: 'dev_export_data',
  CREATE_EXPORT_JOB_ID: 'dev_create_export_job_id',
  SEND_MESSAGE: 'dev_send_message',
  SEND_NOTIFICATION: 'dev_send_notification',
}

export const CLOUD_FUNCTION_NAME = debug ? test_cloud_function_name : cloud_function_name

export const TABLE_ID = debug ? test_table_id : table_id

export const PAGE_MAP = [
  {
    id: TABLE_ID.TICKET,
    page: '产品列表',
  },
  {
    id: TABLE_ID.TICKET_BUNDLE,
    page: '门票管理',
  },
  {
    id: TABLE_ID.ORDER,
    page: '产品订单',
  },
  {
    id: TABLE_ID.TICKET_INVENTORY,
    page: '二维码列表',
  },
  {
    id: TABLE_ID.SETTING,
    page: '设置',
  },
  {
    id: TABLE_ID.TICKET_TYPE,
    page: '票种列表',
  },
  {
    id: TABLE_ID.PRIZE_REDEMPTION_LOG,
    page: '兑换记录',
  },
  {
    id: TABLE_ID.PRIZE,
    page: '奖品列表',
  },
  {
    id: TABLE_ID.LEGOLAND_INFO,
    page: '乐高商店信息管理',
  },
  {
    id: TABLE_ID.MESSAGE,
    page: '活动消息发布',
  },
  {
    id: TABLE_ID.NOTIFICATION,
    page: '园区人流通知',
  },
  {
    id: TABLE_ID.STICKER,
    page: '贴纸列表',
  },
  {
    id: TABLE_ID.ACCESS_CONTROL,
    page: '用户列表',
  },
  {
    id: TABLE_ID.USER_LOG,
    page: '操作记录',
  },
  {
    id: TABLE_ID.USER,
    page: '微信用户列表',
  },
]

export const CONTENT_GROUP_ID = {
  GUIDE: 1535102798943570,
}

export const FILE_GROUP_ID = {
  TICKET_BUNDLE: '5cd29f50a56d350bb4d6bea3',
  TICKET: '5cd2afc8a56d351b0ad6d2a3',
  PRIZE: '5cd2aff0a56d352095d6b654',
  BANNER: '5cd2affda56d351b0ad6d35e',
  PRODUCT: '5cd2b00ca56d35201f02f2fb',
  LEGOLAND_INFO: '5cd2b5b2a56d352240d6d4d3',
  STICKER: '5cee43551de2883edeab6a3d',
}

export const TIMEZONE = 'Asia/Tokyo'

export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const ANOTHER_DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss'

export const LANG = {
  ZH: 'zh',
  EN: 'en',
}

export const REGEXP_BARCODE = /[A-Za-z0-9]+/
export const REGEXP_MAX_NUM = /[+-]?[\d]+([.][\d]*)?([Ee][+-]?[0-9]{0,2})?/
export const REGEXP_EMAIL = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

export const SIGN_OUT_URL =
  'https://cloud.minapp.com/logout/?next=https://cloud-minapp-22956.myxiaoapp.com/dashboard/1gmDRCxek770/#/'

export const MESSAGE_TEMPLATE_ID = 'ApmJv2esJcoKEvPHR6E-0jVeNMHl1T0AqGmPMBqpPjE'
export const NOTIFICATION_TEMPLATE_ID = 'XATfnvI4TGaMmgIYogeRrTslksrBZe91zfzsQOXKCzE'
