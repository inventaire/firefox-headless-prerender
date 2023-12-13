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
    const { title, links, lang } = await getPageMetadata(`/groups/${name}`)
    should(title).startWith(name)
    should(title).endWith('- Inventaire')
    should(links.canonical[0]).equal(`${inventaireOrigin}/groups/${name}?lang=en`)
    should(lang).equal('en')
  })

  describe('entities', () => {
    it('should get an author entity layout metadata', async () => {
      const uri = 'wd:Q1345582'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}`)
      should(title).containEql('Simondon')
      should(title).match(/- Author - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=en`)
      should(lang).equal('en')
    })

    it('should get a work entity layout metadata', async () => {
      const uri = 'wd:Q18120925'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(title).match(/Du Mode d'existence des objets techniques/i)
      should(title).match(/- Œuvre - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should get an edition entity layout metadata', async () => {
      const uri = 'isbn:9782700704280'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(title).match(/Du mode d'existence des objets techniques/i)
      should(title).match(/- Édition - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should get a serie entity layout metadata', async () => {
      const uri = 'wd:Q3656893'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(title).match(/Capitalisme et Schizophrénie/i)
      should(title).match(/- Série /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should get a publisher entity layout metadata', async () => {
      const uri = 'wd:Q3208426'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(title).match(/La découverte/i)
      should(title).match(/- Maison d'édition - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should get a collection entity layout metadata', async () => {
      const uri = 'wd:Q11256364'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(title).match(/Découvertes Gallimard/i)
      should(title).match(/- Collection - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should get a subject entity layout metadata', async () => {
      const uri = 'wd:Q11473'
      const { title, links, lang } = await getPageMetadata(`/entity/wdt:P921-${uri}?lang=fr`)
      should(title).match(/thermodynamique/i)
      should(title).match(/- Sujet - /)
      should(title).endWith('- Inventaire')
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/wdt:P921-${uri}?lang=fr`)
      should(lang).equal('fr')
    })

    it('should redirect to prefixed entity layout', async () => {
      const id = 'Q3656893'
      const uri = `wd:${id}`
      const res = await getPageMetadata(`/entity/${id}?lang=fr`)
      const { statusCode, headers } = res
      should(statusCode).equal(302)
      should(headers.location).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
    })

    it('should redirect to property-prefixed claim list', async () => {
      const uri = 'wd:Q11473'
      const { statusCode, headers } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(statusCode).equal(302)
      should(headers.location).equal(`${inventaireOrigin}/entity/wdt:P921-${uri}?lang=fr`)
    })
  })
})
