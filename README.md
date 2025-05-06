# CMAP Web

This repository contains the react.js application comprising https://www.simonscmap.com.

## Setup for local development

### Installation

Ensure you have node 12.18.1 installed in your local environment.

1. `git clone git@github.com:simonscmap/cmap-react.git`
2. `cd <PROJECT DIR>`
3. `npm run i`

### Running locally

1. `npm run start` to start the development web server.

### Configuring API Endpoint

The API endpoint is derived from the value of the `NODE_ENV` environment variable as follows:

| NODE_ENV           | Host                     |
| :----------------- | :----------------------- |
| development        | localhost:8080           |
| <all other values> | window.location.hostname |

This behavior is configured in `api/config.js`.

### Tests

- `npm run test` to run all tests

There are select tests in the /Tests directory, using Jest.

- e.g `npm run test src/Tests/Utility/objectUtils.test.js` to run a specific test file.

### Linting

This project continues to use the default lint rules and setup provided by create-react-app. In order to change them, you will need to "eject" the configuration files. See create-react-app documentation.

### Building and Deploying

- `npm run build` to build the application. The result will be placed in the `/build` directory. These files should be placed in the `/public` directory of the web server.

NOTE: the build command generates a buildInfo.json file, which is used to provide metadata to interested modules, such as the logging module. This file is ignored by git.

## Project Overview

`cmap-react` is a [react](https://reactjs.org/) application which has spanned several changes in react idoms, and uses uses both class and functional components; it uses [redux](https://redux.js.org/) for global state with both the connect paradigm and useSelector/useDispatch hooks paradigm. For managing side-effects, the application uses [redux-saga](https://redux-saga.js.org/).

For component styling and layout, this application uses [material-ui v4](https://v4.mui.com/).

## Documentation

For further documentation, see the `/docs` directory.

## Contributing

All source code for the simonscmap.com is on [github](https://github.com/simonscmap/cmap-react). We welcome issue submissions and pull requests. Please follow existing code patterns, where feasible.

For other questions you can reach out on our [public slack channel](simons-cmap.slack.com).
