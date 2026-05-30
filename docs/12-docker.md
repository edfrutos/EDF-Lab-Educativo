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

## Datos efímeros: el contenedor arranca limpio

`data/users.json` **no** se copia dentro de la imagen (está en `.dockerignore`). Cada vez que arrancas el contenedor, la API empieza con los dos usuarios del `SEED_DATA`. Cuando paras el contenedor, los usuarios creados dentro se pierden. Esto no es un error — es el comportamiento correcto de un contenedor sin volúmenes montados.

```sh
| Arranque | ¿Persisten los datos? |
|----------|----------------------|
| `npm start` en el host | Sí — `data/users.json` mantiene los cambios |
| `npm run docker:start` | No — el contenedor arranca desde SEED_DATA cada vez |
```

Docker ofrece volúmenes para persistencia en contenedores, pero eso es material para una fase avanzada. Por ahora, la efimeridad es la lección correcta.

---

## Resumen

Docker permite arrancar la API en un entorno aislado y reproducible. El mismo `index.js` funciona en el contenedor sin ningún cambio. Para practicar el flujo completo, ve a la Misión 09.

**Misión 09: arrancar-con-docker** → [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md)
