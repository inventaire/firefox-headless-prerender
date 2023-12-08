#!/usr/bin/env bash

# env "PATH=$PATH" allows to resolve 'which node' in sudo mode
sudo env "PATH=$PATH" ./node_modules/.bin/add-to-systemd --user $USER firefox-headless-prerender "$(which node) $(pwd)/server/server.js"