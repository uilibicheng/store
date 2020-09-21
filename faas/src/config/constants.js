const CLOTHES_TYPE = {
  JACKET: 'jacket', // 上衣（西装）
  PANTS: 'pants', // 裤子
  WAISTCOAT: 'waistcoat', // 马甲
  SHIRT: 'shirt', // 衬衫
  OVERCOAT: 'overcoat', // 大衣
}

const CLOTHES_TYPE_NAME = {
  [CLOTHES_TYPE.JACKET]: '上衣',
  [CLOTHES_TYPE.PANTS]: '裤子',
  [CLOTHES_TYPE.WAISTCOAT]: '马甲',
  [CLOTHES_TYPE.SHIRT]: '衬衫',
  [CLOTHES_TYPE.OVERCOAT]: '大衣',
}

const CLOTHES_NAME = {
  上衣: CLOTHES_TYPE.JACKET,
  裤子: CLOTHES_TYPE.PANTS,
  马甲: CLOTHES_TYPE.WAISTCOAT,
  衬衫: CLOTHES_TYPE.SHIRT,
  大衣: CLOTHES_TYPE.OVERCOAT,
}

const ORDER_STATUS = {
  MEASURED: 'measured',
  BOOKED: 'booked',
  ARRIVED: 'arrived',
  MAKING: 'making',
  SEND_OUT: 'send_out',
  SEND_BACK: 'send_back',
  DELIVERED: 'delivered',
}

const ORDER_STATUS_NAME = {
  [ORDER_STATUS.MEASURED]: '已量体',
  [ORDER_STATUS.BOOKED]: '已订料',
  [ORDER_STATUS.ARRIVED]: '已到料',
  [ORDER_STATUS.MAKING]: '制衣中',
  [ORDER_STATUS.SEND_OUT]: '半成品寄出',
  [ORDER_STATUS.SEND_BACK]: '半成品寄回',
  [ORDER_STATUS.DELIVERED]: '已交付',
}

const ORDER_STATUS_TYPE = {
  已量体: ORDER_STATUS.MEASURED,
  已订料: ORDER_STATUS.BOOKED,
  已到料: ORDER_STATUS.ARRIVED,
  制衣中: ORDER_STATUS.MAKING,
  半成品寄出: ORDER_STATUS.SEND_OUT,
  半成品寄回: ORDER_STATUS.SEND_BACK,
  已交付: ORDER_STATUS.DELIVERED,
}

module.exports = {
  CLOTHES_TYPE,
  CLOTHES_TYPE_NAME,
  CLOTHES_NAME,
  ORDER_STATUS,
  ORDER_STATUS_NAME,
  ORDER_STATUS_TYPE,
}