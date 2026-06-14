# Phase 23: Pattern Map

**Mapped:** 2026-06-02

## Files to modify

| File | Role | Closest analog |
|------|------|----------------|
| `dashboard-vue/src/components/LoginGate.vue` | Login form SFC | `dashboard-react/src/components/LoginGate.jsx` |
| `dashboard-vue/src/api.js` | `login()`, `logout()` | `dashboard-react/src/api.js` |
| `dashboard-vue/src/App.vue` | Bootstrap, v-if gating, 401 | `dashboard-react/src/App.jsx` |
| `dashboard-vue/README.md` | Auth instructions | `dashboard-react/README.md` (post Phase 22) |

## Analog: React Phase 22 (primary)

Copy behavioral structure from:
- `dashboard-react/src/App.jsx` — bootstrapAuth, returnToLoginGate, handleLogin, handleLogout
- `dashboard-react/src/components/LoginGate.jsx` — UI copy and Tailwind classes
- `dashboard-react/src/api.js` — login/logout exports

**Vue translation:**
- `useState` → `ref()`
- early `return` JSX → `v-if` / `v-else-if` / `v-else` in `<template>`
- `onLogin` prop → `@login` emit from LoginGate

## Analog: Vue Phase 16 structure

- `<script setup>` + lifted `ref()` in `App.vue` (D-08)
- Child components unchanged post-auth
- Port **5175**, `strictPort` in vite.config.js

## Do not change

- `api/auth.js`, `api/index.js`
- `dashboard/`, `dashboard-react/` (reference only)
