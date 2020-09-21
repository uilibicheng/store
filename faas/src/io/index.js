const io = require('./base')
const common = require('./common')

for (const key in common) {
  io[key] = common[key]
}

module.exports = io
