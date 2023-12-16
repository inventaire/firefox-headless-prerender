import CONFIG from 'config'
import { yellow } from 'tiny-chalk'

const { maxDrivers } = CONFIG

// Source: http://bluebirdjs.com/docs/api/deferred-migration.html
export function defer () {
  // Initialized in the defer function scope
  let resolveFn, rejectFn

  const promise = new Promise((resolve, reject) => {
    // Set the previously initialized variables
    // to the promise internal resolve/reject functions
    resolveFn = resolve
    rejectFn = reject
  })

  return {
    // A function to resolve the promise at will:
    // the promise will stay pending until 'resolve' or 'reject' is called
    resolve: resolveFn,
    reject: rejectFn,
    // The promise object, still pending at the moment this is returned
    promise,
  }
}

const queue = []

export function joinQueue () {
  const ticket = defer()
  queue.push(ticket)
  setTimeout(quitQueueAfterTimeout(ticket), 60_000)
  return ticket.promise
}

const quitQueueAfterTimeout = ticket => () => {
  if (!ticket.fulfilled) {
    ticket.reject(new Error('driver queue timeout'))
    ticket.fulfilled = true
    const ticketIndex = queue.indexOf(ticket)
    queue.splice(ticketIndex, 1)
  }
}

export function shiftQueue () {
  const nextTicket = queue.shift()
  if (nextTicket) {
    nextTicket.resolve()
    nextTicket.fulfilled = true
  }
}

export function getQueueLength () {
  return queue.length
}

export function queueOverflows () {
  return queue.length > (maxDrivers * 2)
}

setInterval(() => {
  if (queue.length > 0) console.log(yellow('driver waiting queue'), queue.length)
}, 5000)
