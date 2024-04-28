/**
 * @param {number} ms
 */
export function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function waitUntilPrerenderIsReady (driver, attempt = 1) {
  const bool = await driver.executeScript('return window.prerenderReady')
  if (bool) return
  // Stop trying after getPrerenderedPage timeout, to make sure that a page
  // that doesn't set prerenderReady=true is reported as a timeout
  if (attempt >= 100) return
  await wait(200)
  return waitUntilPrerenderIsReady(driver, attempt + 1)
}

export async function getJSON (url) {
  const res = await fetch(url)
  return res.json()
}

export function getReqIp (req) {
  return req.get('x-forwarded-for')?.split(/,\s*/).at(-1)
}

export function getUserAgent (req) {
  return req.get('user-agent')
}
