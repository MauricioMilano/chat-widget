FROM nginx:alpine
COPY test/index.html /usr/share/nginx/html/index.html
COPY dist/chat-widget.js /usr/share/nginx/html/chat-widget.js
EXPOSE 80
