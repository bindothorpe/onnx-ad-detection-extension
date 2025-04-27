"use strict";

const path = require("path");

const PATHS = {
  src: path.resolve(__dirname, "../src"),
  build: path.resolve(__dirname, "../build"),
  content: path.resolve(__dirname, "../src/content"),
  background: path.resolve(__dirname, "../src/background"),
  popup: path.resolve(__dirname, "../src/popup"),
  model: path.resolve(__dirname, "../src/model"),
  utils: path.resolve(__dirname, "../src/utils"),
};

module.exports = PATHS;
