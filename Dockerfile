ARG NODE_VERSION=23.1.0
FROM node:$NODE_VERSION AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]