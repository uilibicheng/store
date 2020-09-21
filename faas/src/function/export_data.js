const exportData = require('../utils/export-data')

module.exports = async function(event, callback) {
  try {
    const fileLink = await exportData(event.data)
    callback(null, fileLink)
  } catch (e) {
    callback(e, null)
  }
}
