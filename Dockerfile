# Base Image
FROM node:14-slim

# Fetch Latest Distribution
RUN apt-get update

# Install Puppeteer Dependencies
RUN apt-get install -yyq ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

# Change Working Directory
WORKDIR /usr/src/app

# Node Dependencies
COPY package.json ./
COPY yarn.lock ./

# install Node Dependencies
RUN yarn install --production

# Copy Source Files
COPY . .

# Run Server
CMD [ "node", "server.js" ]