# firefox-headless-prerender

Use a [headless Firefox](https://hacks.mozilla.org/2017/12/using-headless-mode-in-firefox/) controlled by [Selenium WebDriver](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/), behind a Node.js/[Express](http://expressjs.com/) server, to prerender [inventaire.io](https://inventaire.io) with more stability than [prerender](https://github.com/inventaire/prerender).

## Install
Assumes that you have NodeJS >= v18 installed
```sh
sudo apt-get install firefox
git clone https://github.com/maxlath/firefox-headless-prerender
cd firefox-headless-prerender
```

### Development
```sh
npm install --production
npm run watch
```

### Production
Assume a Linux with systemd
```sh
npm install --production
npm run add-to-systemd
sudo systemctl start firefox-headless-prerender
```
