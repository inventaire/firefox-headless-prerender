import CONFIG from 'config'
import chalk from 'tiny-chalk'

const { preUrlPadding } = CONFIG.logs

// Adapted from https://github.com/expressjs/morgan 1.1.1
export function requestsLogger (req, res, next) {
  req._startAt = process.hrtime()

  res.on('close', () => {
    const line = format(req, res)
    if (line == null) return
    console.log(`${line}`)
  })

  next()
}
const format = (req, res) => {
  const { method, originalUrl: url, user } = req
  const { statusCode: status, finished } = res

  const color = statusCategoryColor[status.toString()[0]]

  // res.finished is set to true once the 'finished' event was fired
  // See https://nodejs.org/api/http.html#http_event_finish
  // Interruption typically happen when the client closes the request,
  // for instance when tests timeout
  const interrupted = finished ? '' : ` ${yellow}CLOSED BEFORE FINISHING`

  let line = `${grey}${method.padEnd(preUrlPadding - 1)} ${url} ${color}${status}${interrupted} ${grey}${coloredElapsedTime(req._startAt)}${grey}`

  if (user) line += ` - u:${user._id}`

  return `${line}${resetColors}`
}

// Using escape codes rather than chalk to save a few characters per line
const escape = '\x1b['
const resetColors = `${escape}0m`
const red = `${escape}31m`
const green = `${escape}32m`
const yellow = `${escape}33m`
const cyan = `${escape}36m`
const grey = `${escape}90m`

const statusCategoryColor = {
  5: red,
  4: yellow,
  3: cyan,
  2: green,
  undefined: resetColors,
}

function coloredElapsedTime (startTime) {
  if (startTime == null) return ''
  const [ seconds, nanoseconds ] = process.hrtime(startTime)
  const elapsedMs = Math.round((seconds * 1000) + (nanoseconds / 1000000))
  if (elapsedMs > 10000) return chalk.red(`${elapsedMs}ms`)
  else if (elapsedMs > 1000) return chalk.yellow(`${elapsedMs}ms`)
  else return chalk.grey(`${elapsedMs}ms`)
}
