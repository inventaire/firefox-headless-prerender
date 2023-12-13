import CONFIG from 'config'

export function initTimestampPrefixedLogs () {
  if (CONFIG.logs.timestamps) {
    const log = console.log
    const error = console.error
    const warn = console.warn

    console.log = function () {
      // console.time calls console.log with '%s: %s'
      const args = Array.from(arguments).filter(arg => arg !== '%s: %s')
      log.apply(console, [ new Date(), ...args ])
    }
    console.error = function () {
      error.apply(console, [ new Date(), ...arguments ])
    }
    console.warn = function () {
      warn.apply(console, [ new Date(), ...arguments ])
    }
  }
}
