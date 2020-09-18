const constants = require('./constants')
const {BAAS_TABLE_ID, CLOUD_FUNCTION_NAME} = constants

const zeroTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000
const gtTime = zeroTime - 7 * 24 * 60 * 60
const ltTime = zeroTime
const timeRangeObj = {
  $gt: gtTime,
  $lt: ltTime,
}

const prize_redemption_log_row = {
  where: {
    created_at: timeRangeObj,
  },
  timestampConvertKeys: ['closed_at', 'redeemed_at', 'created_at'],
  scientificNotationConvertKeys: ['redemption_code'],
  includeKeys: [
    'status',
    'english_name',
    'type',
    'redemption_code',
    'point',
    'created_at',
    'redeemed_at',
    'closed_at',
    'operator',
  ],
  customizeHeaders: {
    status: 'Status',
    english_name: 'English name',
    type: 'Prize category',
    redemption_code: 'Redemption code',
    point: 'Points',
    created_at: 'Redemption time',
    redeemed_at: 'Write-off time',
    closed_at: 'Expire date',
    operator: 'Operator',
  },
}

const order_row = {
  where: {
    created_at: timeRangeObj,
  },
  expand: 'tickets_with_barcode',
  timestampConvertKeys: ['created_at', 'paid_at', 'refunded_at', 'reservation_date'],
  scientificNotationConvertKeys: ['barcode'],
  splitRowKeys: [
    'bundle_english_name',
    'ticket_type_english_name',
    'barcode',
    'price',
    'order_number',
    'accesso_product_id',
  ],
  splitRow: 'tickets_with_barcode',
  includeKeys: [
    'order_id',
    'status',
    'payment_method',
    'pickup_person',
    'phone',
    'bundle_english_name',
    'ticket_type_english_name',
    'order_number',
    'barcode',
    'utm_source',
    'utm_medium',
    'quantity',
    'price',
    'trade_no',
    'refund_no',
    'created_at',
    'paid_at',
    'reservation_date',
    'refund_operator',
    'refund_memo',
    'refunded_at',
    'accesso_product_id',
  ],
  customizeHeaders: {
    status: 'Order status',
    pickup_person: 'Contact person',
    phone: 'Mobile number',
    order_id: 'Wechat order number',
    bundle_english_name: 'Ticket name',
    ticket_type_english_name: 'Ticket category',
    order_number: 'Ticketing system order number',
    barcode: 'QR code',
    utm_source: 'Ticket purchase method',
    utm_medium: 'Associated coupon',
    quantity: 'Quantity',
    price: 'Price',
    payment_method: 'Payment method',
    paid_at: 'Payment time',
    created_at: 'Order time',
    // QFPay_order_no: 'QFPay order number',
    trade_no: 'Payment transaction number',
    refund_no: 'Refund transaction number',
    refunded_at: 'Refund time',
    refund_memo: 'Refund note',
    refund_operator: 'Operator',
    reservation_date: 'Visit time',
    accesso_product_id: 'Accesso Product ID',
  },
}

const ticket_inventory_row = {
  where: {
    is_deleted: false,
    sold: {
      $ne: 0,
    },
    order_time: timeRangeObj,
  },
  scientificNotationConvertKeys: ['barcode'],
  includeKeys: [
    'order_number',
    'package_name',
    'origin_type',
    'barcode',
    'sold',
    'order_id',
    'trade_no',
    'generated_at',
    'expires_at',
    'status',
    'is_refunded',
  ],
  customizeHeaders: {
    order_number: 'Ticketing system order number',
    order_id: 'Wechat order number',
    trade_no: 'Payment transaction number',
    // QFPay_order_no: 'QFPay order number',
    package_name: 'Ticket name',
    origin_type: 'Ticket category',
    barcode: 'QR code',
    sold: 'Whether it is sold(1:true/0:false)',
    status: 'Status',
    generated_at: 'Start of validity period',
    expires_at: 'End of validity period',
    is_refunded: 'Refunded',
  },
}

const ticket_not_sold_row = Object.assign({}, ticket_inventory_row)
ticket_not_sold_row.where = {
  is_deleted: false,
  sold: {
    $eq: 0,
  },
}
ticket_not_sold_row.expand = 'ticket'
ticket_not_sold_row.includeKeys = [
  'order_number',
  'package_name',
  'origin_type',
  'ticket',
  'barcode',
  'sold',
  'order_id',
  'trade_no',
  'generated_at',
  'expires_at',
  'status',
  'is_refunded',
]
ticket_not_sold_row.customizeHeaders.ticket = 'Unit Price',

module.exports = async function(event, callback) {
  const p1 = BaaS.invoke(
    CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID,
    {timing_email: true, tableId: BAAS_TABLE_ID.order, ...order_row},
    false
  )
  const p2 = BaaS.invoke(
    CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID,
    {timing_email: true, tableId: BAAS_TABLE_ID.prize_redemption_log, ...prize_redemption_log_row},
    false
  )
  const p3 = BaaS.invoke(
    CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID,
    {timing_email: true, tableId: BAAS_TABLE_ID.ticket_inventory, ...ticket_inventory_row},
    false
  )
  const p4 = BaaS.invoke(
    CLOUD_FUNCTION_NAME.CREATE_EXPORT_JOB_ID,
    {timing_email: true, tableId: BAAS_TABLE_ID.ticket_inventory, ...ticket_not_sold_row},
    false
  )

  Promise.all([p1, p2, p3, p4])
    .then(() => {
      callback(null, {
        message: 'success',
      })
    })
    .catch(err => {
      console.log(`定时导出数据表失败:`, err)
      callback(err)
    })
}
