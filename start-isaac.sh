#!/data/data/com.termux/files/usr/bin/bash

cd "$HOME/Isaac-George-AI" || exit 1

while true; do
    if ! pgrep -f "node server.js" >/dev/null; then
        echo "$(date) - Starting Isaac George AI"
        nohup node server.js >> server.log 2>&1 &
    fi

    sleep 10
done
