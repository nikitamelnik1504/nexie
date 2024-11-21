#!/bin/bash

docker exec dolphin-dolphin-1 bash -c "export DISPLAY=:99 && scrot /tmp/screenshot.png"
docker cp dolphin-dolphin-1:/tmp/screenshot.png .
