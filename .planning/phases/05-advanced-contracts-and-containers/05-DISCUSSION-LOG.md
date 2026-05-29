# Phase 5: Advanced Contracts and Containers - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-29
**Phase:** 05-advanced-contracts-and-containers
**Areas discussed:** OpenAPI tooling y presentación, Docker alcance del setup, Misiones para material avanzado

---

## OpenAPI — tooling y presentación

| Option | Description | Selected |
|--------|-------------|----------|
| YAML standalone | `api/openapi.yaml` escrito a mano, sin nuevas dependencias. El alumno abre el archivo y lee el contrato. | ✓ |
| Swagger UI en Express | `swagger-ui-express` + `swagger-jsdoc` (2 deps). UI interactiva en `/api-docs`. | |

**User's choice:** YAML standalone (recommended)
**Notes:** Sin nuevas dependencias. El alumno aprende a leer OpenAPI como documento.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Manual, escrita a mano | La spec describe la API como un manual; el alumno aprende a leer/escribir OpenAPI. | ✓ |
| Generada desde JSDoc | Comentarios en `index.js` + swagger-jsdoc. Más industrial, más complejo. | |

**User's choice:** Manual, escrita a mano
**Notes:** Consistente con el enfoque educativo del lab — sin abstracciones.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Todos los endpoints | Cubre GET /, GET /health, GET /users, POST /users, GET /users/:id, PUT /users/:id, DELETE /users/:id. | ✓ |
| Solo CRUD de /users | Omite /health y /. Más corto, suficiente para entender el concepto. | |

**User's choice:** Todos los endpoints (recommended)
**Notes:** La spec completa es más útil como referencia y enseña que un contrato cubre toda la API.

---

## Docker — alcance del setup

| Option | Description | Selected |
|--------|-------------|----------|
| Solo API: Dockerfile + .dockerignore | `docker build` + `docker run` para la API. Sin Docker Compose. | ✓ |
| API + Docker Compose | `docker-compose.yml` con API como servicio. Enseña orquestación. | |
| API + Compose + dashboard | Multi-contenedor. Muestra arquitectura completa. Muy complejo. | |

**User's choice:** Solo API: Dockerfile + .dockerignore (recommended)
**Notes:** Foco en el concepto contenedor, sin añadir la capa de Compose.

---

| Option | Description | Selected |
|--------|-------------|----------|
| node:22-alpine | Imagen oficial ligera (~150MB). Estándar de producción. | ✓ |
| node:22 | Imagen completa (~900MB). Más fácil de depurar, pero más pesada. | |

**User's choice:** node:22-alpine (recommended)
**Notes:** El doc explica por qué Alpine es estándar — momento didáctico adicional.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Scripts en package.json | `docker:build` y `docker:start` en `api/package.json`. Consistente con `npm start/run dev`. | ✓ |
| Solo documentado, sin tocar package.json | Comandos solo en `docs/12-docker.md`. No mezcla Docker en el manifiesto npm. | |

**User's choice:** Scripts en package.json (recommended)
**Notes:** Patrón consistente con el resto de scripts del proyecto.

---

## Misiones para material avanzado

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, una misión por tema | Misión 08 (OpenAPI) + Misión 09 (Docker). Formato estándar. | ✓ |
| No, solo docs sin misiones | Docs con ejemplos ejecutables pero sin misiones formales. | |

**User's choice:** Sí, una misión por tema (recommended)
**Notes:** El formato misiones ha funcionado bien en todas las fases anteriores. Mantener coherencia.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Etiqueta [Avanzado] en docs/00-indice.md | Entradas con nota `(avanzado, opcional)`. El principiante puede omitirlas conscientemente. | ✓ |
| Sección separada 'Material Avanzado' | Nueva sección al final del índice. Más visual, pero rompe la estructura actual. | |

**User's choice:** Etiqueta [Avanzado] en docs/00-indice.md (recommended)
**Notes:** Mantiene el índice unificado con marcado explícito de opcionalidad.

---

## Claude's Discretion

- Versión OpenAPI en la spec (3.0.3 recomendada por compatibilidad)
- Contenido exacto de `info` block en el YAML
- Orden de paths en la spec
- Configuración exacta del `docker run` en el script `docker:start`
- Longitud y número de pasos de cada misión
- Contenido de `api/.dockerignore`

## Deferred Ideas

- Docker Compose — futura fase si hay demanda
- Swagger UI interactiva en Express — sin deps; Swagger Editor online como alternativa
- Generación de spec desde JSDoc — fuera de scope para este lab
- Publicación de imagen en Docker Hub — deferred a deployment
