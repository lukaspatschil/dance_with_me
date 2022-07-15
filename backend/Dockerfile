FROM node:16.13.2-alpine AS build

WORKDIR /usr/src/app/

RUN npm install -g npm@8.5.2

COPY package*.json .
COPY ./backend/package.json backend/

# Add local packages
COPY ./packages .

RUN npm install

COPY ./backend/ backend/
RUN npm run build -w backend

FROM node:16.13.2-alpine as development

WORKDIR /usr/src/app/

RUN npm install -g npm@8.5.2

COPY package*.json .
COPY ./backend/package.json backend/

# Add local packages
COPY ./packages .

RUN npm install

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

COPY ./backend/ backend/
RUN npm run build -w backend

CMD /wait && npm run start:dev -w backend

FROM node:16.13.2-alpine as production

WORKDIR /usr/app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

COPY --from=build /usr/src/app/backend/package.json .
COPY ./packages/config .
RUN npm install --only=production

COPY --from=build /usr/src/app/backend/dist/ ./dist/

CMD /wait && node ./dist/main.js
