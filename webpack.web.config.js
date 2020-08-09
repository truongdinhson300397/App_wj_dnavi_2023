// Config
const buildPath = ['dist', 'web'];
//
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HandlebarsPlugin = require("handlebars-webpack-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');
// import the helpers
const { commonWebOptions } = require("./webpack.handlebar.utils")

const webpackWebConfig = {
  entry: path.join(process.cwd(), "nothing.js"),
  mode: "development",
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: buildPath
    }),
    new HandlebarsPlugin({
      entry: path.join(process.cwd(), "src", "pages", "**", "*.hbs"),
      output: path.join(process.cwd(), ...buildPath, "[name].html"),
      ...commonWebOptions,
      partials: [
          path.join(process.cwd(), "src", "components", "*.hbs"),
          path.join(process.cwd(), "src", "pages", "**", "web", "*.hbs")
      ]
    }),
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { source: './assets/{css,img,js}/**/*', destination: path.join(...buildPath) },
        ],
      },
    }),
  ]
};
module.exports = webpackWebConfig;
