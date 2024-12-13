FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY users.js .
CMD ["node","users.js"]
EXPOSE 3010
