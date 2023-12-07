// Removing query parameters specific to prerendering
// so that cached values can be shared

const omitParameters = [
  '__nojs',
  '__refresh',
  // Used by agent=sentinel
  'agent',
]

// Keep in sync with keys from https://raw.githubusercontent.com/inventaire/inventaire-i18n/dist/dist/languages_data.js
const  supportedLanguages = new Set([ 'ar', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'eo', 'es', 'fr', 'hu', 'id', 'it', 'ja', 'nb', 'nl', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk' ])

export function rewriteUrl (req, url) {
  const [ path, queryString ] = Array.from(url.split('?'))

  let query = new URLSearchParams(queryString)
  for (const parameter of omitParameters) {
    query.delete(parameter)
  }

  if (!query.has('lang')) {
    const headersLang = getLangFromHeaders(req.headers['accept-language'])
    if (headersLang) query.set('lang', headersLang)
    else query.set('lang', 'en')
  }

  const updatedQueryString = query.toString()

  if (updatedQueryString.length === 0) return path
  else return `${path}?${updatedQueryString}`
}

const getLangFromHeaders = acceptedLanguages => {
  if (!acceptedLanguages || acceptedLanguages.length === 0) return

  const preferredLangs = acceptedLanguages
    .replace(/q=\d(\.\d)?,?/g, '')
    .split(';')
    .map(lang => lang.split(/\W/)[0])
    .filter(lang => supportedLanguages.has(lang))

  return preferredLangs[0]
}
