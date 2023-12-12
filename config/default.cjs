module.exports = {
  protocol: 'http',
  port: 3000,
  maxDrivers: 10,
  firefoxProfilePath: '/tmp/firefox-headless-prerender',
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000,
  },
  logs: {
    timestamps: false,
  },
  tests: {
    inventaireOrigin: 'http://localhost:3005',
  },
}
