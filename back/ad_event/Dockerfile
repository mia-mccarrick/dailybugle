FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ad_event.js .
CMD ["node","ad_event.js"]
EXPOSE 3033
