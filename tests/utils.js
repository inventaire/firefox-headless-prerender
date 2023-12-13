import { inspect } from 'node:util'
import * as cheerio from 'cheerio'
import CONFIG from 'config'

inspect.defaultOptions.depth = null

const { protocol, port } = CONFIG
const { inventaireOrigin } = CONFIG.tests
const prerenderOrigin = `${protocol}://localhost:${port}`

export async function getPage (pathname) {
  if (pathname.includes('?') || pathname.includes('%3F')) {
    pathname += '&__refresh=true'
  } else {
    pathname += '?__refresh=true'
  }
  const invUrl = `${inventaireOrigin}${pathname}`
  const res = await fetch(`${prerenderOrigin}/${invUrl}`, { redirect: 'manual' })
  const text = await res.text()
  const pageData = { body: text, statusCode: res.status, headers: Object.fromEntries(res.headers.entries()) }
  if (pageData.statusCode >= 400) {
    const err = new Error('request error')
    err.context = pageData
    throw err
  } else {
    return pageData
  }
}

export async function getPageMetadata (pathname) {
  const { body: html, statusCode, headers } = await getPage(pathname)
  return { statusCode, headers, ...parseHtml(html) }
}

function parseHtml (html) {
  const $ = cheerio.load(html)
  const htmlElement = $('html')
  const lang = htmlElement.attr('lang')
  const dir = htmlElement.attr('dir')
  const title = $('title').text()
  const metatags = {}
  const links = {}
  $('meta').each(parseElement(metatags, [ 'name', 'property', 'itemprop', 'http-equiv' ], 'content'))
  $('link').each(parseElement(links, [ 'rel' ], 'href'))
  return { title, links, metatags, lang, dir }
}

const parseElement = (obj, attributes, valueKey) => (index, element) => {
  const nameKey = Object.keys(element.attribs).find(attr => attributes.includes(attr))
  if (nameKey) {
    const name = element.attribs[nameKey]
    const value = element.attribs[valueKey]
    obj[name] ??= []
    obj[name].push(value)
  }
  return obj
}
