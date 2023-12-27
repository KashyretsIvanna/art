FROM node:18-alpine

WORKDIR /app

COPY . .

RUN apk --no-cache add curl
RUN npm ci
RUN npx prisma generate
RUN npx nx run api:build

CMD ["npm", "start"]
