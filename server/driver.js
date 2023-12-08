#!/usr/bin/env node
import { Builder } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'
import { wait, waitUntilPrerenderIsReady } from './lib/helpers.js'
import CONFIG from 'config'
import { yellow, grey } from 'tiny-chalk'
import { formatPage } from './lib/format_page.js'
import { mkdirSync } from 'fs'
import { getQueueLength, joinQueue, shiftQueue } from './lib/queue.js'

const { maxDrivers, firefoxProfilePath } = CONFIG

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

export async function getPrerenderedPage (url) {
  const driver = await getAvailableDriver()
  driver._url = url
  const timerKey = grey(`${url} prerender`)
  console.time(timerKey)
  await driver.get(url)
  await waitUntilPrerenderIsReady(driver)
  console.timeEnd(timerKey)
  const page = await driver.getPageSource()
  unlockDriver(driver)
  return formatPage(page)
}

async function populateDrivers () {
  if (driversCount < maxDrivers) {
    const driver = await getNewDriver()
    driversCount++
    idleDrivers.push(driver)
    shiftQueue()
  }
}

async function tickDriverQueue () {
  const queueLength = getQueueLength()
  if (queueLength > 0) {
    console.log(yellow('queue length'), queueLength)
    await populateDrivers()
  }
  if (driversCount < maxDrivers) {
    setTimeout(tickDriverQueue, 500)
  }
}

tickDriverQueue()
