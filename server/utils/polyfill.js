// Polyfill for util._extend
const util = require('util');

// If util._extend exists, replace it with Object.assign to avoid deprecation warning
if (util && util._extend) {
  util._extend = Object.assign;
}

module.exports = util;
