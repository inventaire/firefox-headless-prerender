import { inspect } from 'node:util'
import * as cheerio from 'cheerio'
import CONFIG from 'config'

inspect.defaultOptions.depth = null

const { protocol, port } = CONFIG
const { inventaireOrigin } = CONFIG.tests
const prerenderOrigin = `${protocol}://localhost:${port}`

export async function getPage (pathname) {
  let [ path, query ] = pathname.split('?')
  if (query) {
    query += '&__refresh=true'
  } else {
    query = '__refresh=true'
  }
  const invUrl = `${inventaireOrigin}${path}?${query}`
  const html = await fetch(`${prerenderOrigin}/${invUrl}`).then(res => res.text())
  return html
}

export async function getPageMetadata (pathname) {
  const html = await getPage(pathname)
  return parseHtml(html)
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
