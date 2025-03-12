FROM node:20-alpine

WORKDIR /usr/src/app

# Definir argumento para la variable de entorno
ARG DATABASE_URL

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

# Definir variable de entorno dentro del contenedor
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

# Aplicar migraciones (esto usa la DATABASE_URL del .env)
RUN --mount=type=secret,id=DATABASE_URL npx prisma migrate deploy || echo "Migraciones no aplicadas"

EXPOSE 3003