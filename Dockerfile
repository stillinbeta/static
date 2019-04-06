FROM nginx
COPY files /usr/share/nginx/html
COPY error /etc/nginx/error
COPY static.conf /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html/index.html
