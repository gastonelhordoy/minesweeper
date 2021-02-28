# API Server

[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

API server exposing business logic as RESTful services.

## Tests

Run the following command in console/terminal:

`npm test`

## Swagger Docs

Swagger specification is published as JSON on the following URL:
```
http://localhost:5001/api-docs.json

https://minesweepper-api.herokuapp.com/api-docs/#/
```

It can also be visualized with the Swagger UI navigating to:
```
http://localhost:5001/api-docs
```

The specification is generating on the fly on server startup. It's written using JSDocs inside the modules where express routing is configured, so to be right next to the implementation and it's easier to mantain in sync.
