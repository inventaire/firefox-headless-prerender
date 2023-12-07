import CONFIG from 'config'
import { readFileSync } from 'node:fs'
import { blue } from 'tiny-chalk'
import { controller } from './controller.js'
import express from 'express'
import { createServer as createHttpServer } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'

const { protocol, port } = CONFIG

const app = express()
app.get('*', controller)

const args = []

if (protocol === 'https') {
  const options = {
    key: readFileSync('./keys/self-signed.key'),
    cert: readFileSync('./keys/self-signed.crt')
  }
  args.push(options)
}

args.push(app)

const createServer = protocol === 'https' ? createHttpsServer : createHttpServer

createServer.apply(null, args)
.listen(port)
.on('listening', () => console.log(blue(`Started on ${protocol}://localhost:${port}!`)))
.on('error', console.error)
