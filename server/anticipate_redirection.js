// This plugin anticipates the response from the client
// to save wasted prerender CPU/RAM and cache disk space
// The response can be different from what the client would actually return:
// Ex: https://inventaire.io/entity/wd:Q34660/edit will be redirected to https://inventaire.io/entity/wd:Q34660
// instead of returning a 401

// import { getJSON } from './helpers.js'

export async function getRedirection (url) {
  const { origin, pathname, searchParams } = new URL(url)

  const [ part1, part2, part3 ] = pathname.slice(1).split('/')
  let redirection

  if (loggedInSections.has(part1)) {
    redirection = '/login'
  } else if (loggedInSubSections[part1] != null && loggedInSubSections[part1].has(part2)) {
    redirection = '/login'
  } else if (dropPart3[part1] != null && dropPart3[part1].has(part3)) {
    redirection = pathname.replace(`/${part3}`, '')
  } else if (part1 === 'entity') {
    // Legacy URL: entity label was added as part3
    if (part3) redirection = `/${part1}/${part2}`
    // } else if (part1 === 'inventory') {
    // if (part3) redirection = await getItemUrlFromUsernameAndUri(origin, part2, part3)
  } else if (part1 === 'search') {
    searchParams.delete('q')
    // Search pages just create dupplicated content, redirect to the home page
    redirection = '/'
  }

  let search = searchParams.toString()
  if (search.length > 0) search = `?${search}`

  if (redirection) return `${origin}${redirection}${search}`
}

const loggedInSections = new Set([
  'add',
  'network',
  'notifications',
  'settings',
  'tasks',
  'transactions',
])

const loggedInSubSections = {
  inventory: new Set([
    'network',
    'public',
    'nearby',
    'last',
  ]),
  entity: new Set([
    'new',
    'changes',
    'activity',
    'deduplicate',
  ]),
}

const dropPart3 = {
  entity: new Set([
    'add',
    'edit',
    'cleanup',
  ]),
}

// const getItemUrlFromUsernameAndUri = async (origin, username, uri) => {
//   const { users } = await getJSON(`${origin}/api/users?action=by-usernames&usernames=${username}`)
//   const user = users[username]
//   if (!user) return
//   const { items } = await getJSON(`${origin}/api/items?action=by-user-and-entities&user=${user._id}&uris=${uri}`)
//   if (items.length === 1) return `/items/${items[0]._id}`
// }
