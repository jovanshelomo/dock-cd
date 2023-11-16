FROM node:18

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run install-all
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=0 /app/backend .
EXPOSE 3000
CMD [ "npm", "run", "serve" ]