const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: 'cheap-module-source-map',
    entry: {
        background: path.resolve(__dirname, "..", "src/background.ts"),
        "content-script": path.resolve(__dirname, "..", "src/content-script.ts"),
        "popup": path.resolve(__dirname, "..", "src/popup.ts"),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        path: path.join(__dirname, "../dist"),
        filename: "[name].js",
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.join(__dirname, "../src/manifest.json"),
                    to: path.join(__dirname, "../dist")
                },
                {
                    from: path.resolve(__dirname, "..", "src/popup.html"),
                    to: path.join(__dirname, "../dist")
                },
                {
                    from: path.resolve(__dirname, "..", "src/bionic-popup.css"),
                    to: path.join(__dirname, "../dist")
                },
                {
                    from: path.resolve(__dirname, "..", "src/bre.css"),
                    to: path.join(__dirname, "../dist")
                },
                {
                    from: path.resolve(__dirname, "..", "assets/compiled/icon-**.png"),
                    to: path.join(__dirname, "../dist")
                }
            ]
        }),
    ],
};