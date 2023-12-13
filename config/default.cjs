module.exports = {
  protocol: 'http',
  port: 3000,
  maxDrivers: 3,
  firefoxProfilePath: '/tmp/firefox-headless-prerender',
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60 * 1000,
  },
  logs: {
    timestamps: false,
    preUrlPadding: 10,
  },
  tests: {
    inventaireOrigin: 'http://localhost:3005',
  },
}
