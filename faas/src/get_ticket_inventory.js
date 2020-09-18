const getTicketInventory = require('./utils/getTicketInventory')

module.exports = function(event, callback) {
  const {skuList} = event.data
  const promise = skuList.map(v => getTicketInventory(v))
  Promise.all(promise)
    .then(res => {
      res.forEach(item => {
        if (Error.prototype.isPrototypeOf(item)) {
          throw item
        }
      })
      callback(null, {countList: res})
    })
    .catch(err => {
      callback(err)
    })
}
