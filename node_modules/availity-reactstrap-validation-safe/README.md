# availity-reactstrap-validation-safe

Easy to use React validation components compatible for reactstrap.

Forked version of the original project [Availity/availity-reactstrap-validation](https://github.com/Availity/availity-reactstrap-validation), with the patch provided
[here](https://github.com/Availity/availity-reactstrap-validation/pull/159)
that solves this annoying [issue](https://github.com/Availity/availity-reactstrap-validation/issues/155).


## Installation

Install `availity-reactstrap-validation-safe` via NPM

```sh
npm install --save availity-reactstrap-validation-safe
```

If applicable, install a `Promise` polyfill.  For example:

```sh
npm install es6-promise --save
```

The polyfill can be applied into your web application by using tools like Webpack or Babel.

Import the components you need, example:

```js
import { AvField } from 'availity-reactstrap-validation-safe';
```

## Development

Install dependencies:

```sh
npm install
```

Run examples at [http://localhost:8080/](http://localhost:8080/) with Webpack dev server:

```sh
npm start
```

Run tests:

```sh
npm test
```

Run tests & coverage report:

```sh
npm run test:coverage
```

Watch tests:

```sh
npm run test:watch
```

## Disclaimer
Open source software components distributed or made available in the Availity Materials are licensed to Company under the terms of the applicable open source license agreements, which may be found in text files included in the Availity Materials.

## LICENSE [MIT](LICENSE)
