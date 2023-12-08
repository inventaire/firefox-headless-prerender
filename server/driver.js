#!/usr/bin/env node
import { Builder } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'
import { wait, waitUntilPrerenderIsReady } from './lib/helpers.js'
import CONFIG from 'config'
import { yellow, grey } from 'tiny-chalk'
import { formatPage } from './lib/format_page.js'
import { mkdirSync } from 'fs'
import { getQueueLength, joinQueue, shiftQueue } from './lib/queue.js'
import pTimeout from 'p-timeout'

const { maxDrivers, firefoxProfilePath } = CONFIG
console.log({ maxDrivers, firefoxProfilePath })

mkdirSync(firefoxProfilePath, { recursive: true })

let driversCount = 0
const idleDrivers = []

async function getAvailableDriver () {
  const idleDriver = idleDrivers.shift()
  if (idleDriver) return idleDriver
  populateDrivers()
  await joinQueue()
  return getAvailableDriver()
}

function unlockDriver (driver) {
  idleDrivers.push(driver)
  shiftQueue()
}

async function getNewDriver () {
  const options = new firefox.Options()
    .setProfile(firefoxProfilePath)
    .addArguments('-headless')

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(options)
    .build()

  return driver
}

let counter = 0

export async function getPrerenderedPage (url) {
  let driver
  try {
    driver = await getAvailableDriver()
    const timerKey = grey(`${url} prerender (${++counter})`)
    console.time(timerKey)
    await driver.get(url)
    await waitUntilPrerenderIsReady(driver)
    console.timeEnd(timerKey)
    const page = await pTimeout(driver.getPageSource(), { milliseconds: 10000 })
    return formatPage(page)
  } finally {
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
