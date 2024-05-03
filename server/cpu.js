import { cpus, loadavg } from 'node:os'
import { blue, red } from 'tiny-chalk'

const cpusCount = cpus().length

export function getCPUsAverageLoad () {
  const [ lastMinuteAverageLoad ] = loadavg()
  return lastMinuteAverageLoad / cpusCount
}

function killProcessOnExcessCPU () {
  const lastFiveMinutesAverageLoad = loadavg()[1]
  const load = lastFiveMinutesAverageLoad / cpusCount
  if (load > 10) {
    console.log(red('5 min average CPU load is too high: exiting process'), load)
    process.exit(1)
  } else {
    console.log(blue('5 min average CPU load checked:'), load)
  }
}

setInterval(killProcessOnExcessCPU, 30_000)
