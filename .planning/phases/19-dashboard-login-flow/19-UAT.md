# Phase 19 UAT — Dashboard Login Flow

**Fecha:** 2026-06-10  
**Alcance:** AUTH-08–AUTH-12 (dashboard vanilla)

## Pre-requisitos

- API en `http://localhost:3100`
- Dashboard: `cd dashboard && python3 -m http.server 5173`

---

## 1. Auth desactivada (regresión v1.4)

```bash
# API sin AUTH_ENABLED
PORT=3100 npm start
```

- [ ] `http://localhost:5173` carga sin formulario de login
- [ ] Tabla de usuarios visible
- [ ] Botón «Cerrar sesión» oculto
- [ ] `node --check dashboard/app.js` OK

## 2. Auth activada — flujo completo

```bash
export AUTH_ENABLED=true AUTH_USER=admin AUTH_PASSWORD=lab-secret
export JWT_SECRET=lab-jwt-secret-minimum-32-chars!!
PORT=3100 npm start
```

- [ ] Dashboard muestra login y estado «API conectada — inicia sesión»
- [ ] Tarjetas `/health` y `/` siguen visibles
- [ ] Login con credenciales correctas → tabla de usuarios + «Cerrar sesión»
- [ ] Estado pasa a «API conectada» (verde)
- [ ] CRUD desde el formulario funciona
- [ ] «Cerrar sesión» vuelve al formulario de login

## 3. Errores

- [ ] Contraseña incorrecta → mensaje en español en el panel de login
- [ ] Token caducado/inválido en mutación → vuelve a login con mensaje de sesión

## 4. CORS + Bearer

- [ ] Peticiones con `Authorization` desde `:5173` no fallan por CORS en DevTools

---

## Sign-off

| Verificador | Fecha | Resultado |
|-------------|-------|-----------|
| Manual navegador | 2026-06-10 | OK |
