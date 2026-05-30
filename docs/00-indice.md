# Índice de documentación

Documentación conceptual del laboratorio.

## Orden recomendado de lectura

Si es tu primera vez en el proyecto, sigue este recorrido:

1. [`01-arquitectura.md`](./01-arquitectura.md) para entender el mapa general.
2. [`02-puesta-en-marcha.md`](./02-puesta-en-marcha.md) para arrancar el laboratorio.
3. [`03-api-express.md`](./03-api-express.md) para revisar la API.
4. [`04-dashboard-fetch.md`](./04-dashboard-fetch.md) para entender el frontend.
5. [`05-cors-explicado.md`](./05-cors-explicado.md) para comprender la frontera entre ambos.
6. [`06-debugging.md`](./06-debugging.md) para resolver problemas típicos.
7. [`07-retos.md`](./07-retos.md) para ampliar el proyecto.
8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md) para entender cómo persisten los datos entre reinicios.
9. [`13-sqlite.md`](./13-sqlite.md) para profundizar en SQLite: esquema, consultas e inspección de `users.db`.
10. [`09-glosario.md`](./09-glosario.md) para consultar los términos clave del laboratorio.
11. [`10-tests.md`](./10-tests.md) para entender la suite de tests de la API.
12. [`11-openapi.md`](./11-openapi.md) para entender el contrato formal de la API. *(avanzado, opcional)*
13. [`12-docker.md`](./12-docker.md) para arrancar la API en un contenedor Docker. *(avanzado, opcional)*

## Documentos

1. [`01-arquitectura.md`](./01-arquitectura.md)  
   Explica cómo se separan backend y frontend y qué papel cumple cada carpeta.

2. [`02-puesta-en-marcha.md`](./02-puesta-en-marcha.md)  
   Resume los pasos mínimos para arrancar API y dashboard y verificar que ambos se comunican.

3. [`03-api-express.md`](./03-api-express.md)  
   Presenta los endpoints actuales y los conceptos básicos de Express usados en la demo.

4. [`04-dashboard-fetch.md`](./04-dashboard-fetch.md)  
   Describe cómo el frontend llama a la API con `fetch()` y transforma JSON en interfaz.

5. [`05-cors-explicado.md`](./05-cors-explicado.md)  
   Aclara por qué hay un problema de origen cruzado y cómo se resuelve con `cors()`.

6. [`06-debugging.md`](./06-debugging.md)  
   Reúne problemas reales del laboratorio y la forma de diagnosticarlos.

7. [`07-retos.md`](./07-retos.md)  
   Propone ejercicios para extender el laboratorio paso a paso.

8. [`08-memoria-vs-persistencia.md`](./08-memoria-vs-persistencia.md)  
   Explica la diferencia entre estado en memoria y estado en disco, con ejemplos ejecutables.

9. [`13-sqlite.md`](./13-sqlite.md)  
   Explica SQLite en este lab: esquema, consultas, archivo `.db`, migración desde JSON y comparativa de drivers.

10. [`09-glosario.md`](./09-glosario.md)  
    Define los términos clave del laboratorio organizados por bloques temáticos.

11. [`10-tests.md`](./10-tests.md)  
    Explica la suite de tests de la API: cómo ejecutarla, leer el output y añadir un test nuevo.

12. [`11-openapi.md`](./11-openapi.md) *(avanzado, opcional)*  
    Explica qué es OpenAPI, cómo leer el YAML de la spec y por qué los equipos usan contratos formales.

13. [`12-docker.md`](./12-docker.md) *(avanzado, opcional)*  
    Explica qué es Docker, qué es una imagen y cómo arrancar la API en un contenedor local.

## Misiones prácticas

- [`missions/10-inspeccionar-sqlite.md`](../missions/10-inspeccionar-sqlite.md) — Inspecciona `users.db`, observa la migración desde JSON y verifica persistencia tras reinicio.

## Misiones avanzadas *(opcionales)*

- [`missions/08-explorar-openapi.md`](../missions/08-explorar-openapi.md) — Explora la spec OpenAPI en VS Code y Swagger Editor online. *(avanzado, opcional)*
- [`missions/09-arrancar-con-docker.md`](../missions/09-arrancar-con-docker.md) — Construye la imagen Docker y arranca la API en un contenedor. *(avanzado, opcional)*
