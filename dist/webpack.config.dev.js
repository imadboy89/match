"use strict";

var createExpoWebpackConfigAsync = require('@expo/webpack-config');

var TerserPlugin = require("terser-webpack-plugin");

module.exports = function _callee(env, argv) {
  var config, config2;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          env["offline"] = false;
          _context.next = 3;
          return regeneratorRuntime.awrap(createExpoWebpackConfigAsync(env, argv));

        case 3:
          config = _context.sent;

          if (!(config.mode === 'production')) {
            _context.next = 11;
            break;
          }

          env["offline"] = true;
          _context.next = 8;
          return regeneratorRuntime.awrap(createExpoWebpackConfigAsync(env, argv));

        case 8:
          config2 = _context.sent;
          config2.optimization.minimize = true; //config.optimization.minimizer = [new TerserPlugin()];

          return _context.abrupt("return", config2);

        case 11:
          return _context.abrupt("return", config);

        case 12:
        case "end":
          return _context.stop();
      }
    }
  });
};