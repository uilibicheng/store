export const DEV = process.env.NODE_ENV === 'development'

export const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const dev_file_group_id = {
  STORE: '5e43b2d5d847c15ca5baa9df',
  INVITATION_CODE: '5e4ccf2416d94d424a288b0b',
  TEMPLATE: '5e674eb16ef5e45e623f88ae',
}

const file_group_id = {
  STORE: '5e64cd33c1be530da7a203ee',
  INVITATION_CODE: '5e6b783252f3c56d3b554589',
  TEMPLATE: '5e6b785764f7fe723ef986e2',
}

export const FILE_GROUP_ID = DEV ? dev_file_group_id : file_group_id

export const TAILORED_TYPE = {
  BODY: 'body_data',
  TAILORING: 'tailoring_data',
}

export const TAILORED_TYPE_NAME = {
  [TAILORED_TYPE.BODY]: '身体数据',
  [TAILORED_TYPE.TAILORING]: '成衣数据',
}

export const CLOTHES_TYPE = {
  JACKET: 'jacket', // 上衣（西装）
  PANTS: 'pants', // 裤子
  WAISTCOAT: 'waistcoat', // 马甲
  SHIRT: 'shirt', // 衬衫
  OVERCOAT: 'overcoat', // 大衣
}

export const CLOTHES_TYPE_NAME = {
  [CLOTHES_TYPE.JACKET]: '上衣',
  [CLOTHES_TYPE.PANTS]: '裤子',
  [CLOTHES_TYPE.WAISTCOAT]: '马甲',
  [CLOTHES_TYPE.SHIRT]: '衬衫',
  [CLOTHES_TYPE.OVERCOAT]: '大衣',
}

export const CLOTHES_NAME = {
  上衣: CLOTHES_TYPE.JACKET,
  裤子: CLOTHES_TYPE.PANTS,
  马甲: CLOTHES_TYPE.WAISTCOAT,
  衬衫: CLOTHES_TYPE.SHIRT,
  大衣: CLOTHES_TYPE.OVERCOAT,
}

export const DATA_TYPE = {
  TEXT: 'text',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  TEXTAREA: 'textarea',
}

export const DATA_TYPE_NAME = {
  [DATA_TYPE.TEXT]: '单位文本',
  [DATA_TYPE.SELECT]: '多项单选',
  [DATA_TYPE.CHECKBOX]: '多选',
  [DATA_TYPE.TEXTAREA]: '多行文本',
}

export const ORDER_STATUS = {
  MEASURED: 'measured',
  BOOKED: 'booked',
  ARRIVED: 'arrived',
  MAKING: 'making',
  SEND_OUT: 'send_out',
  SEND_BACK: 'send_back',
  DELIVERED: 'delivered',
}

export const ORDER_STATUS_NAME = {
  [ORDER_STATUS.MEASURED]: '已量体',
  [ORDER_STATUS.BOOKED]: '已订料',
  [ORDER_STATUS.ARRIVED]: '已到料',
  [ORDER_STATUS.MAKING]: '制衣中',
  [ORDER_STATUS.SEND_OUT]: '半成品寄出',
  [ORDER_STATUS.SEND_BACK]: '半成品寄回',
  [ORDER_STATUS.DELIVERED]: '已交付',
}

export const ORDER_STATUS_TYPE = {
  已量体: ORDER_STATUS.MEASURED,
  已订料: ORDER_STATUS.BOOKED,
  已到料: ORDER_STATUS.ARRIVED,
  制衣中: ORDER_STATUS.MAKING,
  半成品寄出: ORDER_STATUS.SEND_OUT,
  半成品寄回: ORDER_STATUS.SEND_BACK,
  已交付: ORDER_STATUS.DELIVERED,
}

export const ARTICLE_TYPE = {
  OUTFIT: 'outfit',
  PRODUCT: 'product',
  PICTURE: 'picture',
}

export const ARTICLE_TYPE_NAME = {
  [ARTICLE_TYPE.OUTFIT]: '搭配',
  [ARTICLE_TYPE.PRODUCT]: '单品',
  [ARTICLE_TYPE.PICTURE]: '图鉴',
}

export const URL_TYPE = {
  LINK: 'link',
  MINIAPP: 'miniapp',
}

export const URL_TYPE_NAME = {
  [URL_TYPE.LINK]: '链接',
  [URL_TYPE.MINIAPP]: '小程序',
}
