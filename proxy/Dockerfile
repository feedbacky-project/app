FROM plajer/feedbacky-client
LABEL org.label-schema.name = "Feedbacky Proxy"
LABEL org.label-schema.description = "Nginx proxy for Feedbacky Project"
LABEL org.label-schema.vcs-url = "https://github.com/Plajer/feedbacky-project/tree/master/proxy"

RUN rm /etc/nginx/conf.d/default.conf
COPY . /etc/nginx/conf.d
COPY ./env.sh .
EXPOSE 80

WORKDIR /usr/share/nginx/html
RUN chmod +x env.sh

CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]