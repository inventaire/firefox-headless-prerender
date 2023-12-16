import CONFIG from 'config'
import should from 'should'
import { wait } from '../server/helpers.js'
import { getPageMetadata, getRandomInteger, getRandomString, pluck, shouldNotBeCalled } from './utils.js'

const { inventaireOrigin } = CONFIG.tests

describe('inventaire prerender', () => {
  // Assumes a user named adamsberg exist on the tested Inventaire instance
  it('should get a user profile metadata', async () => {
    const username = 'adamsberg'
    const { statusCode, title, links, metatags, lang } = await getPageMetadata(`/users/${username}?lang=en`)
    should(statusCode).equal(200)
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

  it('should default to English', async () => {
    const { statusCode, links } = await getPageMetadata('/users/adamsberg')
    should(statusCode).equal(200)
    should(links.canonical[0]).equal(`${inventaireOrigin}/users/adamsberg?lang=en`)
  })

  it('should return 404 on unknown pages', async () => {
    await getPageMetadata('/foo')
    .then(shouldNotBeCalled)
    .catch(err => {
      should(err.statusCode).equal(404)
    })
  })

  it('should redirect / to /welcome', async () => {
    const { statusCode, headers } = await getPageMetadata('/')
    should(statusCode).equal(302)
    should(headers.location).equal(`${inventaireOrigin}/welcome?lang=en`)
  })

  it('should show the home page', async () => {
    const { statusCode, html } = await getPageMetadata('/welcome?lang=en')
    should(statusCode).equal(200)
    should(html).containEql('Keep an inventory of your books')
  })

  it('should not redirect to the explicit lang page if the language header is set', async () => {
    const { statusCode, links } = await getPageMetadata('/welcome', {
      headers: {
        'accept-language': 'fr',
      },
    })
    should(statusCode).equal(200)
    should(links.canonical[0]).equal(`${inventaireOrigin}/welcome?lang=fr`)
  })

  it('should support escaped url', async () => {
    const { statusCode, links, lang } = await getPageMetadata('/users/adamsberg%3Flang=fr')
    should(statusCode).equal(200)
    should(links.canonical[0]).equal(`${inventaireOrigin}/users/adamsberg?lang=fr`)
    should(lang).equal('fr')
  })

  // Assumes a group named hello exist on the tested Inventaire instance
  it('should get a group profile metadata', async () => {
    const name = 'hello'
    const { title, links, lang } = await getPageMetadata(`/groups/${name}?lang=en`)
    should(title).startWith(name)
    should(title).endWith('- Inventaire')
    should(links.canonical[0]).equal(`${inventaireOrigin}/groups/${name}?lang=en`)
    should(lang).equal('en')
  })

  describe('entities', () => {
    it('should get an author entity layout metadata', async () => {
      const uri = 'wd:Q1345582'
      const { title, links, lang } = await getPageMetadata(`/entity/${uri}?lang=en`)
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

    it('should set canonical link for prefixed entity layout', async () => {
      const id = 'Q3656893'
      const uri = `wd:${id}`
      const res = await getPageMetadata(`/entity/${id}?lang=fr`)
      const { statusCode, links } = res
      should(statusCode).equal(200)
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/${uri}?lang=fr`)
    })

    it('should set canonical link for property-prefixed', async () => {
      const uri = 'wd:Q11473'
      const { statusCode, links } = await getPageMetadata(`/entity/${uri}?lang=fr`)
      should(statusCode).equal(200)
      should(links.canonical[0]).equal(`${inventaireOrigin}/entity/wdt:P921-${uri}?lang=fr`)
    })
  })

  describe('throttling', () => {
    it('should reject when too many request from the same forwarded ip', async () => {
      const promises = []
      let i = 0
      while (i++ < 10) {
        promises.push(getPageMetadata(`/users/${getRandomString()}`, {
          noThrowOnHttpStatusError: true,
          headers: {
            // The rightmost IP address is the IP address of the most recent proxy
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For#security_and_privacy_concerns
            'x-forwarded-for': `${getRandomInteger(0, 255)}.0.0.0, 256.0.0.0`,
          },
        }))
      }
      const res = await Promise.all(promises)
      const statusCodes = pluck(res, 'statusCode')
      should(statusCodes[0]).equal(404)
      should(statusCodes.at(-1)).equal(429)
    })
  })
})
