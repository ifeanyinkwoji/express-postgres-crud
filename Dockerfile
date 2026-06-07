FROM node:24-alpine

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

RUN npm ci

# Copy the rest of your application code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
