import CONFIG from 'config'
import { readFileSync } from 'fs'
import { blue } from 'tiny-chalk'
import { controller } from './controller.js'

const { protocol, port } = CONFIG

const { createServer } = await import(protocol)

const args = []

if (protocol === 'https') {
  const options = {
    key: readFileSync('./keys/self-signed.key'),
    cert: readFileSync('./keys/self-signed.crt')
  }
  args.push(options)
}

args.push(controller)

createServer.apply(null, args)
.listen(port)
.on('listening', () => console.log(blue(`Started on ${protocol}://localhost:${port}!`)))
.on('error', console.error)
