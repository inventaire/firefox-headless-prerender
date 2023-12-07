// Largely inspired by https://github.com/prerender/prerender/blob/478fa6d/lib/plugins/httpHeaders.js

import he from 'he'

export function setPageMetadata (res, html) {
  const statusMatch = /<meta[^<>]*(?:name=['"]prerender-status-code['"][^<>]*content=['"]([0-9]{3})['"]|content=['"]([0-9]{3})['"][^<>]*name=['"]prerender-status-code['"])[^<>]*>/i
  const headerMatch = /<meta[^<>]*(?:name=['"]prerender-header['"][^<>]*content=['"]([^'"]*?): ?([^'"]*?)['"]|content=['"]([^'"]*?): ?([^'"]*?)['"][^<>]*name=['"]prerender-header['"])[^<>]*>/gi
  const head = html.split('</head>', 1)[0]
  let statusCode = 200

  let match = statusMatch.exec(head)
  if (match) {
    statusCode = parseInt(match[1] || match[2])
    html = html.replace(match[0], '')
  }

  while (match = headerMatch.exec(head)) {
    res.setHeader(match[1] || match[3], he.decode(match[2] || match[4]))
    html = html.replace(match[0], '')
  }

  return {
    statusCode,
    html,
  }
}
