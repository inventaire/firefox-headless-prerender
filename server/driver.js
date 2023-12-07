#!/usr/bin/env node
import { Builder } from 'selenium-webdriver'
import firefox from 'selenium-webdriver/firefox.js'
import { wait, waitUntilPrerenderIsReady } from './lib/helpers.js'
import CONFIG from 'config'
import { yellow, grey } from 'tiny-chalk'
import { formatPage } from './lib/format_page.js'
import { mkdirSync } from 'fs'

const { maxDrivers, firefoxProfilePath } = CONFIG

mkdirSync(firefoxProfilePath, { recursive: true })

const drivers = []

async function getAvailableDriver () {
  const idleDriver = drivers.find(driver => !driver._busy)
  if (idleDriver) return idleDriver
  if (drivers.length < maxDrivers) {
    const driver = await getNewDriver()
    drivers.push(driver)
    return driver
  } else {
    console.log(yellow('waiting for available driver'))
    await wait(500)
    return await getAvailableDriver()
  }
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
  driver._busy = true
  driver._url = url
  const timerKey = grey(`${url} prerender`)
  console.time(timerKey)
  await driver.get(url)
  await waitUntilPrerenderIsReady(driver)
  console.timeEnd(timerKey)
  const page = await driver.getPageSource()
  driver._busy = false
  return formatPage(page)
}
