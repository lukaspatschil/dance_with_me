FROM node:16.13.2-alpine AS build
WORKDIR /usr/src/app/

RUN npm install -g npm@8.5.2

COPY package*.json .
COPY ./frontend/package.json frontend/
RUN npm install

# Add local packages
COPY ./packages ./packages

COPY ./frontend/ frontend/
RUN npm run build:prod -w frontend

FROM node:16.13.2-alpine AS development
WORKDIR /usr/src/app/

RUN npm install -g npm@8.5.2

COPY package*.json .
COPY ./frontend/package.json frontend/
RUN npm install

# Add local packages
COPY ./packages ./packages

COPY ./frontend frontend/
RUN npm run build -w frontend

CMD npm run dev:ssr -w frontend

FROM node:16.13.2-alpine AS production
WORKDIR /usr/src/app/
COPY --from=build /usr/src/app/frontend/dist/ ./dist

CMD ["node", "dist/dance-with-me-web-client/server/main.js"]

FROM nginx:1.17.1-alpine AS static
COPY ./frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/frontend/dist/dance-with-me-web-client/browser /usr/share/nginx/html
