#!/usr/bin/env node
import { mkdirSync } from 'node:fs'
import CONFIG from 'config'
import pTimeout from 'p-timeout'
import { Builder } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'
import { grey } from 'tiny-chalk'
import { formatPage } from './lib/format_page.js'
import { resetTab, waitUntilPrerenderIsReady } from './lib/helpers.js'
import { getQueueLength, joinQueue, shiftQueue } from './lib/queue.js'

const { maxDrivers, firefoxProfilePath } = CONFIG
console.log({ maxDrivers, firefoxProfilePath })

mkdirSync(firefoxProfilePath, { recursive: true })

let driversCount = 0
const idleDrivers = []

async function getAvailableDriver () {
  const idleDriver = idleDrivers.shift()
  if (idleDriver) return idleDriver
  await joinQueue()
  return getAvailableDriver()
}

function unlockDriver (driver) {
  idleDrivers.push(driver)
  shiftQueue()
}

async function getNewDriver () {
  const options = new firefox.Options()
    // > The FirefoxDriver will never modify a pre-existing profile; instead it will create a copy for it to modify.
    // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/firefox.html
    .setProfile(firefoxProfilePath)
    .addArguments('-headless')
    .setPreference('general.useragent.override', 'Firefox Headless Prerender')
    .windowSize({ width: 1200, height: 800 })

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build()

  // Unforunately, Firefox doesn't implement remote client logging API
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/logging.html
  // https://github.com/mozilla/geckodriver/issues/330

  return driver
}

let counter = 0

export async function getPrerenderedPage (url, refresh = false) {
  let driver
  try {
    driver = await getAvailableDriver()
    const timerKey = grey(`${url} prerender (${++counter})`)
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
  } finally {
    await resetTab(driver)
    unlockDriver(driver)
  }
}

async function populateDrivers () {
  if (driversCount < maxDrivers) {
    const driver = await getNewDriver()
    driversCount++
    idleDrivers.push(driver)
    shiftQueue()
  }
}

async function buildupDrivers () {
  const queueLength = getQueueLength()
  if (queueLength > 0) await populateDrivers()
  if (driversCount < maxDrivers) {
    setTimeout(buildupDrivers, 500)
  }
}

buildupDrivers()
