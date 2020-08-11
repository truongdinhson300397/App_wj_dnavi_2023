// Config
const buildPath = ['dist', 'applican', 'web'];
const buildZipPath = ['dist', 'applican'];
const zipName = 'web.zip';
//
const path = require("path");
// const url = require("url");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HandlebarsPlugin = require("handlebars-webpack-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { commonAppOptions } = require('./webpack.handlebar.utils');

const webpackConfig = {
  entry: path.join(process.cwd(), "nothing.js"),
  mode: "development",
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: buildZipPath
    }),
    new HandlebarsPlugin({
      entry: path.join(process.cwd(), "src", "pages", "*.hbs"),
      output: path.join(process.cwd(), ...buildPath, "[name].html"),
      partials: [
        path.join(process.cwd(), "src", "components", "**", "*.hbs")
      ],
      ...commonAppOptions,
    }),
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { source: './assets/{css,img,js,webview}/**/*', destination: path.join(...buildPath) },
          { source: './applican-assets/**/*', destination: path.join(...buildPath) },
        ],
        move: [
          { source: path.join(...buildPath, 'CL0020.html'), destination: path.join(...buildPath, 'index.html') },
        ],
        archive: [
          { source: path.join(...buildZipPath), destination: path.join(...buildZipPath, zipName) },
        ]
      }
    }),
  ]
};
module.exports = webpackConfig;
