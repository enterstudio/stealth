#!/usr/bin/env bash

cd /mnt/XXXX
.node_modules/.bin/pm2 start ./node_modules/stealth/build/process.json --no-daemon
