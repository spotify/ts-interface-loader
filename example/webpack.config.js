/** @format */

const path = require('path')

const TSLoaderRule = () => ({
  test: /\.ts$/,
  use: 'ts-loader',
  exclude: /node_modules/,
})

const TSLintLoaderRule = () => ({
  test: /\.ts$/,
  enforce: 'pre',
  use: 'tslint-loader',
})

module.exports = {
  target: 'node',
  entry: './src/index.ts',
  // devtool: 'inline-source-map',
  module: {
    rules: [TSLoaderRule(), TSLintLoaderRule()],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
