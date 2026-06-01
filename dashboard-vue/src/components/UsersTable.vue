<script setup>
defineProps({
  users: { type: Array, default: () => [] },
  isFormBusy: { type: Boolean, default: false }
});

const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-50 text-left text-slate-600">
        <tr>
          <th class="px-4 py-2 font-medium">ID</th>
          <th class="px-4 py-2 font-medium">Nombre</th>
          <th class="px-4 py-2 font-medium">Email</th>
          <th class="px-4 py-2 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody v-if="!users.length" class="bg-white">
        <tr>
          <td colspan="4" class="px-4 py-6 text-center text-slate-500">
            No hay usuarios disponibles.
          </td>
        </tr>
      </tbody>
      <tbody v-else class="divide-y divide-slate-100">
        <tr v-for="user in users" :key="user.id" class="bg-white">
          <td class="px-4 py-2">{{ user.id }}</td>
          <td class="px-4 py-2">{{ user.name }}</td>
          <td class="px-4 py-2">{{ user.email }}</td>
          <td class="px-4 py-2">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                :disabled="isFormBusy"
                class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                @click="emit('edit', user)"
              >
                Editar
              </button>
              <button
                type="button"
                :disabled="isFormBusy"
                class="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                @click="emit('delete', user.id)"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
