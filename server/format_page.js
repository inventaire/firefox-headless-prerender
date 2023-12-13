export function formatPage (html) {
  html = removeNoscriptReload(html)
  html = removeScriptTags(html)
  return html
}

function removeNoscriptReload (html) {
  return html.replace(/<noscript>\s*<meta http-equiv.{10,80}noscript>/, '')
}

// Inspired by https://github.com/prerender/prerender/blob/478fa6d0a5196ea29c88c69e64e72eb5507b6d2c/plugins/removeScriptTags.js
function removeScriptTags (html) {
  const matches = html.match(/<script(?:.*?)>(?:[\S\s]*?)<\/script>/gi)
  if (matches) {
    for (const match of matches) {
      if (!match.includes('application/ld+json')) {
        html = html.replace(match, '')
      }
    }
  }
  return html
}
