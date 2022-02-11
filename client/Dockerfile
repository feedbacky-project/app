FROM node:14.4.0-alpine as build
LABEL org.label-schema.name = "Feedbacky Client"
LABEL org.label-schema.description = "Client side of Feedbacky Project made in JavaScript and React"
LABEL org.label-schema.vcs-url = "https://github.com/Plajer/feedbacky-project/tree/master/client"

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
COPY . /app
RUN npm run build

FROM nginx:1.18.0-alpine
COPY --from=build /app/build /usr/share/nginx/html