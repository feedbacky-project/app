FROM node:14.4.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
COPY . /app
ARG REACT_APP_SERVER_IP_ADDRESS
ARG REACT_APP_SERVICE_NAME
ARG REACT_APP_DEFAULT_USER_AVATAR
ENV REACT_APP_SERVER_IP_ADDRESS=${REACT_APP_SERVER_IP_ADDRESS}
ENV REACT_APP_SERVICE_NAME=${REACT_APP_SERVICE_NAME}
ENV REACT_APP_DEFAULT_USER_AVATAR=${REACT_APP_DEFAULT_USER_AVATAR}
RUN npm run build

FROM nginx:1.18.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]