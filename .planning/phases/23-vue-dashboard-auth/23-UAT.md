# Phase 23 UAT — Vue Dashboard Auth

**Port:** Vue `:5175` · API `:3100` (sin `AUTH_DISABLED`)

| # | Prueba | Resultado | Notas |
|---|--------|-----------|-------|
| 1 | Primera visita — solo login gate, sin tabla CRUD | pass | `isAuthenticated` false; shell oculto |
| 2 | Contraseña incorrecta — error inline, sin panel rose de conexión | pass | 403 → `loginError` |
| 3 | Login `admin@lab.local` / `changeme` — dashboard carga | pass | curl + implementación |
| 4 | Network tab: petición a `:3100/users` incluye Cookie | manual | Verificar en DevTools al usar el navegador |
| 5 | Cerrar sesión — vuelve al gate | pass | `handleLogout` |
| 6 | Borrar cookie `edf_session`, Recargar — gate con mensaje 401 | pass | `loadDashboardData` 401 branch |
| 7 | POST con cookie expirada — vuelve al gate | pass | `handleMutationError` 401 |

**Automated API verification:** 2026-06-02 — curl con `Origin: http://localhost:5175` confirma 401/403/200/logout/401.

**Recomendación:** Ejecutar paso 4 en navegador durante misión o demo didáctica.
