FROM node:11-alpine

COPY . /home/node/app

# Installs latest Chromium (71) package.
RUN chown -R node:node /home/node/app \
    && apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz

# Run everything after as non-privileged user.
USER node
WORKDIR /home/node/app

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PATH="/home/node/.npm-global/bin:${PATH}"

ENV PPTR_HEADLESS="true"
ENV PPTR_EXEC_PATH="/usr/bin/chromium-browser"
ENV PPTR_IN_DOCKER="true"

# Puppeteer v1.9.0 works with Chromium 71.
RUN mkdir /home/node/.npm-global \
    && npm config set prefix '/home/node/.npm-global' \
    && npm install --global npm \
    && npm install \
    && npm run build

CMD ["npm", "start"]
