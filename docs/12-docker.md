# Docker: arrancar la API en un contenedor

¿Ya sabes arrancar la API con `npm start`? Bien. Este documento te enseña otra forma — con Docker. La primera forma sigue funcionando igual.

---

## ¿Qué es un contenedor?

Un contenedor es un proceso aislado con su propio sistema de ficheros, red y variables de entorno. No es una máquina virtual — comparte el kernel del sistema operativo del host pero está aislado de él.

Analogía: es como un proceso dentro de una caja sellada. Desde fuera accedes por un puerto publicado; dentro corre Node.js con una copia del código de la API.

---

## ¿Qué es una imagen?

Una imagen es la plantilla a partir de la cual se crean los contenedores. Es inmutable — siempre produce el mismo entorno. La imagen se construye una vez; los contenedores se crean y destruyen tantas veces como sea necesario.

### La diferencia clave

```sh
| Concepto | Analogía | En este lab |
|----------|----------|-------------|
| Imagen | Molde de galletas | `edf-lab-api` (construida con `npm run docker:build`) |
| Contenedor | Galleta | El proceso que arranca con `npm run docker:start` |
| `docker build` | Crear el molde | Instala deps, copia código |
| `docker run` | Usar el molde | Arranca `node index.js` |
````

---

## El flujo completo: build → run → logs → stop

```sh
[Tu Mac - Puerto 3100]
        |
        |  -p 3100:3100
        |
[Contenedor Docker]
        |
   api/index.js
   (Node.js 22)
        |
   datos efímeros
   (SEED_DATA)
```

El flag `-p 3100:3100` mapea el puerto 3100 del host al puerto 3100 del contenedor. Sin ese flag, el contenedor escucha internamente pero no es accesible desde el host.

### Comandos paso a paso

```bash
# 1. Construir la imagen (solo la primera vez o tras cambios en el código)
cd api
npm run docker:build
# → docker build -t edf-lab-api .

# 2. Arrancar el contenedor
npm run docker:start
# → docker run --rm -p 3100:3100 --name edf-lab-api edf-lab-api

# 3. Verificar que la API responde (en otra terminal)
curl http://localhost:3100/health

# 4. Ver los logs del contenedor
docker logs edf-lab-api

# 5. Parar el contenedor
docker stop edf-lab-api
# El flag --rm hace que el contenedor se elimine automáticamente al parar
```

---

## Datos efímeros: contenedor único sin volumen

Con `npm run docker:start` (un solo contenedor, sin Compose), la base de datos SQLite vive **dentro** del contenedor. `data/users.db` **no** se monta desde el host (está en `.dockerignore` para la imagen). Cada vez que arrancas el contenedor, la API crea una base nueva y migra la semilla desde `users.json` (incluido en la imagen). Cuando paras el contenedor, los usuarios creados se pierden. Esto no es un error — es el comportamiento correcto de un contenedor sin volúmenes montados.

```sh
| Arranque | ¿Persisten los datos? |
|----------|----------------------|
| `npm start` en el host | Sí — `api/data/users.db` en disco |
| `npm run docker:start` | No — SQLite efímero dentro del contenedor |
```

Para practicar este flujo, ve a la Misión 09.

---

## Compose con persistencia SQLite

Docker Compose orquesta API + dashboard. La API monta la carpeta del host en el contenedor:

```yaml
# docker-compose.yml (servicio edf-lab-api)
volumes:
  - ./api/data:/usr/src/app/data
```

El contenedor escribe en `/usr/src/app/data/users.db`; el archivo aparece en tu Mac en `api/data/users.db` — la misma ruta que usa `npm start`.

```sh
| Arranque | ¿Persisten los datos? |
|----------|----------------------|
| `npm start` en el host | Sí — `api/data/users.db` |
| `npm run docker:start` (contenedor único) | No — efímero (Misión 09) |
| `npm run compose:up` (Compose) | Sí — bind mount `./api/data` |
```

Arrancar desde la raíz del repo:

```bash
npm run compose:up
npm run compose:down
```

Tras `compose:down` (sin `-v`), `users.db` permanece en `api/data/`. En la Fase 9 el stack Compose era efímero; con el bind mount los datos sobreviven a reinicios.

La documentación completa de Compose (servicios, redes, volúmenes) llegará en `docs/14-docker-compose.md` (fase posterior).

---

## Resumen

Docker permite arrancar la API en un entorno aislado y reproducible. El mismo `index.js` funciona en el contenedor sin ningún cambio. Para practicar el flujo completo, ve a la Misión 09.

**Misión 09: arrancar-con-docker** → [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md)
