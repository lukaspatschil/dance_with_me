FROM node:16.13.2-alpine as generator

WORKDIR /usr/src/app/

RUN npm install -g npm@8.5.2

COPY package*.json .
COPY ./generator/package.json generator/

# Add local packages
COPY ./packages .

RUN npm install

COPY ./generator/ generator/

CMD npm run generate
