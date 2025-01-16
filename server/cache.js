import { promisify } from 'node:util'
import CONFIG from 'config'
import level from 'level-party'
import ttl from 'level-ttl'
import { green, yellow } from 'tiny-chalk'

const { preUrlPadding } = CONFIG.logs

const { enabled, ttl: defaultTTL } = CONFIG.cache
const db = ttl(level('./db'), { defaultTTL })
const dbPut = promisify(db.put)

export async function getCachedPage (url) {
  if (!enabled) return
  try {
    const html = await db.get(url)
    console.log(green('cache hit'.padEnd(preUrlPadding)), url)
    return html
  } catch (err) {
    if (err.name === 'NotFoundError') {
      console.log(yellow('cache miss'.padEnd(preUrlPadding)), url)
    } else {
      throw err
    }
  }
}

/**
 * @param {string} url
 * @param {string} html
 */

export async function populateCache (url, html) {
  if (!enabled) return
  try {
    await dbPut(url, html)
  } catch (err) {
    console.error(err, { url })
  }
}
