<script setup>
defineProps({
  apiMessage: { type: String, required: true },
  apiVersion: { type: String, required: true },
  endpoints: { type: Array, default: () => [] }
});
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <header class="mb-4">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Endpoint</p>
      <h2 class="text-lg font-semibold text-slate-900">GET /</h2>
    </header>
    <p class="mb-4 text-sm text-slate-800">{{ apiMessage }}</p>
    <div class="mb-4 flex justify-between gap-4 text-sm">
      <span class="text-slate-600">Versión</span>
      <strong class="text-slate-900">{{ apiVersion }}</strong>
    </div>
    <div>
      <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Endpoints anunciados
      </p>
      <ul class="list-inside list-disc space-y-1 text-sm text-slate-700">
        <li v-for="endpoint in endpoints" :key="endpoint">{{ endpoint }}</li>
      </ul>
    </div>
  </article>
</template>
