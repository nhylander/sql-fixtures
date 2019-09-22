FROM node:8-alpine as dependencies
ARG NPM_TOKEN
WORKDIR /usr/app/
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm install --no-audit


FROM node:8-alpine as tests 
WORKDIR /usr/app/
COPY --from=dependencies /usr/app/node_modules ./node_modules/
COPY src src
COPY test test
COPY package.json package-lock.json ./
CMD ["npm", "run", "test-report"]