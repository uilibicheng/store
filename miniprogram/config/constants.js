export const BAAS_CLIENT_ID = '8c7dcfb70cc1f3312dd3'

export const DEV = false

export const BAAS_SCHEMA_ID_PROD = {
  ticket_bundle: 73273,
  ticket: 73277,
  ticket_inventory: 73281,
  order: 73271,
  settings: 73289,
  prize: 73286,
  prize_redemption_log: 73288,
  user: 73294,
  prize_redemption_log_assistance: 72860,
  prize_redemption_log_lottery: 70522,
  sticker: 75450,
  sticker_unlock_log: 75452,
  lottery_settings: 70940,
}

export const BAAS_SCHEMA_ID_DEV = {
  ticket_bundle: 73274,
  ticket: 73278,
  ticket_inventory: 73282,
  order: 73272,
  settings: 73292,
  prize: 73290,
  prize_redemption_log: 73291,
  user: 73293,
  prize_redemption_log_assistance: 70427,
  prize_redemption_log_lottery: 70529,
  sticker: 75449,
  sticker_unlock_log: 75451,
  lottery_settings: 70941,
}

export const BAAS_SCHEMA_ID = DEV ? BAAS_SCHEMA_ID_DEV : BAAS_SCHEMA_ID_PROD

export const ROUTE = {
  INDEX: 'pages/index/index',
  AUTH: 'pages/auth/auth',
  TICKET: 'pages/ticket/ticket',
  DISCOUNT_TICKET_LIST: 'pages/discount-ticket-list/discount-ticket-list',
  PURCHASE: 'pages/purchase/purchase',
  ORDER_LIST: 'pages/order-list/order-list',
  ORDER: 'pages/order/order',
  PRIZE: 'pages/prize/prize',
  AQUARIUM_INFO: 'pages/aquarium-info/aquarium-info',
  TICKET_POLICY: 'pages/ticket-policy/ticket-policy',
  PERSONAL: 'pages/personal/personal',
  PRIZE_LOG: 'pages/prize-log/prize-log',
  TICKET_BUNDLE_LIST: 'pages/ticket-bundle-list/ticket-bundle-list',
  PRIZE_LIST: 'pages/prize-list/prize-list',
  LOTTERY: 'pages/lottery/lottery',
  STICKER_CAMERA: 'pages/sticker-camera/sticker-camera',
  STICKER_CANVAS: 'pages/sticker-canvas/sticker-canvas',
  STICKER_UNLOCK: 'pages/sticker-unlock/sticker-unlock',
}

export const EXCHANGE_RATE = 0.061

const REMOTE_FUNCTION_PROD = {
  CREATE_ORDER: 'create_order',
  CANCEL_ORDER: 'cancel_order',
  REDEEM_PRIZE: 'redeem_prize',
  GET_ORDER: 'get_order',
  GET_GAME_USER: 'get_game_user',
  CREATE_USER: 'create_user',
  GET_TICKET_INVENTORY: 'get_ticket_inventory',
}

const REMOTE_FUNCTION_DEV = {
  CREATE_ORDER: 'dev_create_order',
  CANCEL_ORDER: 'dev_cancel_order',
  REDEEM_PRIZE: 'dev_redeem_prize',
  GET_ORDER: 'dev_get_order',
  GET_GAME_USER: 'dev_get_game_user',
  CREATE_USER: 'dev_create_user',
  GET_TICKET_INVENTORY: 'dev_get_ticket_inventory',
}

export const PRIZE_TYPE = {
  NORMAL: 'normal',
  PROMOTIONAL_BUNDLE: 'promotional_bundle',
  AREA_LIMIT: 'area_limit',
}

export const REMOTE_FUNCTION = DEV ? REMOTE_FUNCTION_DEV : REMOTE_FUNCTION_PROD

export const TICKET_ADD_COUNT_LIMITATION = 20

export const TIMEZONE_DATA = [
  'Asia/Tokyo|LMT JST JDT|-9i.X -90 -a0|0121212121|-3jE90 2qSo0 Rc0 1lc0 14o0 1zc0 Oo0 1zc0 Oo0|38e6',
]

export const TIMEZONE = 'Asia/Tokyo'

export const PARK_MINAPP_ID = 'wxb3b1ddc14ebfbed0'

export const SPECIAL_TICKET_TYPE = {
  SHARE_DISCOUNT: 'share_discount',
  PRIZE_BUY_ONE_GET_ONE_FREE: 'prize_buy_one_get_one_free',
  PRIZE_DISCOUNT: 'prize_discount',
}
