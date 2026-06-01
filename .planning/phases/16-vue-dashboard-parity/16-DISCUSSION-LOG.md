# Phase 16 Discussion Log

**Date:** 2026-06-01  
**Mode:** Interactive (default)  
**Areas discussed:** Estilo Vue, Organización del estado, Plantilla de paridad, Tailwind, Errores/UX, Documentación

## Area: Estilo Vue (Composition API)

| Question | Options | Selection |
|----------|---------|-----------|
| Bloque `<script>` | script setup / Composition sin setup / planner | **`<script setup>`** |
| Archivos | Solo .vue / .vue + composable / planner | **Solo .vue** (+ api.js) |
| Nombres componentes | espejo React / espejo vanilla / planner | **Espejo React** |
| Mensaje didáctico | Vue vs React / Vue vs vanilla / ambos | **Ambos** |

## Area: Organización del estado

| Question | Options | Selection |
|----------|---------|-----------|
| Dónde vive el estado | App.vue / composable / planner | **Planner** (default: App.vue) |
| ref vs reactive | refs sueltos / reactive objeto / planner | **`ref()` sueltos** |
| Props a hijos | props only / props+emits / planner | **Planner** (default: props + emits) |
| Tras mutación | recarga completa / patch local / planner | **Planner** (default: recarga completa) |

## Area: Plantilla de paridad

| Question | Options | Selection |
|----------|---------|-----------|
| Referencia principal | mirror react / mirror vanilla / react+vanilla check | **`dashboard-react/`** |
| api.js | copiar igual / reescribir / planner | **Copiar misma lógica** |
| Puerto | 5175 / otro / planner | **Planner** (default: 5175) |
| CORS api/ | sin cambio / whitelist / planner | **Planner** (default: sin cambio) |

## Area: Tailwind

| Question | Options | Selection |
|----------|---------|-----------|
| Stack Tailwind | igual React / mínimo / planner | **Igual React (v4 + @tailwindcss/vite)** |
| Copy UI | español vanilla / + línea Vue / planner | **Español vanilla** |
| Layout | como React / como vanilla / planner | **Como React** |
| CSS global | index.css @import / planner | **index.css** |

## Area: Errores / UX

| Question | Options | Selection |
|----------|---------|-----------|
| 409 | dual / solo global / planner | **Dual (global + inline email)** |
| API caída | panel error / planner | **Panel error** |
| Eliminar | confirm nativo / planner | **Planner** (default: confirm) |
| Mensajes éxito | mismas cadenas / planner | **Planner** (default: mismas que React) |

## Area: Documentación

| Question | Options | Selection |
|----------|---------|-----------|
| README | vue+raíz / solo vue / planner | **Planner** (default: vue + puntero raíz) |
| UAT | 16-UAT.md / defer 17 / planner | **`16-UAT.md`** |
| docs/16-frameworks.md | defer 17 / stub / planner | **Fase 17** |
| NOTEBOOK | defer 17 / si hay errores / planner | **Planner** (default: fase 17; errores reales si aparecen) |

## Deferred during discussion

None outside phase scope — comparison doc and unified NOTEBOOK explicitly assigned to Phase 17.
