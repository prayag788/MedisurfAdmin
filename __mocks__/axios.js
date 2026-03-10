module.exports = {
  __esModule: true,
  default: {
    get: () => Promise.resolve({}),
    post: () => Promise.resolve({}),
    create: function () {
      return module.exports.default
    },
    interceptors: {
      request: { use: () => {} },
      response: { use: () => {} },
    },
    defaults: {
      timeout: 0,
      headers: {},
      baseURL: '',
    },
  },
  get: () => Promise.resolve({}),
  post: () => Promise.resolve({}),
  create: function () {
    return module.exports
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
  defaults: {
    timeout: 0,
    headers: {},
    baseURL: '',
  },
}
