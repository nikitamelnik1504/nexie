#!/bin/bash

export NVM_DIR="/usr/local/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
cd /app
npm i
npm start &

cd /
dbus-daemon --system --fork
Xvfb :99 -screen 0 1920x1080x24 & ./dolphin-anty.AppImage