import CONFIG from 'config'
import { readFileSync } from 'fs'
import { blue } from 'tiny-chalk'
import { getPrerenderedPage } from './driver.js'

const { protocol, port } = CONFIG

const proto = await import(protocol)

async function controller (req, res) {
  try {
    console.log(new Date().toISOString(), 'GET', req.url)
    const prerenderedUrl = req.url.slice(1)
    const html = await getPrerenderedPage(prerenderedUrl)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch (err) {
    res.statusCode = 500
    const { message } = err
    res.end(JSON.stringify({ message }))
  }
}

const args = []

if (protocol === 'https') {
  const options = {
    key: readFileSync('./keys/self-signed.key'),
    cert: readFileSync('./keys/self-signed.crt')
  }
  args.push(options)
}

args.push(controller)

proto.createServer.apply(null, args)
.listen(port)
.on('listening', () => console.log(blue(`Started on ${protocol}://localhost:${port}!`)))
.on('error', console.error)
