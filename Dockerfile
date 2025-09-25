FROM nginx:alpine AS production


COPY . /usr/share/nginx/html

EXPOSE 80
