"use strict";

const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      "content-script": PATHS.src + "/content/index.js",
      background: PATHS.src + "/background/index.js",
      popup: PATHS.src + "/popup/index.js",
      "ad-detector": PATHS.src + "/model/detector.js",
    },
    output: {
      filename: "[name].js", // This ensures the output filenames match the entry keys
      path: PATHS.build,
    },
    devtool: argv.mode === "production" ? false : "source-map",
  });

module.exports = config;
