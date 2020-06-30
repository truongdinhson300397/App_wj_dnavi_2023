// Config
const buildPath = ['dist', 'applican', 'web'];
const buildZipPath = ['dist', 'applican'];
const zipName = 'web.zip';
//
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HandlebarsPlugin = require("handlebars-webpack-plugin");
const FileManagerPlugin = require('filemanager-webpack-plugin');

// import the helpers
const handlebarsLayouts = require('handlebars-layouts');

const webpackConfig = {
    entry: path.join(process.cwd(), "nothing.js"),
    mode: "development",
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: buildZipPath
        }),
        new HandlebarsPlugin({
            // path to hbs entry file(s). Also supports nested directories if write path.join(process.cwd(), "app", "src", "**", "*.hbs"),
            entry: path.join(process.cwd(), "src", "*.hbs"),
            // output path and filename(s). This should lie within the webpacks output-folder
            // if ommited, the input filepath stripped of its extension will be used
            output: path.join(process.cwd(), ...buildPath, "[name].html"),
            // you can als add a [path] variable, which will emit the files with their relative path, like
            // output: path.join(process.cwd(), "build", [path], "[name].html"),

            // data passed to main hbs template: `main-template(data)`
            data: require("./env/applican.json"),
            // or add it as filepath to rebuild data on change using webpack-dev-server
            // data: path.join(__dirname, "app/data/project.json"),

            // globbed path to partials, where folder/filename is unique
            partials: [
                path.join(process.cwd(), "src", "components", "*.hbs")
            ],

            // register custom helpers. May be either a function or a glob-pattern
            helpers: {
            },

            // hooks
            // getTargetFilepath: function (filepath, outputTemplate) {},
            // getPartialId: function (filePath) {}
            onBeforeSetup: function (Handlebars) {
                handlebarsLayouts.register(Handlebars);
            },
            onBeforeAddPartials: function (Handlebars, partialsMap) {},
            onBeforeCompile: function (Handlebars, templateContent) {},
            onBeforeRender: function (Handlebars, data, filename) {},
            onBeforeSave: function (Handlebars, resultHtml, filename) {},
            onDone: function (Handlebars, filename) {}
        }),
        new FileManagerPlugin({
            onEnd: {
                copy: [
                    { source: './assets/{css,img,js}/**/*', destination: path.join(...buildPath) },
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
