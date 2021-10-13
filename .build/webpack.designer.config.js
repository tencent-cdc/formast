const path = require('path')
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const CssConfig = {
  get loader() {
    return process.env.CSS_IN_JS ? 'style-loader' : MiniCssExtractPlugin.loader
  },
  get minimizer() {
    return process.env.CSS_IN_JS ? [] : [new CssMinimizerPlugin()]
  },
  get plugins() {
    return process.env.CSS_IN_JS ? [] : [
      new MiniCssExtractPlugin({
        filename: 'designer.css',
      }),
    ]
  },
  get filename() {
    return process.env.CSS_IN_JS ? 'designer.one.js' : 'designer.js'
  },
}

module.exports = {
  mode: 'production',
  entry: [
    path.resolve(__dirname, '../src/designer/styles.js'),
    path.resolve(__dirname, '../src/designer/index.js'),
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: CssConfig.filename,
    library: {
      type: 'umd',
      name: 'formast-designer',
    },
    globalObject: 'window',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          "presets": [
            "@babel/preset-env",
            "@babel/preset-react"
          ],
          "plugins": [
            "@babel/plugin-proposal-class-properties",
            ["@babel/plugin-transform-runtime", { "regenerator": true }]
          ]
        }
      },
      {
        test: /\.less$/,
        use: [
          CssConfig.loader,
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          CssConfig.loader,
          {
            loader: 'css-loader',
          },
        ],
      },
    ]
  },
  target: 'web',
  optimization: {
    minimize: true,
    minimizer: [
      ...CssConfig.minimizer,
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
    ],
    nodeEnv: process.env.NODE_ENV,
    concatenateModules: false,
    sideEffects: true,
  },
  plugins: [
    ...CssConfig.plugins,
  ],
}
