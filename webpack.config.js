'use strick';

// Зависимости
const webpack = require("webpack");
const path = require('path');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CnameWebpackPlugin = require('cname-webpack-plugin');
const extractCSS = require("extract-text-webpack-plugin");


// Настройка для SVGO-loader
const svgoConfig = JSON.stringify({
  plugins: [{
    removeTitle: true
  }, {
    convertColors: {
      shorthex: false
    }
  }, {
    convertPathData: true
  }]
});

const options = {
  userAgents: {
    userAgent: "*",
    allow: "/",
  },
  host: "https://yartsev.by"
};


module.exports = {
  context: path.join(__dirname, "src"),

  entry: {
    commons: './index'
  },

  output: {
    path: path.join(__dirname, "dist"),
    publicPath: '/',
    filename: 'js/[name].js'
  },
  resolve: {
    alias: {
      'inputmask.dependencyLib': path.join(__dirname, 'node_modules/jquery.inputmask/extra/dependencyLibs/inputmask.dependencyLib.jqlite.js'),
      'inputmask': path.join(__dirname, 'node_modules/jquery.inputmask/dist/inputmask/inputmask.js')
    },
    modules: ['node_modules'],
    extensions: ['.js', ".json"]
  },
  resolveLoader: {
    modules: ["node_modules"],
    extensions: [".js", ".json"],
    mainFields: ["loader", "main"],
    moduleExtensions: ['-loader']
  },
  target: 'web',
  module: {
    // configuration regarding modules

    rules: [
      // rules for modules (configure loaders, parser options, etc.)
      { // Javascript
        test: /\.js$/,
        include: [
          path.join(__dirname, "src"),
          path.join(__dirname, "node_modules", "svg-sprite-loader", "lib", "plugin.js")
        ],
        use: "babel?presets[]=es2015"
      }, 
      { // SCSS в файлы
        test: /\.(sass|scss)$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'sass-loader'
            }
          ]
        })
      },

      { // Картинки 
        test: /\.(png|jpg|svg|gif)$/,
        exclude: path.join(__dirname, "src", "icons"),
        // use: 'file?name=images/[name].[ext]'
        use: [
          'file-loader?name=images/[name].[ext]',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              // the webp option will enable WEBP
              webp: {
                quality: 75
              }
            }
          },
        ],
      }, { // Копируем шрифты
        test: /\.(ttf|eot|woff|woff2)$/,
        use: 'file?name=assets/fonts/[path][name].[ext]'
      }, {
        test: /\.svg$/,
        include: path.join(__dirname, "src", "icons"),
        use: [

          {
            loader: 'svg-sprite-loader',
            options: {
              extract: true,
              spriteFilename: 'icons/icons-sprite.svg'
            }

          }, {
            loader: 'svgo-loader?' + svgoConfig
          }
        ]
      },
      {
        test: /\.(png|json|xml|ico)$/,
        include: path.join(__dirname, "src", "images", "favicons"),
        loader: 'file-loader?name=images/favicons/[name].[ext]'
      },
      {
        test: /favicon\.ico$/,
        include: path.join(__dirname, "src", "images", "favicons"),
        loader: 'file-loader?name=favicon.ico'
      },
      {
        test: /_redirects$/,
        include: path.join(__dirname, "src"),
        loader: 'file-loader?name=_redirects'
      }
    ]
  },
  plugins: [
    new CnameWebpackPlugin({
      domain: 'yartsev.by',
    }),
    new webpack.ProvidePlugin({
      _: "lodash"
    }),
    new HtmlWebpackPlugin({
      title: 'Udelta - digital marketing agency',
      filename: 'index.html',
      template: 'ejs?raw=true!./src/html/index.ejs',
      inject: true
    }),
    new extractCSS({
      filename: 'css/[name].css',
      allChunks: true
    }),
  ],
  devServer: {
    contentBase: __dirname + "/dist/",
    // contentBase: path.join(__dirname, "public"),
    // compress: true,
    port: 9000
  }
}