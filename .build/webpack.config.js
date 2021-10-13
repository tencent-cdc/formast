const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const createAnalyzer = (name) => {
  if (process.env.NODE_ENV === 'production') {
    return []
  }
  return [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(__dirname, `../.reports/${name}.bundle-analysis.html`),
      defaultSizes: 'stat',
      openAnalyzer: false,
      excludeAssets: /\.css$/,
    })
  ]
}

const basicConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'none',
  output: {
    path: path.resolve(__dirname, '../dist'),
    library: {
      type: 'umd',
      name: 'formast/[name]',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        options: {
          'presets': [
            '@babel/preset-env',
            '@babel/preset-react',
          ],
          'plugins': [
            '@babel/plugin-proposal-class-properties',
            ['@babel/plugin-transform-runtime', { 'regenerator': true }]
          ]
        },
      },
    ]
  },
  target: 'web',
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
      }),
    ],
    nodeEnv: process.env.NODE_ENV,
    concatenateModules: false,
    sideEffects: true,
  },
  resolve: {
    alias: {
      tyshemo: 'tyshemo/src',
      'ts-fns': 'ts-fns/es',
    },
  },
}

const core = merge(basicConfig, {
  entry: path.resolve(__dirname, '../src/core/schema-parser.js'),
  output: {
    filename: 'index.js',
    library: {
      name: 'formast',
    },
  },
  plugins: createAnalyzer('core'),
})

const react = merge(basicConfig, {
  entry: path.resolve(__dirname, '../src/react/index.js'),
  output: {
    filename: 'react.js',
    library: {
      name: 'formast/react',
    },
  },
  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React',
    },
  },
  plugins: createAnalyzer('react'),
})

const vue = merge(basicConfig, {
  entry: path.resolve(__dirname, '../src/vue/index.js'),
  output: {
    filename: 'vue.js',
    library: {
      name: 'formast/vue',
    },
  },
  externals: {
    vue: {
      amd: 'vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      root: 'Vue',
    },
  },
  plugins: createAnalyzer('vue'),
})

const visual = merge(basicConfig, {
  entry: path.resolve(__dirname, '../src/visual/index.js'),
  output: {
    filename: 'visual.js',
    library: {
      name: 'formast/visual',
    },
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
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
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    ...createAnalyzer('visual'),
    new MiniCssExtractPlugin({
      filename: 'visual.css',
    }),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  externals: {
    react: {
      amd: 'react',
      commonjs: 'react',
      commonjs2: 'react',
      root: 'React',
    },
    'react-dom': {
      amd: 'react-dom',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      root: 'ReactDOM',
    },
  },
})

module.exports = [
  core, react, vue,
  // visual, // 外部不支持
]
