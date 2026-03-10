const React = require('react');
module.exports = {
  useSelector: (fn) => fn({ auth: {} }),
  useDispatch: () => () => {},
  Provider: ({ children }) => React.createElement(React.Fragment, null, children),
  connect: () => (Component) => Component
};
