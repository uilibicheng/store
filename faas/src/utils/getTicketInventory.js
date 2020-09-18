const constants = require('../constants')

module.exports = function getTicketInventory(sku) {
  let tableId = constants.BAAS_TABLE_ID.ticket_inventory
  const TicketInventoryTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  const now = new Date().toISOString()
  query.compare('sku', '=', sku)
  query.compare('sold', '=', 0)
  query.compare('is_deleted', '=', false)
  query.compare('expires_at', '>', now)
  query.compare('generated_at', '<', now)
  return TicketInventoryTable.setQuery(query)
    .count()
    .catch(err => {
      console.log('error: 统计 ticket 库存时出错', err)
      throw err
    })
}
