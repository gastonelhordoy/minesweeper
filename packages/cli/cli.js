#!/usr/bin/env node

'use strict'

const yargs = require('yargs')
const colors = require('colors')

const Client = require('minesweeper-client')
const printer = require('./printer')

function buildHandler (handler) {
  return async args => {
    try {
      if (args.heroku) {
        args.host = 'minesweepper-api.herokuapp.com'
      }
      const client = new Client({ host: args.host })
      await handler(args, client)
      process.exit(0)
    } catch (err) {
      console.error(colors.red(err.message))
      if (args.debug) {
        console.error(colors.red(err.stack))
      }
      process.exit(1)
    }
  }
}

yargs // eslint-disable-line no-unused-expressions
  .help('help')
  .version('version', '1.0.0').alias('version', 'v')
  // .usage('Usage: $0 -h <host>') // usage string of application.
  .command({
    command: 'list',
    aliases: 'ls',
    desc: 'List games',
    builder: (yargs) => {
      yargs.usage('Usage: $0 ls')
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const games = await client.games.search()
      printer.games(games)
    })
  })
  .command({
    command: 'new',
    aliases: ['create', 'start'],
    desc: 'Start a new game',
    builder: (yargs) => {
      yargs.usage('Usage: $0 new -r <rows> -c <cols> -m <mines>')
        .option('rows', {
          alias: 'r',
          describe: 'Rows number',
          demandOption: true,
          default: 10,
          type: 'number',
          nargs: 1
        })
        .option('cols', {
          alias: 'c',
          describe: 'Columns number',
          demandOption: true,
          default: 10,
          type: 'number',
          nargs: 1
        })
        .option('mines', {
          alias: 'm',
          describe: 'Mines count',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const game = await client.games.create(args.rows, args.cols, args.mines)
      printer.gameInfo(game)
    })
  })
  .command({
    command: 'get',
    desc: 'Get game by ID',
    builder: (yargs) => {
      yargs.usage('Usage: $0 get -g <game>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const game = await client.games.getById(args.game)
      printer.gameInfo(game)
    })
  })
  .command({
    command: 'abandon',
    aliases: ['remove', 'rm', 'leave'],
    desc: 'Abandon a game',
    builder: (yargs) => {
      yargs.usage('Usage: $0 rm -g <game>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      await client.games.remove(args.game)
      const game = await client.games.getById(args.game)
      printer.gameInfo(game)
    })
  })
  .command({
    command: 'reveal',
    aliases: ['rv', 'tap', 'touch'],
    desc: 'Reveal cell in game',
    builder: (yargs) => {
      yargs.usage('Usage: $0 rv -g <game> -r <row> -c <col>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        .option('row', {
          alias: 'r',
          describe: 'Row number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        .option('col', {
          alias: 'c',
          describe: 'Column number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const result = await client.games.revealCell(args.game, args.row, args.col)
      // printer.statusChanges(result)
      printer.gameInfo(result, true)
    })
  })
  .command({
    command: 'flag',
    aliases: ['f'],
    desc: 'Put a flag mark to a cell',
    builder: (yargs) => {
      yargs.usage('Usage: $0 flag -g <game> -r <row> -c <col>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        .option('row', {
          alias: 'r',
          describe: 'Row number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        .option('col', {
          alias: 'c',
          describe: 'Column number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const result = await client.games.markCell(args.game, args.row, args.col, 'flag')
      // printer.statusChanges(result)
      printer.gameInfo(result, true)
    })
  })
  .command({
    command: 'question',
    aliases: ['q'],
    desc: 'Put a question mark to a cell',
    builder: (yargs) => {
      yargs.usage('Usage: $0 question -g <game> -r <row> -c <col>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        .option('row', {
          alias: 'r',
          describe: 'Row number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        .option('col', {
          alias: 'c',
          describe: 'Column number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const result = await client.games.markCell(args.game, args.row, args.col, 'question')
      // printer.statusChanges(result)
      printer.gameInfo(result, true)
    })
  })
  .command({
    command: 'unmark',
    aliases: ['clear', 'clr'],
    desc: 'Remove any mark from a cell',
    builder: (yargs) => {
      yargs.usage('Usage: $0 unmark -g <game> -r <row> -c <col>')
        .option('game', {
          alias: 'g',
          describe: 'Game ID',
          demandOption: true,
          requiresArg: true,
          type: 'string',
          nargs: 1
        })
        .option('row', {
          alias: 'r',
          describe: 'Row number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        .option('col', {
          alias: 'c',
          describe: 'Column number',
          demandOption: true,
          requiresArg: true,
          type: 'number',
          nargs: 1
        })
        // .help(false)
        // .version(false)
    },
    handler: buildHandler(async function handler (args, client) {
      const result = await client.games.unmarkCell(args.game, args.row, args.col)
      // printer.statusChanges(result)
      printer.gameInfo(result, true)
    })
  })
  .demandCommand(1)
  .option('host', {
    alias: 'h',
    describe: 'API host',
    demandOption: false,
    requiresArg: true,
    type: 'string',
    nargs: 1
  })
  .option('heroku', {
    alias: ['k', 'hrk'],
    describe: 'Target Heroku deployment',
    demandOption: false,
    requiresArg: false,
    type: 'boolean',
    default: false
  })
  .option('debug', {
    alias: 'x',
    describe: 'Print stack traces for errors',
    demandOption: false,
    type: 'boolean',
    default: false
  })
  .conflicts('host', 'heroku')
  .help(true)
  .strict().argv
