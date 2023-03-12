FROM node:14.14.0-alpine
ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium 
    
WORKDIR /app
COPY ./package.json ./
RUN npm i
COPY . .
CMD ["npm", "run", "start"]