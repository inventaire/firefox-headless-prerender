import CONFIG from 'config'
import should from 'should'
import { getPageMetadata } from './utils.js'

const { inventaireOrigin } = CONFIG.tests

describe('inventaire prerender', () => {
  it('should get a user profile metadata', async () => {
    const username = 'adamsberg'
    const { title, links, metatags, lang } = await getPageMetadata(`/users/${username}`)
    should(title).startWith(username)
    should(title).endWith('- Inventaire')
    should(links.canonical[0]).equal(`${inventaireOrigin}/users/${username}?lang=en`)
    should(metatags['og:title'][0]).equal(title)
    should(lang).equal('en')
  })

  it('should get a user profile in the desired lang', async () => {
    const { links, lang } = await getPageMetadata('/users/adamsberg?lang=fr')
    should(links.canonical[0]).equal(`${inventaireOrigin}/users/adamsberg?lang=fr`)
    should(lang).equal('fr')
  })

  it('should get a group profile metadata', async () => {
    const name = 'hello'
    const { title, links, metatags, lang } = await getPageMetadata(`/groups/${name}`)
    should(title).startWith(name)
    should(title).endWith('- Inventaire')
    should(links.canonical[0]).equal(`${inventaireOrigin}/groups/${name}?lang=en`)
    should(metatags['og:title'][0]).equal(title)
    should(lang).equal('en')
  })
})
