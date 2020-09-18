module.exports = function(obj) {
  return obj.hasOwnProperty('id') && obj.hasOwnProperty('_table') && Object.keys(obj).length === 2
}
