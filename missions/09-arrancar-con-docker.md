# Misión 09: arrancar la API con Docker

## Objetivo

Construir la imagen Docker de la API y arrancarla en un contenedor, verificando que responde igual que con `npm start` y observando que los datos son efímeros.

## Pasos

1. Asegúrate de estar en el directorio `api/`:
   ```bash
   cd api
   ```

2. Construye la imagen Docker:
   ```bash
   npm run docker:build
   ```
   Observa el output: Docker descarga la imagen base `node:22-alpine`, copia el código y ejecuta `npm ci`. El último mensaje debe ser algo como `naming to docker.io/library/edf-lab-api`.

3. Arranca el contenedor:
   ```bash
   npm run docker:start
   ```
   Deberías ver en consola: `Servidor arrancado en http://localhost:3100`

4. En otra terminal, verifica que la API responde:
   ```bash
   curl http://localhost:3100/health
   ```

5. Crea un usuario dentro del contenedor:
   ```bash
   curl -X POST http://localhost:3100/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Docker User", "email": "docker@example.com"}'
   ```

6. Para el contenedor (en la terminal donde está corriendo, Ctrl+C, o en otra terminal):
   ```bash
   docker stop edf-lab-api
   ```

7. Vuelve a arrancar el contenedor y comprueba si el usuario persiste:
   ```bash
   npm run docker:start
   # En otra terminal:
   curl http://localhost:3100/users
   ```

## Resultado esperado

En el paso 4, la respuesta de `/health` es:

```json
{
  "status": "healthy",
  "timestamp": "2026-05-29T..."
}
```

En el paso 7, "Docker User" ya no aparece en la lista de usuarios. El contenedor arranca con los dos usuarios del SEED_DATA (`John Doe` y `Jane Smith`). Los datos creados en la sesión anterior se perdieron porque el contenedor es efímero.

## Reto extra

Arranca el contenedor con un puerto diferente en el host:

```bash
docker run --rm -p 3200:3100 --name edf-lab-api-test edf-lab-api
```

Luego intenta acceder al dashboard desde el navegador (que apunta a `http://localhost:3100`).

¿Por qué el dashboard no puede conectar con la API aunque el contenedor está en marcha?
¿Qué cambiarías en `dashboard/app.js` para que el dashboard funcionara con el puerto 3200?
