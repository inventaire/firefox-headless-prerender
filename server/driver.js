import { mkdirSync } from 'node:fs'
import CONFIG from 'config'
import { Builder } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'
import { resetTab } from './helpers.js'
import { getQueueLength, joinQueue, shiftQueue } from './queue.js'

const { maxDrivers, firefoxProfilePath } = CONFIG
console.log({ maxDrivers, firefoxProfilePath })

mkdirSync(firefoxProfilePath, { recursive: true })

let driversCount = 0
const idleDrivers = []
const allDrivers = new Set()

export async function getAvailableDriver () {
  const idleDriver = idleDrivers.shift()
  if (idleDriver) return idleDriver
  await joinQueue()
  return getAvailableDriver()
}

export async function unlockDriver (driver) {
  if (driver._crashed) {
    driversCount--
    populateDrivers()
    await quitDriver(driver)
    allDrivers.delete(driver)
  } else {
    await resetTab(driver)
    idleDrivers.push(driver)
    shiftQueue()
  }
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
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/logging.html
  // https://github.com/mozilla/geckodriver/issues/330

  return driver
}

async function populateDrivers () {
  if (driversCount < maxDrivers) {
    const driver = await getNewDriver()
    allDrivers.add(driver)
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

async function handleExit () {
  if (allDrivers.size > 0) {
    console.log(`Cleaning up ${allDrivers.size} drivers`)
    await Promise.all(Array.from(allDrivers).map(quitDriver))
  }
  process.exit(0)
}

async function quitDriver (driver) {
  try {
    await driver.quit()
  } catch (err) {
    console.error('error while quitting driver:', err)
  }
}

process.on('SIGINT', handleExit)
process.on('SIGTERM', handleExit)
process.on('SIGHUP', handleExit)
