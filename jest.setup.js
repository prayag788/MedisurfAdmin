process.env.REACT_APP_IMAGE_PREFIX = process.env.REACT_APP_IMAGE_PREFIX || 'default';
process.env.REACT_APP_NAME = process.env.REACT_APP_NAME || 'Medisurf';

const jestMock = global.jest || require('jest-mock');
try {
	const actualReactRedux = jestMock.requireActual ? jestMock.requireActual('react-redux') : require('react-redux');
	jestMock.mock('react-redux', () => ({
		...actualReactRedux,
		useSelector: (fn) => fn({ auth: {} }),
		useDispatch: () => () => {}
	}));
} catch (e) {
	// If mocking fails, tests will run without redux mocks.
}
