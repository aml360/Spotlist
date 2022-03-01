FROM node:alpine
# Create app directory

WORKDIR /app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Se instalan estas dependencias, previamente funcionaba con node:alpine3.13 pero ya no se genera
# la imagen sin esta linea lo que aumenta el tamaño de la imagen de 140mb a 228mb
# Solución sacada de aqui: https://is.gd/dCafcZ

# RUN apk --no-cache --virtual build-dependencies add python3 make g++ gcc libgcc \
#   && npm ci --only=production \
#   && apk del build-dependencies

RUN npm ci --only=production

# Bundle app source

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
