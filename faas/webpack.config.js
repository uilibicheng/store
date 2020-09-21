const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const fs = require('fs')

const entry = {}
const FUNC_PATH = './src/function'
fs.readdirSync(FUNC_PATH)
  .filter(file => /\.js$/.test(file))
  .forEach(file => (entry[file] = `${FUNC_PATH}/${file}`))

module.exports = function(env, argv) {
  const DEV = env === 'development'

  return {
    mode: env,
    entry,
    output: {
      filename: DEV ? 'dev_[name]' : '[name]',
      library: 'exports.main',
      libraryTarget: 'assign',
    },
    target: 'node',
    plugins: [new CleanWebpackPlugin()],
  }
}
