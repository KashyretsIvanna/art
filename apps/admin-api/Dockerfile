FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm ci
RUN npx prisma generate
RUN npx nx run admin-api:build

CMD ["node", "./dist/apps/admin-api/main.js"]
