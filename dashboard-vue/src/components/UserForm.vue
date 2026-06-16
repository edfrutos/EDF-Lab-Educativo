<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  email: { type: String, required: true },
  formModeMessage: { type: String, default: '' },
  submitLabel: { type: String, required: true },
  showCancel: { type: Boolean, default: false },
  mutationFeedback: { type: String, default: '' },
  mutationFeedbackType: { type: String, default: '' },
  emailFieldError: { type: String, default: '' },
  isFormBusy: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel', 'update:name', 'update:email']);

const feedbackClass = computed(() => {
  if (props.mutationFeedbackType === 'success') {
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }
  if (props.mutationFeedbackType === 'error') {
    return 'text-rose-700 bg-rose-50 border-rose-200';
  }
  return 'text-transparent border-transparent';
});

function onSubmit(event) {
  event.preventDefault();
  emit('submit');
}
</script>

<template>
  <form class="mb-6 space-y-4 border-b border-slate-200 pb-6" @submit="onSubmit">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">Gestionar usuarios</h3>
        <p class="text-sm text-slate-600">
          Crea un usuario nuevo o edita uno existente desde el mismo formulario.
        </p>
      </div>
      <p v-if="formModeMessage" class="text-sm font-medium text-indigo-700">
        {{ formModeMessage }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Nombre</span>
        <input
          id="user-name-input"
          type="text"
          name="name"
          :value="name"
          required
          autocomplete="name"
          :disabled="isFormBusy"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
          @input="emit('update:name', $event.target.value)"
        />
      </label>

      <label class="block text-sm">
        <span class="mb-1 block font-medium text-slate-700">Email</span>
        <input
          id="user-email-input"
          type="email"
          name="email"
          :value="email"
          required
          autocomplete="email"
          :disabled="isFormBusy"
          class="w-full rounded-lg border px-3 py-2 text-slate-900 disabled:bg-slate-100"
          :class="emailFieldError ? 'border-rose-500' : 'border-slate-300'"
          @input="emit('update:email', $event.target.value)"
        />
        <span v-if="emailFieldError" class="mt-1 block text-xs text-rose-600">
          {{ emailFieldError }}
        </span>
      </label>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        id="user-submit-button"
        type="submit"
        :disabled="isFormBusy"
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ submitLabel }}
      </button>
      <button
        v-if="showCancel"
        id="cancel-edit-button"
        type="button"
        :disabled="isFormBusy"
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        @click="emit('cancel')"
      >
        Cancelar edición
      </button>
    </div>

    <p
      v-if="mutationFeedback"
      class="rounded-lg border px-3 py-2 text-sm"
      :class="feedbackClass"
      aria-live="polite"
    >
      {{ mutationFeedback }}
    </p>
  </form>
</template>
