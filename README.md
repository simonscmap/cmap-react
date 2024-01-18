# CMAP Web


This repository contains the react.js application comprising https://www.simonscmap.com.

## Setup for local development

### Installation

Ensure you have `node.js` >= 14.x installed in your local environment.

1. `git clone git@github.com:simonscmap/cmap-react.git`
2. `cd <PROJECT DIR>`
3. `npm run i`

### Running locally

After cloning this repository and running `npm i`, run `npm run start` to start the web app. However, the app assumes that if you are not running in production (`process.env.NODE_ENV === 'production'`) that you have the api running locally on `localhost:8080`. There is no convenient way to change this, at present. If you have a good reason to work around this, you will have to modify `api/config.js` to point to a different location for the api (Note that running the api requires credentials).

#### commit hooks

We run one pre-commit hook that warns you if you have modified source code and not updated relevant doc files (where "relevant docs" is assumed to be the closest *-doc.md to the changed source file).

### Tests

There are minimal smoke tests in /Tests. More thorough tests are on our roadmap.

## Overview

`cmap-react` is a [react](https://reactjs.org/) application which has spanned several changes in react idoms, and uses uses both class and functional components; it uses [redux](https://redux.js.org/) for global state with both the connect paradigm and useSelector/useDispatch hooks paradigm. For managing side-effects, the application uses [redux-saga](https://redux-saga.js.org/).

For styling and layout, this application uses [material-ui v4](https://v4.mui.com/).

## Documentation

Currently there is no systematic documentation for the web application. We are, however, beginning to add readme files with general information and guidance concerning the contents of that directory. These should contain links to each other; you can begin browsing at the root of the (src)[./src/source.md] directory.

## Contributing

All source code for the simonscmap.com is on [github](https://github.com/simonscmap/cmap-react). We welcome issue submissions and pull requests. Please follow existing code patterns, where feasible. We use `prettierjs` for code formatting.

For other questions you can reach out on our [public slack channel](simons-cmap.slack.com).
