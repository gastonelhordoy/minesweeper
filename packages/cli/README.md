# CLI TOOL

This tools sends commands to the API through the client library.

**Board representation is not fully implemented**, this is just a very basic implementation only for demostration purposes. 

When **creating or retrieving** a game, all the mines will be visible to easily see the state.

When **revealing** a cell mines will be hidden and the uncovered state of each cell will be displayed.

**Missing parts:**
- Display marks
- Display number of adjacent mines

## TRY IT OUT

Just execute commands from the `cli` directory. By default CLI will hit the server in `localhost`, so it should be up and running already. To target the Heroku instance just add `-k` to any command. A different host can be specified with `-h <host>` (including port if needed).

Display command help:
`node cli --help`

List all the existing games:
`node cli ls -k`

Start a new game with a 15x15 board and 25 mines:
`node cli new -r 15 -c 15 -m 25 -k`

Retrieve a game:
`node cli get -g <GameID> -k`

Leave a game:
`node cli leave -g <GameID> -k`

Reveal/tap a cell in a game:
`node cli reveal -g <GameID> -r <Row> -c <Col> -k`

Mark a cell with a flag:
`node cli flag -g <GameID> -r <Row> -c <Col> -k`

Mark a cell with a question mark:
`node cli flag -g <GameID> -r <Row> -c <Col> -k`

Remove any mark from a cell:
`node cli unmark -g <GameID> -r <Row> -c <Col> -k`

## DOCS
More info about executable packages can be found here:
https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e
