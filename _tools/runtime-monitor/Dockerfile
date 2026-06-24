# Hexworth Runtime Monitor — Cloud Run job container
#
# Built on node:20-bookworm-slim with system Chromium for Puppeteer.
# Total image size ~400MB. Single-shot job (not a long-running service).
#
# Build via Cloud Build (no local docker required):
#   gcloud builds submit --tag gcr.io/hexworth-prime/runtime-monitor .
#
# Or locally:
#   docker build -t hexworth-runtime-monitor .

FROM node:20-bookworm-slim

# Chromium dependencies for Puppeteer headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium (smaller image, faster cold start)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install puppeteer (skip chromium download — system chromium).
COPY package.json ./
RUN npm install puppeteer --no-save --omit=optional
# firebase-admin powers the Firestore publish for the Pulse Site-Health panel.
# Install it WITHOUT --omit=optional: firebase-admin's Firestore support lives in the
# optional dependency @google-cloud/firestore, which --omit=optional would drop
# (causing "Cannot find module '@google-cloud/firestore'" at runtime).
RUN npm install firebase-admin --no-save

# Copy the monitor script
COPY run.js ./

# Cloud Run jobs invoke the entrypoint as a one-shot
ENTRYPOINT ["node", "/app/run.js"]
