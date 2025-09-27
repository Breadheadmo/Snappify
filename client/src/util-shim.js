/**
 * Util Polyfill for Browser Environment
 * Provides browser-compatible implementations of Node.js util functions
 */

// Basic util functions that might be needed in the browser
const util = {
  // Inspect function for debugging
  inspect: (obj, options = {}) => {
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, options.depth || 2);
    } catch (error) {
      return String(obj);
    }
  },

  // Format function for string formatting
  format: (f, ...args) => {
    if (typeof f !== 'string') {
      return args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
    }
    
    let i = 0;
    const str = String(f).replace(/%[sdj%]/g, (x) => {
      if (x === '%%') return x;
      if (i >= args.length) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
    
    return str;
  },

  // Deprecate function (no-op in browser)
  deprecate: (fn, msg) => fn,

  // IsArray check
  isArray: Array.isArray,

  // IsBuffer check (always false in browser)
  isBuffer: () => false,

  // IsDate check
  isDate: (obj) => obj instanceof Date,

  // IsError check
  isError: (obj) => obj instanceof Error,

  // IsFunction check
  isFunction: (obj) => typeof obj === 'function',

  // IsNull check
  isNull: (obj) => obj === null,

  // IsNumber check
  isNumber: (obj) => typeof obj === 'number',

  // IsObject check
  isObject: (obj) => typeof obj === 'object' && obj !== null,

  // IsString check
  isString: (obj) => typeof obj === 'string',

  // IsUndefined check
  isUndefined: (obj) => obj === undefined,

  // Inherits function (simplified)
  inherits: (ctor, superCtor) => {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = util;
} else if (typeof window !== 'undefined') {
  window.util = util;
}

export default util;
