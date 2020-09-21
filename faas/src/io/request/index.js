const Where = require('./where')
const base = require('./base')
const common = require('./common')

module.exports = {
  get where() {
    return new Where()
  },

  base,
  ...common,
}
