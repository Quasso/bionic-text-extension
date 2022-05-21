const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: 'cheap-module-source-map',
    entry: {
        background: path.resolve(__dirname, "..", "src/background.ts"),
        contentScript: path.resolve(__dirname, "..", "src/contentScript.ts"),
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
                    from: path.join(__dirname, "../dist"),
                    to: path.join(__dirname, "../public")
                }
            ]
        }),
    ],
};