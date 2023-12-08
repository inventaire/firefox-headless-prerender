import { blue, grey } from 'tiny-chalk'

/**
 * @param {number} ms
 */
export function wait (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitUntilPrerenderIsReady (driver, attempt = 1) {
  const bool = await driver.executeScript('return window.prerenderReady')
  if (bool) return
  await wait(500 * attempt)
  return waitUntilPrerenderIsReady(driver, attempt + 1)
}


export async function getJSON (url) {
  const res = await fetch(url)
  return res.json()
}
