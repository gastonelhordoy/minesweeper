'use strict'

const colors = require('colors/safe')
const Table = require('cli-table3')

function formatStatus (v) {
  switch (v) {
    case 'abandoned':
    case 'lost':
      return colors.red(v)
    case 'won':
      return colors.green(v)
    case 'active':
      return colors.cyan(v)
  }
}

function games (games) {
  const table = new Table({
    head: ['ID', 'Status', 'Rows', 'Cols', 'Mines'],
    style: { head: ['grey'] }
  })

  games.forEach(g => {
    table.push([g._id, formatStatus(g.status), g.rows, g.cols, g.mines])
  })
  console.log(table.toString())
}

function board (board, hideMines) {
  const head = ['']
  board.forEach((row, index) => head.push(index))
  const table = new Table({
    head,
    style: { head: ['grey'] }
  })

  for (let i = 0; i < board.length; i++) {
    const row = board[i].map(cell => {
      if (!hideMines) {
        return cell.isMine ? colors.red('@') : ' '
      } else if (cell.status === 'uncovered') {
        return cell.isMine ? colors.red('@') : colors.blue('•')
      }
      return ' '
    })
    table.push({ [colors.grey(i)]: row })
  }
  console.log(table.toString())
}

function gameInfo (game, hideMines) {
  console.log(game._id + '  |  ' + formatStatus(game.status) + '  |  ' + game.board.length + 'x' + game.board[0].length + '  |  ' + game.mines)
  board(game.board, hideMines)
}

function changes (changes) {
  const table = new Table({
    head: ['Row', 'Col', 'Status']
  })
  changes.forEach(change => {
    table.push([change.row, change.col, change.status])
  })
  console.log(table.toString())
}

function statusChanges (id, result) {
  console.log(id + '  |  ' + result.status)
  changes(result.changes)
}

module.exports = {
  games,
  gameInfo,
  board,
  changes,
  statusChanges
}
