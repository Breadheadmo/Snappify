// This polyfill file only provides browser-compatible polyfills
// for commonly used functions and doesn't rely on Node.js modules

// Polyfill for Object.assign if not available in the browser
if (typeof Object.assign !== 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}
