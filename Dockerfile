FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG ENV_FILE
COPY ${ENV_FILE} /app/.env.local

RUN npm install --save-dev jest cypress

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
