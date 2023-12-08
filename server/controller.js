import { getPrerenderedPage } from './driver.js'
import { rewriteUrl } from './lib/rewrite_url.js'
import { getRedirection } from './lib/anticipate_redirection.js'
import { setPageMetadata } from './lib/get_page_metadata.js'
import { grey } from 'tiny-chalk'

let counter = 0

export async function controller (req, res) {
  let timerKey
  try {
    console.log('GET', req.url)
    const prerenderedUrl = rewriteUrl(req, req.url.slice(1))
    timerKey = grey(`${prerenderedUrl} request [${++counter}]`)
    console.time(timerKey)
    await prerender(res, prerenderedUrl)
  } catch (err) {
    handleError(res, err)
  } finally {
    console.timeEnd(timerKey)
  }
}

async function prerender (res, prerenderedUrl) {
  const earlyRedirection = await getRedirection(prerenderedUrl)
  if (earlyRedirection) {
    res.redirect(earlyRedirection)
    return
  }

  const html = await getPrerenderedPage(prerenderedUrl)
  const { statusCode, html: htmlWithoutPrerenderMetadata, headers, canonicalUrl } = setPageMetadata(html)
  if (statusCode === 200) {
    if (canonicalUrl !== prerenderedUrl) {
      res.redirect(canonicalUrl)
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      setHeaders(res, headers)
      res.send(htmlWithoutPrerenderMetadata)
    }
  } else {
    setHeaders(res, headers)
    res.status(statusCode).send(htmlWithoutPrerenderMetadata)
  }
}

function handleError (res, err) {
  console.error(err)
  res.statusCode = 500
  const { message } = err
  res.end(JSON.stringify({ message }))
}

function setHeaders (res, headers) {
  for (const [ name, value ] of Object.entries(headers)) {
    res.setHeader(name, value)
  }
}
