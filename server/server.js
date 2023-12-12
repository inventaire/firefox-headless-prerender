import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import CONFIG from 'config'
import express from 'express'
import { blue } from 'tiny-chalk'
import { controller } from './controller.js'

const { protocol, port } = CONFIG

const app = express()
app.get('*', controller)

const args = []

if (protocol === 'https') {
  const options = {
    key: readFileSync('./keys/self-signed.key'),
    cert: readFileSync('./keys/self-signed.crt'),
  }
  args.push(options)
}

args.push(app)

const createServer = protocol === 'https' ? createHttpsServer : createHttpServer

createServer.apply(null, args)
.listen(port)
.on('listening', () => console.log(blue(`Started on ${protocol}://localhost:${port}!`)))
.on('error', console.error)

if (CONFIG.logs.timestamps) {
  const log = console.log
  const error = console.error
  const warn = console.warn

  console.log = function () {
  // console.time calls console.log with '%s: %s'
    const args = Array.from(arguments).filter(arg => arg !== '%s: %s')
    log.apply(console, [ new Date(), ...args ])
  }
  console.error = function () {
    error.apply(console, [ new Date(), ...arguments ])
  }
  console.warn = function () {
    warn.apply(console, [ new Date(), ...arguments ])
  }
}
