FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ads.js .
CMD ["node","ads.js"]
EXPOSE 3032
