# Plan Check — Phase 26: Fundación E2E Playwright (vanilla)

**Checked:** 2026-06-14  
**Plans verified:** 2 (`26-01-PLAN.md`, `26-02-PLAN.md`)  
**Verdict:** **PASS** (con observaciones MEDIUM/LOW — ningún bloqueador)

---

## Executive Summary

Los dos planes cubren los cuatro requisitos de fase (QA-E2E-01, QA-E2E-02, QA-E2E-05, QA-CI-04), respetan las decisiones bloqueadas de `26-CONTEXT.md` (sin `AUTH_DISABLED` en E2E, dual `webServer`, env seguro), y el grafo de waves es válido (01 → 02). Las verificaciones automatizadas con `grep`/`awk` son sintácticamente ejecutables; el patrón `awk` del job CI aísla correctamente el bloque `e2e-smoke` aunque `test-sqlite` use `AUTH_DISABLED`.

---

## Requirement Coverage

| Requirement | Plan(s) | Task(s) | Status |
|-------------|---------|---------|--------|
| QA-E2E-01 | 01 | 1, 2, 3 | Covered |
| QA-E2E-02 | 01 | 3 | Covered |
| QA-E2E-05 | 02 | 1 | Covered |
| QA-CI-04 | 01, 02 | 01-T2 (webServer.env), 02-T2 (CI job env) | Covered |

Todos los IDs del ROADMAP aparecen en el frontmatter `requirements` de al menos un plan.

---

## User-Specific Checks

### AUTH_DISABLED en tareas E2E

| Ubicación | Resultado |
|-----------|-----------|
| `webServer.env` (plan 01-T2) | Explícitamente **NO** incluir `AUTH_DISABLED` |
| Smoke spec (plan 01-T3) | Login UI real; sin bypass |
| CI job `e2e-smoke` (plan 02-T2) | **NO** definir `AUTH_DISABLED` en env/steps |
| Verify plan 01-T2 | `! grep -q 'AUTH_DISABLED' e2e/playwright.config.js` |
| Verify plan 02-T2 | `awk` sobre bloque `e2e-smoke` sin `AUTH_DISABLED` |
| Docs (plan 02-T1) | Menciona `AUTH_DISABLED` solo como **contraste didáctico** (API tests vs E2E) — correcto |

Ninguna tarea de implementación E2E establece `AUTH_DISABLED`.

### webServer env (plan 01-T2)

Alineado con D-03–D-07 y `26-CONTEXT.md`:

- `PORT: '3100'`
- `JWT_SECRET` con fallback no vacío (`E2E_JWT_SECRET` override)
- `DB_FILE: 'data/e2e.users.db'` (SQLite aislado; sin `DATABASE_URL`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` sincronizados con `E2E_OPERATOR_*`
- `LOGIN_RATE_LIMIT_MAX: '1000'` (elevado anti-429)
- `CORS_ORIGINS` incluye `:5173`
- Sin `AUTH_DISABLED`, sin `DATABASE_URL`

### Greps ejecutables

| Task | Comando | Status |
|------|---------|--------|
| 01-T1 | `node -e` + `grep -q` en `.gitignore` | Ejecutable |
| 01-T2 | `node --check` + greps positivos/negativo | Ejecutable |
| 01-T3 | `node --check` + greps + `npm run test:e2e` | Ejecutable (E2E lento pero válido) |
| 02-T1 | 5× `grep -q` en `docs/10-tests.md` | Ejecutable |
| 02-T2 | `grep` + `awk` scoped a `e2e-smoke` | Ejecutable (probado con fixture YAML) |

### Wave / dependencies

| Plan | Wave | depends_on | Valid |
|------|------|------------|-------|
| 01 | 1 | `[]` | Yes |
| 02 | 2 | `["01"]` | Yes |

Sin ciclos ni referencias a planes inexistentes.

---

## Dimension Summary

| Dimension | Result |
|-----------|--------|
| 1. Requirement coverage | PASS |
| 2. Task completeness (gsd-tools) | PASS — 5/5 tasks con files/action/verify/done |
| 3. Dependency correctness | PASS |
| 4. Key links planned | PASS |
| 5. Scope sanity | PASS — 3 + 2 tasks |
| 6. Verification derivation | PASS — truths observables por operador |
| 7. Context compliance | PASS — D-01…D-09 implementados |
| 7b. Scope reduction | PASS — sin v1/stub en decisiones bloqueadas |
| 7c. Architectural tier | PASS — auth/rate-limit en API tier; harness en Playwright |
| 8. Nyquist | SKIPPED (`nyquist_validation: false`) |
| 9. Cross-plan contracts | PASS — QA-CI-04 repartido config + CI sin conflicto |
| 10. .cursor/rules | SKIPPED (directorio vacío) |
| 11. Research resolution | MEDIUM — ver abajo |
| 12. Pattern compliance | LOW — ver abajo |

---

## Concerns

### MEDIUM

1. **RESEARCH.md — Open Questions sin marcar `(RESOLVED)`**  
   Las tres preguntas abiertas (CI en fase 26, borrado de BD, docs stub) están resueltas de facto en `26-CONTEXT.md` (D-09, troubleshooting en plan 02-T1, D-15). Recomendación: marcar sección `## Open Questions (RESOLVED)` en RESEARCH.md para cerrar la puerta formal; no bloquea ejecución.

2. **Plan 02-T2 — actualización doc CI sin verify automatizado**  
   La acción pide actualizar el párrafo «CI en GitHub Actions» en `docs/10-tests.md`, pero el `<automated>` de 02-T2 solo valida `ci.yml`. El criterio «Doc 10-tests refleja el nuevo job» depende de ejecución manual o de añadir un `grep -q 'e2e-smoke'` en docs en verify.

### LOW

1. **Plan 01-T2 — grep `AUTH_DISABLED` solo en config**  
   La sección `<verification>` del plan pide ausencia en todo `e2e/`; el `<automated>` solo inspecciona `playwright.config.js`. El spec no debería introducir `AUTH_DISABLED`, pero un grep adicional en `e2e/tests/` reforzaría T-26-02.

2. **PATTERNS.md desactualizado vs CONTEXT**  
   - Tabla File Classification dice job `e2e-smoke` → fase 27; CONTEXT D-09 y plan 02 lo incluyen en fase 26.  
   - Ejemplo env usa `LOGIN_RATE_LIMIT_MAX: '100'`; plans/CONTEXT usan `1000`.  
   Ejecutor debe seguir CONTEXT + planes, no el ejemplo numérico obsoleto en PATTERNS.

---

## Plan Summary

| Plan | Tasks | Wave | Requirements | gsd-tools |
|------|-------|------|--------------|-----------|
| 26-01 | 3 | 1 | QA-E2E-01, QA-E2E-02, QA-CI-04 | valid |
| 26-02 | 2 | 2 | QA-E2E-05, QA-CI-04 | valid |

---

## Recommendation

**Proceder con `/gsd-execute-phase 26`.**  
Opcional antes de ejecutar: resolver observaciones MEDIUM en RESEARCH.md y ampliar verify de 02-T2 con `grep -q 'e2e-smoke' docs/10-tests.md`.
