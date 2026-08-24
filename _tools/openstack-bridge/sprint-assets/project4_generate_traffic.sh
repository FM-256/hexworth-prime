#!/usr/bin/env bash
# Authorized classroom traffic generator. Do not use outside the approved lab.
# Usage: ./project4_generate_traffic.sh http://TARGET_IP:8080
set -u
TARGET="${1:?Usage: $0 http://TARGET_IP:8080}"

echo "[1] Normal request"
curl -s -o /dev/null "$TARGET/"

echo "[2] Suspicious-looking paths"
for p in /admin /wp-admin /phpmyadmin /.env /backup.zip; do
  curl -s -o /dev/null "$TARGET$p"
done

echo "[3] Fake login attempts"
for u in admin root test clouduser; do
  curl -s -o /dev/null -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data "username=$u&password=TRAINING_ONLY" \
    "$TARGET/login"
done

echo "Done. Defender should inspect honeypot.log."
