#!/bin/bash

# Set XDG_RUNTIME_DIR and ensure it is created
export XDG_RUNTIME_DIR=/tmp/runtime-appuser
mkdir -p /tmp/runtime-appuser/keyring
chmod 700 /tmp/runtime-appuser/keyring

# Start the D-Bus session using dbus-launch (no need for system bus in containers)
export $(dbus-launch)

# Start the GNOME Keyring daemon with debugging
gnome-keyring-daemon --start --components=secrets

# Debug: Show environment variables
echo "DBUS_SESSION_BUS_ADDRESS: $DBUS_SESSION_BUS_ADDRESS"
echo "XDG_RUNTIME_DIR: $XDG_RUNTIME_DIR"

# Start the X virtual framebuffer (Xvfb)
Xvfb :99 -screen 0 1024x768x16 &

# Set the DISPLAY environment variable
export DISPLAY=:99

# Run the Electron app (Dolphin Anty)
./dolphin-anty-linux-x86_64-latest.AppImage --no-sandbox
