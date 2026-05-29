# Docker: arrancar la API en un contenedor

¿Ya sabes arrancar la API con `npm start`? Bien. Este documento te enseña otra forma — con Docker. La primera forma sigue funcionando igual.

---

## ¿Qué es un contenedor?

Un contenedor es un proceso aislado con su propio sistema de ficheros, red y variables de entorno. No es una máquina virtual — comparte el kernel del sistema operativo del host pero está completamente aislado de él.

Piensa en él como un proceso que vive en una caja sellada. Dentro de esa caja hay solo lo que necesita para funcionar: el código, las dependencias y las variables de entorno. Lo que hay fuera de la caja (tu sistema operativo, otros procesos, otros ficheros) no existe para el proceso que corre dentro.

```
[Tu sistema operativo — macOS]
        │
        │  kernel compartido
        │
[Contenedor Docker]
        │
   Aislado: su propio sistema de ficheros,
   su propia red, sus propias variables de entorno.
   Lo que ocurre dentro no afecta al host.
```

---

## ¿Qué es una imagen?

Una imagen es la plantilla a partir de la cual se crean los contenedores. Es inmutable — siempre produce el mismo contenedor, igual que un molde produce galletas idénticas.

La imagen se construye una vez. A partir de ella puedes crear y destruir contenedores tantas veces como quieras — siempre arrancarán en el mismo estado.

### La diferencia clave

| Concepto | Analogía | En este lab |
|----------|----------|-------------|
| Imagen | Molde de galletas | `edf-lab-api` (construida con `npm run docker:build`) |
| Contenedor | Galleta | El proceso que arranca con `npm run docker:start` |
| `docker build` | Crear el molde | Instala deps, copia código |
| `docker run` | Usar el molde | Arranca `node index.js` |

---

## El flujo completo: build → run → logs → stop

Así es cómo el puerto 3100 de tu Mac se conecta con el proceso `node index.js` que corre dentro del contenedor:

```
[Tu Mac — Puerto 3100]
        |
        |  -p 3100:3100
        |  (el flag de docker run mapea el puerto externo al interno)
        |
[Contenedor Docker — Puerto 3100]
        |
   api/index.js
   (Node.js 22)
        |
   datos efímeros
   (SEED_DATA — no hay data/users.json dentro del contenedor)
```

Sin el flag `-p 3100:3100`, el contenedor escucharía internamente pero no sería accesible desde el host. El `curl` y el dashboard no podrían conectar aunque el contenedor estuviera en marcha.

### Comandos paso a paso

```bash
# 1. Construir la imagen (solo la primera vez o tras cambios en el código)
cd api
npm run docker:build
# → docker build -t edf-lab-api .

# 2. Arrancar el contenedor
npm run docker:start
# → docker run --rm -p 3100:3100 --name edf-lab-api edf-lab-api
# Deberías ver: Servidor arrancado en http://localhost:3100

# 3. Verificar que la API responde (en otra terminal)
curl http://localhost:3100/health

# 4. Ver los logs del contenedor (en otra terminal)
docker logs edf-lab-api

# 5. Parar el contenedor (en otra terminal, o Ctrl+C en la terminal donde corre)
docker stop edf-lab-api
# El flag --rm hace que el contenedor se elimine automáticamente al parar
```

---

## Datos efímeros: el contenedor arranca limpio

`data/users.json` NO se copia dentro de la imagen — está en `.dockerignore`. Cada vez que arrancas el contenedor, la API empieza con los dos usuarios del `SEED_DATA`:

```json
{ "id": 1, "name": "John Doe",   "email": "john@example.com" }
{ "id": 2, "name": "Jane Smith", "email": "jane@example.com" }
```

Cuando paras el contenedor, los usuarios que hayas creado dentro se pierden. Esto no es un error — es el comportamiento correcto de un contenedor sin volúmenes montados.

| Arranque | ¿Persisten los datos? |
|----------|-----------------------|
| `npm start` en el host | Sí — `data/users.json` mantiene los cambios |
| `npm run docker:start` | No — el contenedor arranca desde SEED_DATA cada vez |

Docker ofrece volúmenes para persistencia en contenedores, pero eso es material para una fase avanzada. Por ahora, la efimeridad es la lección correcta.

---

## ¿Por qué `node index.js` y no `npm start`?

El `Dockerfile` usa `CMD ["node", "index.js"]` en lugar de `CMD ["npm", "start"]`. La razón es técnica pero importante: cuando paras el contenedor con `docker stop`, el sistema operativo envía una señal `SIGTERM` al proceso. Con `npm start`, esa señal la recibe `npm`, que puede no transmitirla correctamente a Node.js — el proceso quedaría atascado hasta que el daemon lo mate por tiempo agotado. Con `node index.js` directo, la señal llega al proceso correcto y el cierre es limpio.

---

## Resumen

Docker permite arrancar la API en un entorno aislado y reproducible. El mismo `index.js` que conoces funciona en el contenedor sin ningún cambio — solo cambia la forma de arrancarlo. Cada contenedor empieza desde cero, sin herencia del estado del host, lo que convierte los contenedores en herramientas ideales para entornos reproducibles.

Para practicar el flujo completo con comandos reales, ve a la Misión 09.

**Misión 09: arrancar-con-docker** → [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md)
