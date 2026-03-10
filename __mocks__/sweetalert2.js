const React = require('react')
module.exports = {
  __esModule: true,
  default: {
    fire: () => Promise.resolve(),
    showLoading: () => {},
    close: () => {},
  },
  // export helper used by withReactContent
  preventOpenForTesting: true,
}
