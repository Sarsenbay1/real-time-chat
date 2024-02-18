FROM node:20.10-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

CMD [ "yarn", "start:dev" ]

EXPOSE 7000