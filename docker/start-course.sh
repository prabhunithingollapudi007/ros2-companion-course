#!/bin/bash
# Starts what the course container offers the lesson pages:
#   a desktop on display :1, shown in the browser at http://localhost:6080 (from Lesson 7 on),
#   and a terminal at http://localhost:7681.
# Both listen only inside the container; docker/compose.yaml publishes them to this computer only.
set -e

# The desktop: a virtual screen with a simple window manager, and noVNC to show it in a browser.
Xvnc :1 -geometry 1600x900 -depth 24 -SecurityTypes None -localhost yes -AlwaysShared &
sleep 1
openbox &
websockify --web /usr/share/novnc 6080 localhost:5901 > /dev/null 2>&1 &

# One shell per browser tab that connects. --check-origin refuses connections
# that another web site tries to open to this terminal. disableLeaveAlert stops
# each embedded terminal asking "Leave site?" when the lesson page is left.
exec ttyd --writable --check-origin --port 7681 --client-option disableLeaveAlert=true bash
