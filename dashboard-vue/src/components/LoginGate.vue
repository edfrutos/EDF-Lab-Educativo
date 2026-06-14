<script setup>
import { ref } from 'vue';

defineProps({
  error: { type: String, default: '' },
  isSubmitting: { type: Boolean, default: false }
});

const emit = defineEmits(['login']);

const email = ref('');
const password = ref('');

function handleSubmit() {
  emit('login', email.value.trim(), password.value);
}
</script>

<template>
  <section
    class="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    aria-labelledby="login-gate-title"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
      Variante Vue (Vite) — puerto 5175
    </p>
    <h2 id="login-gate-title" class="mt-2 text-xl font-semibold text-slate-900">
      Iniciar sesión
    </h2>
    <p class="mt-2 text-sm text-slate-600">
      Introduce las credenciales del operador del lab para acceder al CRUD protegido de
      usuarios.
    </p>

    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="login-email" class="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="login-email"
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label for="login-password" class="block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <p v-if="error" class="text-sm text-rose-700" role="alert" aria-live="polite">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="mt-4 text-xs text-slate-500">
      Credenciales del lab: <strong>admin@lab.local</strong> / <strong>changeme</strong>
    </p>
  </section>
</template>
