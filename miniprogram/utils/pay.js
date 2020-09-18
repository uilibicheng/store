import ksher_pay from '../lib/ksher_pay'
import {BAAS_SCHEMA_ID} from '../config/constants'

module.exports = function pay(orderId, tickets, ticketBundleName, totalCost) {
  return ksher_pay({
    totalCost,
    merchandiseDescription: ticketBundleName,
    merchandiseSchemaID: BAAS_SCHEMA_ID.order,
    merchandiseRecordID: orderId,
    merchandiseSnapshot: tickets,
  }).catch(err => {
    console.log('支付错误', err)
    throw err
  })
}
