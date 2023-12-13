import { readFileSync } from 'node:fs'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import CONFIG from 'config'
import express from 'express'
import { blue } from 'tiny-chalk'
import { controller } from './controller.js'
import { requestsLogger } from './requests_logger.js'
import { initTimestampPrefixedLogs } from './timestamp_prefixed_loggers.js'

const { protocol, port } = CONFIG

initTimestampPrefixedLogs()

const app = express()
app.use(requestsLogger)
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
