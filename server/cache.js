import level from 'level-party'
import ttl from 'level-ttl'
import { promisify } from 'node:util'
const defaultTTL = 24 * 60 * 60 * 1000
const db = ttl(level('./db'), { defaultTTL })
const dbPut = promisify(db.put)

export async function getCachedPage (url) {
  try {
    const html = await db.get(url)
    console.log('cache hit', url)
    return html
  } catch (err) {
    if (err.name === 'NotFoundError') {
      console.log('cache miss', url)
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
  try {
    await dbPut(url, html)
  } catch (err) {
    console.error(err, { url })
  }
}
