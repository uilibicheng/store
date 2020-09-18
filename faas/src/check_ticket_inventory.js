const constants = require('./constants')
const getTicketInventory = require('./utils/getTicketInventory')

function findTickets() {
  let tableId = constants.BAAS_TABLE_ID.ticket
  const TicketTable = new BaaS.TableObject(tableId)
  return TicketTable.offset(0)
    .limit(500)
    .find()
    .then(res => res.data.objects)
    .catch(err => {
      console.log('error: 获取 ticket 数据时出错', err)
      throw err
    })
}

function setTicketInventory(sku, count) {
  let tableId = constants.BAAS_TABLE_ID.ticket
  const TicketTable = new BaaS.TableObject(tableId)
  const query = new BaaS.Query()
  query.compare('sku', '=', sku)
  const records = TicketTable.getWithoutData(query)
  records.set('inventory', count)
  return records.update().catch(err => {
    console.log('error: 更新 ticket 库存时出错', err)
    throw err
  })
}

module.exports = function(event, callback) {
  findTickets()
    .then(tickets => {
      return Promise.all(
        tickets.map((ticket, index) => {
          const sku = ticket.sku
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              getTicketInventory(sku)
                .then(count => {
                  console.log(`${ticket.name}: ${count}`)
                  return setTicketInventory(sku, count)
                })
                .then(res => resolve(res))
                .catch(err => reject(err))
            }, 200 * index)
          })
        })
      )
    })
    .then(() => callback(null, {message: 'success'}))
    .catch(err => callback(err))
}
