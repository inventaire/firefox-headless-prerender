import { getPrerenderedPage } from './driver.js'
import { rewriteUrl } from './lib/rewrite_url.js'
import { getRedirection } from './lib/anticipate_redirection.js'
import { setPageMetadata } from './lib/get_page_metadata.js'
import { grey } from 'tiny-chalk'

let counter = 0

export async function controller (req, res) {
  let timerKey
  try {
    console.log(new Date().toISOString(), 'GET', req.url)
    const prerenderedUrl = rewriteUrl(req, req.url.slice(1))
    timerKey = grey(`${prerenderedUrl} request [${++counter}]`)
    console.time(timerKey)
    const earlyRedirection = await getRedirection(prerenderedUrl)
    if (earlyRedirection) {
      res.statusCode = 302
      res.setHeader('Location', earlyRedirection)
      res.end()
    } else {
      const html = await getPrerenderedPage(prerenderedUrl)
      const { statusCode, html: htmlWithoutPrerenderMetadata } = setPageMetadata(res, html)
      if (statusCode === 200) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
      }
      res.status(statusCode).send(htmlWithoutPrerenderMetadata)
    }
  } catch (err) {
    res.statusCode = 500
    const { message } = err
    res.end(JSON.stringify({ message }))
  } finally {
    console.timeEnd(timerKey)
  }
}
