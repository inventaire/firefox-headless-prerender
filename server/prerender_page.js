import CONFIG from 'config'
import pTimeout from 'p-timeout'
import { blue } from 'tiny-chalk'
import { getAvailableDriver, unlockDriver } from './driver.js'
import { formatPage } from './format_page.js'
import { waitUntilPrerenderIsReady } from './helpers.js'

const { preUrlPadding } = CONFIG

let counter = 0

export async function getPrerenderedPage (url, refresh = false) {
  let driver
  try {
    driver = await getAvailableDriver()
    const timerKey = blue(`prerender  ${url} [${++counter}]`)
    console.time(timerKey)
    const { origin } = new URL(url)
    if (!refresh && driver._previousOrigin === origin) {
      const path = url.replace(origin, '')
      try {
        await driver.executeScript(`app.clearMetadataNavigateAndLoad("${path}")`)
      } catch (err) {
        console.error('failed to reuse driver', err)
        await driver.get(url)
      }
    } else {
      await driver.get(url)
      driver._previousOrigin = origin
    }
    await waitUntilPrerenderIsReady(driver)
    console.timeEnd(timerKey)
    const page = await pTimeout(driver.getPageSource(), { milliseconds: 10000 })
    return formatPage(page)
  } catch (err) {
    driver._crashed = true
    if (err.name === 'WebDriverError' && err.message.includes('about:neterror')) {
      const errorData = new URLSearchParams(err.message.split('about:neterror?')[1])
      const errMessage = errorData.get('d')
      if (errMessage) {
        const err2 = new Error(errMessage)
        err2.context = Object.fromEntries(errorData)
        err2.cause = err
        throw err2
      }
    }
    throw err
  } finally {
    await unlockDriver(driver)
  }
}
