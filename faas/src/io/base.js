const {TABLE} = require('../config')

const io = {
  get query() {
    return new BaaS.Query()
  },
}

for (const key in TABLE) {
  const table = TABLE[key]

  Object.defineProperty(io, toCamelCase(key), {
    get: () => new BaaS.TableObject(table),
  })
}

function toCamelCase(name) {
  return name.replace(/_(\w)/g, (match, letter) => letter.toUpperCase())
}

module.exports = io
