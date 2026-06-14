# Phase 23: Vue Dashboard Auth — Research

**Researched:** 2026-06-02  
**Status:** Complete

## Summary

Phase 23 ports **Phase 22 React auth** into `dashboard-vue/` on port **5175**. API contract locked (Phase 18). `fetchJson` already has `credentials: 'include'`. Work: **`LoginGate.vue`** with **`emit('login')`**, **`login()`/`logout()` in `api.js`**, and **auth-aware `App.vue`** with `v-if` template blocks.

## Parity reference

Primary template: `dashboard-react/` Phase 22 (`App.jsx`, `LoginGate.jsx`, `api.js`).  
Behavioral ground truth: vanilla Phase 19 (`dashboard/app.js`).

## API contract (locked)

Same as Phase 22 — cookie `edf_session`, 403 login, 401 protected routes. CORS includes `:5175`.

## Vue-specific choices (from CONTEXT)

| Topic | Decision |
|-------|----------|
| Login UI | `LoginGate.vue` SFC |
| Parent/child | `emit('login', email, password)` + props `error`, `isSubmitting` |
| State | `ref()` in `App.vue` — `isAuthenticated`, `isBootstrapping`, `loginError` |
| Render | Single `<template>` with `v-if` / `v-else-if` / `v-else` |
| HTTP | `login()` / `logout()` in `api.js` (same as React) |

## Bootstrap state machine

```
onMounted → bootstrapAuth()
  → fetchJson('/health') — fail: loadError + gate
  → fetchJson('/users') — 200: isAuthenticated + loadDashboardData()
                      — 401: gate (no error on first visit)
```

Replace `onMounted(() => loadDashboardData())`.

## LoginGate.vue sketch

```vue
<script setup>
defineProps({ error: String, isSubmitting: Boolean });
const emit = defineEmits(['login']);
// local email/password refs, @submit.prevent → emit('login', email, password)
</script>
```

Tailwind card matching React LoginGate; intro text mentions **puerto 5175**.

## Manual UAT (port 5175)

Same 7 steps as Phase 22 UAT, substituting `:5175` and Vue app.

## Plan suggestions

| Plan | Wave | Focus |
|------|------|-------|
| 23-01 | 1 | `api.js` login/logout + `LoginGate.vue` |
| 23-02 | 2 | `App.vue` bootstrap, v-if gating, README, UAT |
