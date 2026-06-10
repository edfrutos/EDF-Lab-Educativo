# ROADMAP

Plan de evolución del laboratorio educativo.

> **Hito activo (GSD):** v1.5 *Autenticación y preparación para producción* — fases 18–20.  
> Planificación detallada: [`.planning/milestones/v1.5-ROADMAP.md`](./.planning/milestones/v1.5-ROADMAP.md) · estado: [`.planning/STATE.md`](./.planning/STATE.md)

---

## Fase 0 · Estructura base

- [x] Crear API Express básica.
- [x] Crear dashboard HTML/CSS/JS.
- [x] Añadir CORS.
- [x] Agrupar en `EDF-Lab-Educativo/`.
- [x] Crear `NOTEBOOK.md`.
- [x] Crear `ROADMAP.md`.
- [x] Crear `AGENTS.md`.
- [x] Crear `docs/`.
- [x] Crear `missions/`.

---

## Fase 1 · Didáctica inicial

- [x] Completar README global.
- [x] Actualizar README interno de la API.
- [ ] Añadir glosario de conceptos.
- [x] Documentar CORS con ejemplos visuales.
- [x] Documentar debugging de puertos.

---

## Fase 2 · API más útil

- [x] Añadir `GET /about`.
- [x] Añadir `GET /time`.
- [x] Añadir `GET /users/:id`.
- [x] Añadir validación de usuario inexistente.

---

## Fase 3 · CRUD en memoria

- [x] Añadir `POST /users`.
- [x] Añadir `PUT /users/:id`.
- [x] Añadir `DELETE /users/:id`.
- [x] Añadir formularios al dashboard. *(completado en Phase 01 GSD — 2026-05-26)*
- [x] Explicar códigos HTTP.

---

## Fase 4 · Persistencia

- [ ] Guardar usuarios en `data/users.json`.
- [ ] Explicar memoria vs persistencia.
- [ ] Añadir backups simples.

---

## Fase 5 · Calidad

- [ ] Añadir tests de API.
- [ ] Añadir Supertest o alternativa equivalente.
- [ ] Añadir script de desarrollo con Nodemon.
- [ ] Añadir lint/formato si aporta valor didáctico.

---

## Fase 6 · Proyecto avanzado

- [ ] Añadir OpenAPI/Swagger.
- [ ] Añadir Docker.
- [ ] Añadir GitHub Actions.
- [ ] Añadir base de datos con SQLite o PostgreSQL.
