const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
    mode: "development",
    devtool: 'source-map',
    entry: "./src/index.ts",

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html')
        })
    ],

    resolve: {
        extensions: ['.ts', '.js']
    }
}