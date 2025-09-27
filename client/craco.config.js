const path = require('path');

// Webpack 5 polyfill configuration
module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          util: path.resolve(__dirname, 'src/util-shim.js'),
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
        }
      },
      plugins: [
        new (require('webpack').ProvidePlugin)({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ]
    }
  }
};
