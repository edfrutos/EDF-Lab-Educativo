<script setup>
defineProps({
  isOnline: { type: Boolean, required: true },
  connectionText: { type: String, required: true }
});
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <span
      class="h-3 w-3 shrink-0 rounded-full"
      :class="
        isOnline
          ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]'
          : 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]'
      "
      aria-hidden="true"
    />
    <div>
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
        Estado de conexión
      </p>
      <p class="text-sm font-semibold text-slate-900">{{ connectionText }}</p>
    </div>
  </div>
</template>
