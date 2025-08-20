const { override } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  (config) => {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      util: false, // Specify false to provide an empty module
      stream: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      path: false,
      zlib: false,
      fs: false
    };
    
    return config;
  }
);
