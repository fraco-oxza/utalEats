FROM node:23-alpine

USER node

WORKDIR /app
COPY package.json ./
RUN npm install

COPY --chown=node:node . /app

RUN npm run generate-schema 

CMD ["npm","run", "dev"]
