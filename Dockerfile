FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --ignore-scripts
COPY tsconfig.json build.js ./
COPY src/ src/
COPY test/ test/
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/chat-widget.js /usr/share/nginx/html/chat-widget.js
COPY --from=builder /app/test/index.html /usr/share/nginx/html/index.html
EXPOSE 80
