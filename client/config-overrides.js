const { override } = require('customize-cra');
const webpack = require('webpack');
const path = require('path');

module.exports = override(
  (config) => {
    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      util: path.resolve(__dirname, 'src/util-shim.js'), // Use our polyfill
      stream: false,
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      path: false,
      zlib: false,
      fs: false,
      crypto: false,
      buffer: false,
      process: false
    };

    // Add polyfill plugin for Node.js globals
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ];
    
    return config;
  }
);
