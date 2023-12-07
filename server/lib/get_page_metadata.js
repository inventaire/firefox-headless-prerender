// Largely inspired by https://github.com/prerender/prerender/blob/478fa6d/lib/plugins/httpHeaders.js

import he from 'he'

export function setPageMetadata (html) {
  const statusPattern = /<meta[^<>]*(?:name=['"]prerender-status-code['"][^<>]*content=['"]([0-9]{3})['"]|content=['"]([0-9]{3})['"][^<>]*name=['"]prerender-status-code['"])[^<>]*>/i
  const headerPattern = /<meta[^<>]*(?:name=['"]prerender-header['"][^<>]*content=['"]([^'"]*?): ?([^'"]*?)['"]|content=['"]([^'"]*?): ?([^'"]*?)['"][^<>]*name=['"]prerender-header['"])[^<>]*>/gi
  const canonicalPattern = /<link rel=['"]canonical['"] href=['"]([^<>]*)['"]>/i
  const head = html.split('</head>', 1)[0]
  let statusCode = 200

  let match = statusPattern.exec(head)
  if (match) {
    statusCode = parseInt(match[1] || match[2])
    html = html.replace(match[0], '')
  }

  const headers = {}

  while (match = headerPattern.exec(head)) {
    const headerName = match[1] || match[3]
    const headerValue = he.decode(match[2] || match[4])
    headers[headerName] = headerValue
    html = html.replace(match[0], '')
  }

  let canonicalUrl
  match = head.match(canonicalPattern)
  if (match) {
    canonicalUrl = match[1]
  }

  return {
    statusCode,
    html,
    headers,
    canonicalUrl,
  }
}
