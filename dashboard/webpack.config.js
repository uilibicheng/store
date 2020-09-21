const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env = 'production') => {
  const DEV = env === 'development'

  return {
    mode: env,
    devtool: DEV ? 'cheap-module-eval-source-map' : undefined,
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[hash:4].js',
      chunkFilename: '[name].[chunkhash:4].js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.xlsx?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'assets',
              },
            },
          ],
        },
      ],
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 3000,
      hot: true,
    },
    plugins: [
      new CleanWebpackPlugin(),
      new CopyPlugin([{from: './public/', to: './static/'}]),
      new HtmlWebpackPlugin({
        hash: true,
        template: 'src/index.html',
        chunks: ['main'],
      }),
    ].concat(DEV ? [new webpack.HotModuleReplacementPlugin()] : []),
  }
}
