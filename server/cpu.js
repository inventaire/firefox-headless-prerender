import { cpus, loadavg } from 'node:os'

const cpusCount = cpus().length

export function getCPUsAverageLoad () {
  const [ lastMinuteAverageLoad ] = loadavg()
  return lastMinuteAverageLoad / cpusCount
}
