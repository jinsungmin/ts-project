FROM node:14.12.0
ENV NODE_ENV=production
WORKDIR /src
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD [ "ts-node", "main.ts" ]