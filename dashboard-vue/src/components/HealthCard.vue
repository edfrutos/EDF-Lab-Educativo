<script setup>
defineProps({
  healthStatus: { type: String, required: true },
  healthTimestamp: { type: String, required: true }
});
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <header class="mb-4">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Endpoint</p>
      <h2 class="text-lg font-semibold text-slate-900">GET /health</h2>
    </header>
    <div class="mb-2 flex justify-between gap-4 text-sm">
      <span class="text-slate-600">Estado</span>
      <strong class="text-slate-900">{{ healthStatus }}</strong>
    </div>
    <div class="mb-4 flex justify-between gap-4 text-sm">
      <span class="text-slate-600">Última comprobación</span>
      <strong id="health-timestamp" class="text-right text-slate-900">{{ healthTimestamp }}</strong>
    </div>
    <p class="text-sm text-slate-600">
      Este endpoint sirve para comprobar que el backend está vivo y respondiendo.
    </p>
  </article>
</template>
