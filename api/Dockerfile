FROM node:22-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar manifiestos primero — aprovecha caché de capas Docker
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto que usa la API
EXPOSE 3100

# Variable de entorno: index.js usa `process.env.PORT || 3000` por defecto.
# Sin esta línea el contenedor escucharía en 3000 aunque el script publique -p 3100:3100.
ENV PORT=3100

# Usuario no-root — la imagen node:22-alpine incluye el usuario 'node'.
# DEBE ir después de todos los COPY para evitar problemas de permisos de lectura.
USER node

# CMD directo a node (no npm start): los signals SIGTERM llegan al proceso Node.js,
# no al proceso npm intermedio.
CMD ["node", "index.js"]
