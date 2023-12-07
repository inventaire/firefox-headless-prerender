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
  return ticket.promise
}

export function shiftQueue () {
  const nextTicket = queue.shift()
  if (nextTicket) nextTicket.resolve()
}

export function getQueueLength () {
  return queue.length
}
