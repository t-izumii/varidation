const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false
          },
          format: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  }
};

module.exports = [
  // UMD版（ブラウザで直接読み込み可能）
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'form-validator.umd.js',
      library: {
        name: 'FormValidator',
        type: 'umd',
        export: 'FormValidator'
      },
      globalObject: 'this'
    }
  },
  // UMD版（minified）
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'form-validator.umd.min.js',
      library: {
        name: 'FormValidator',
        type: 'umd',
        export: 'FormValidator'
      },
      globalObject: 'this'
    }
  },
  // ES Modules版
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'form-validator.esm.js',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    }
  },
  // CommonJS版
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'form-validator.cjs.js',
      library: {
        type: 'commonjs2'
      }
    }
  },
  // 既存のFormValidator.jsとの互換性用（シンプル版）
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'FormValidator.js',
      library: {
        name: 'FormValidator',
        type: 'window',
        export: 'FormValidator'
      }
    }
  }
];
