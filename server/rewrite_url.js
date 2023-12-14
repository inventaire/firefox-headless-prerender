// Removing query parameters specific to prerendering
// so that cached values can be shared

const ignoredParameters = [
  '__nojs',
  '__refresh',
  // Used by agent=sentinel
  'agent',
  '_escaped_fragment_',
]

/**
 * @param {URL} urlData
 */
export function dropIgnoredParameters (urlData) {
  for (const parameter of ignoredParameters) {
    urlData.searchParams.delete(parameter)
  }
}

// Keep in sync with keys from https://raw.githubusercontent.com/inventaire/inventaire-i18n/dist/dist/languages_data.js
const supportedLanguages = new Set([ 'ar', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'eo', 'es', 'fr', 'hu', 'id', 'it', 'ja', 'nb', 'nl', 'pa', 'pl', 'pt', 'ro', 'ru', 'sk', 'sv', 'tr', 'uk' ])

export function getPrerenderedUrl (req, urlData) {
  const { searchParams: query } = urlData

  if (!query.has('lang')) {
    const headersLang = getLangFromHeaders(req.headers['accept-language'])
    if (headersLang) query.set('lang', headersLang)
    else query.set('lang', 'en')
  }

  return urlData.toString()
}

function getLangFromHeaders (acceptedLanguages) {
  if (!acceptedLanguages || acceptedLanguages.length === 0) return

  const preferredLangs = acceptedLanguages
    .replace(/q=\d(\.\d)?,?/g, '')
    .split(';')
    .map(lang => lang.split(/\W/)[0])
    .filter(lang => supportedLanguages.has(lang))

  return preferredLangs[0]
}
