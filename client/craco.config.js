// Webpack 5 polyfill configuration
module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          util: false
        }
      }
    }
  }
};
