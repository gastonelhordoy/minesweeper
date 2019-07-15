# minesweeper

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Structure

The project is structured following [Lerna's](https://lernajs.io/) recommendation for multi-packages repositories (monorepos).

The project is composed by the following **packages**:

- `core`: [Core library](./packages/core/README.md) that handles business logic for the game and persistence. It is designed to be imported, used and exposed by other packages according to the needs. It can be exposed as RESTful services in a single monolith server, or through individual microservices, or it even be loaded directly into an Electron app.
- `common`: [Shared library](./packages/common/README.md) that has constant definitions and common utilities for handling a minesweeper board.
- `api`: [API server](./packages/api/README.md) exposing a RESTful interface for interacting with persistent minesweeper games.
- `client`: [HTTP library](./packages/client/README.md) to easily integrate with the REST services exposed by the API server.
- `cli`: [Command-line tool](./packages/cli/README.md) to interact with and display information from the API server through the client library.

## Development

### Setup

1. `git clone {repository}`
2. `cd {directory}`
3. `npm i`
4. `lerna bootstrap`
5. Ready to go!

### Start the API

Execute `npm start` or `node app.js` in **packages/api**.
By default API server will listen on **port 5001**.

### Tests

Tests are places inside the `api` package since they ensure the core business logic works as expected. They are writen using mocha, chai, supertest and mockgoose, so there is no need to prepare a specific environment for them to run, making it very easy to integrate in a CI platform.

To run them go to the `packages/api` directory and execute `npm test`.

### Conventions

This project should stick to the following conventions:

- [standardjs](https://www.npmjs.com/package/standard)
- [conventional changelog](https://github.com/conventional-changelog/conventional-changelog)
- [semantic versioning](http://semver.org/)

### Prerequisites

- [git](https://git-scm.com/): be sure to have **version >= 2.9** installed.
- [Node.js](https://nodejs.org/en/): **version 8.x**.
- [npm](https://docs.npmjs.com/getting-started/installing-node#updating-npm): npm is intalled as part of node's installation, but it might be out of date, so update it.
- [lerna](https://www.npmjs.com/package/lerna): install the tool globally and use it to deal with tasks across all the different packages that are part of this project.
- [standard](https://www.npmjs.com/package/standard): install the tool glabally.
- [MongoDB](https://www.mongodb.com/download-center#community): install it locally or use one [hosted on the Cloud](https://mlab.com/) and change the configuration settings in **api**.

### Additional Tools

- [commitizen](https://www.npmjs.com/package/commitizen): install the tool globally and commit changes with `git cz` instead of `git commit -m "message"`
- [npm-quick-run](https://www.npmjs.com/package/npm-quick-run): install the tool globally and use `nr script-name` to run scripts from `package.json` files.
- [lerna-semantic-release](https://www.npmjs.com/package/lerna-semantic-release): adapter to [semantic-release](https://www.npmjs.com/package/semantic-release) targetting lerna projects. Install the tool globally.
- [istanbul](https://www.npmjs.com/package/istanbul): install the tool globally to get coverage report from mocha tests.
- [lerna-wizard](https://www.npmjs.com/package/lerna-wizard): if you prefer to use the assisted version of lerna install `lerna-wizard` globally and use it instead of `lerna`.

### Editor plugins

- [SublimeLinter-contrib-standard](https://packagecontrol.io/packages/SublimeLinter-contrib-standard): install SublimeLinter and install this package for automatically get linter errors in Sublime.
- [StandardFormat](https://packagecontrol.io/packages/StandardFormat): install this package for automatic formatting on save.

For other editors you can check [the specific section from standardjs](https://www.npmjs.com/package/standard#are-there-text-editor-plugins).
