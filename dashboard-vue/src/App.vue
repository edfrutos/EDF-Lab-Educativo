<script setup>
import { computed, onMounted, ref } from 'vue';
import { API_BASE_URL, fetchJson, login, logout } from './api.js';
import ApiInfoCard from './components/ApiInfoCard.vue';
import ConnectionStatus from './components/ConnectionStatus.vue';
import HealthCard from './components/HealthCard.vue';
import LoginGate from './components/LoginGate.vue';
import UserForm from './components/UserForm.vue';
import UsersTable from './components/UsersTable.vue';

const AUTH_FALLBACK = 'Inicia sesión para ver y gestionar usuarios.';

function getMutationErrorMessage(error) {
  return `No se ha podido completar la operación. Revisa la API y vuelve a intentarlo. ${error.message}`;
}

function getAuthMessage(error) {
  return error?.message || AUTH_FALLBACK;
}

const isAuthenticated = ref(false);
const isBootstrapping = ref(true);
const loginError = ref('');
const isLoginSubmitting = ref(false);

const users = ref([]);
const healthStatus = ref('-');
const healthTimestamp = ref('-');
const apiMessage = ref('-');
const apiVersion = ref('-');
const endpoints = ref([]);
const isOnline = ref(false);
const connectionText = ref('Comprobando API...');
const isLoading = ref(true);
const loadError = ref('');

const editingUserId = ref(null);
const name = ref('');
const email = ref('');
const formModeMessage = ref('');
const isFormBusy = ref(false);
const mutationFeedback = ref('');
const mutationFeedbackType = ref('');
const emailFieldError = ref('');

const submitLabel = computed(() => {
  if (isFormBusy.value) {
    return 'Guardando...';
  }
  return editingUserId.value === null ? 'Crear usuario' : 'Guardar cambios';
});

function clearDashboardData() {
  healthStatus.value = '-';
  healthTimestamp.value = '-';
  apiMessage.value = '-';
  apiVersion.value = '-';
  endpoints.value = [];
  users.value = [];
}

function returnToLoginGate(message) {
  clearDashboardData();
  isAuthenticated.value = false;
  loadError.value = '';
  loginError.value = message;
}

async function loadDashboardData() {
  isLoading.value = true;
  loadError.value = '';

  try {
    const [health, apiInfo, usersResponse] = await Promise.all([
      fetchJson('/health'),
      fetchJson('/'),
      fetchJson('/users')
    ]);

    healthStatus.value = health.status ?? '-';
    healthTimestamp.value = health.timestamp ?? '-';
    apiMessage.value = apiInfo.message ?? '-';
    apiVersion.value = apiInfo.version ?? '-';
    endpoints.value = apiInfo.endpoints ?? [];
    users.value = Array.isArray(usersResponse) ? usersResponse : [];
    isOnline.value = true;
    connectionText.value = 'API conectada';
  } catch (error) {
    if (error.status === 401) {
      returnToLoginGate(getAuthMessage(error));
      return;
    }

    clearDashboardData();
    isOnline.value = false;
    connectionText.value = 'API no disponible';
    loadError.value = `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`;
  } finally {
    isLoading.value = false;
  }
}

async function bootstrapAuth() {
  isBootstrapping.value = true;
  loginError.value = '';
  loadError.value = '';

  try {
    await fetchJson('/health');
    isOnline.value = true;
    connectionText.value = 'API conectada';
  } catch (error) {
    clearDashboardData();
    isOnline.value = false;
    connectionText.value = 'API no disponible';
    loadError.value = `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`;
    isAuthenticated.value = false;
    isBootstrapping.value = false;
    return;
  }

  try {
    await fetchJson('/users');
    isAuthenticated.value = true;
    await loadDashboardData();
  } catch (error) {
    isAuthenticated.value = false;
    if (error.status === 401) {
      loginError.value = '';
    } else {
      loginError.value = error.message || 'No se ha podido comprobar la sesión.';
    }
  } finally {
    isBootstrapping.value = false;
  }
}

async function handleLogin(loginEmail, loginPassword) {
  isLoginSubmitting.value = true;
  loginError.value = '';

  try {
    await login(loginEmail, loginPassword);
    isAuthenticated.value = true;
    loginError.value = '';
    await loadDashboardData();
  } catch (error) {
    if (error.status === 403) {
      loginError.value = error.message || 'Credenciales inválidas';
    } else {
      loginError.value = error.message || 'No se ha podido iniciar sesión.';
    }
  } finally {
    isLoginSubmitting.value = false;
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch {
    // Return to gate even if logout request fails.
  }

  clearDashboardData();
  resetUserForm();
  loginError.value = '';
  loadError.value = '';
  isAuthenticated.value = false;
}

function clearMutationFeedback() {
  mutationFeedback.value = '';
  mutationFeedbackType.value = '';
}

function resetUserForm() {
  editingUserId.value = null;
  name.value = '';
  email.value = '';
  formModeMessage.value = '';
  emailFieldError.value = '';
  clearMutationFeedback();
}

function showMutationFeedback(message, type) {
  mutationFeedback.value = message;
  mutationFeedbackType.value = type;
}

function handleMutationError(error) {
  if (error.status === 401) {
    resetUserForm();
    returnToLoginGate(getAuthMessage(error));
    return;
  }

  showMutationFeedback(getMutationErrorMessage(error), 'error');
  if (error.status === 409) {
    emailFieldError.value = error.message;
  }
}

function startEditingUser(user) {
  editingUserId.value = user.id;
  name.value = user.name;
  email.value = user.email;
  formModeMessage.value = `Editando usuario ${user.id}`;
  emailFieldError.value = '';
  clearMutationFeedback();
}

async function handleUserFormSubmit() {
  const trimmedName = name.value.trim();
  const trimmedEmail = email.value.trim();

  isFormBusy.value = true;
  clearMutationFeedback();
  emailFieldError.value = '';

  try {
    const isEditing = editingUserId.value !== null;

    if (isEditing) {
      await fetchJson(`/users/${editingUserId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail })
      });
      resetUserForm();
      showMutationFeedback('PUT /users/:id -> usuario actualizado', 'success');
    } else {
      await fetchJson('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail })
      });
      resetUserForm();
      showMutationFeedback('POST /users -> usuario creado', 'success');
    }

    await loadDashboardData();
  } catch (error) {
    handleMutationError(error);
  } finally {
    isFormBusy.value = false;
  }
}

async function handleDeleteUser(userId) {
  const shouldDelete = window.confirm('¿Seguro que quieres eliminar este usuario?');

  if (!shouldDelete) {
    return;
  }

  isFormBusy.value = true;
  clearMutationFeedback();
  emailFieldError.value = '';

  try {
    await fetchJson(`/users/${userId}`, { method: 'DELETE' });
    resetUserForm();
    showMutationFeedback('DELETE /users/:id -> usuario eliminado', 'success');
    await loadDashboardData();
  } catch (error) {
    handleMutationError(error);
  } finally {
    isFormBusy.value = false;
  }
}

function handleEditUser(user) {
  const found = users.value.find((candidate) => candidate.id === user.id);
  if (!found) {
    showMutationFeedback('No se ha podido encontrar el usuario seleccionado.', 'error');
    return;
  }
  startEditingUser(found);
}

function handleEmailUpdate(value) {
  email.value = value;
  if (emailFieldError.value) {
    emailFieldError.value = '';
  }
}

onMounted(() => {
  bootstrapAuth();
});
</script>

<template>
  <main v-if="isBootstrapping" class="mx-auto max-w-5xl px-4 py-16 text-center">
    <p class="text-sm text-slate-600">Comprobando sesión…</p>
  </main>

  <main v-else-if="!isAuthenticated" class="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <LoginGate
      :error="loginError"
      :is-submitting="isLoginSubmitting"
      @login="handleLogin"
    />

    <section
      v-if="loadError"
      class="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900"
    >
      <h2 class="text-lg font-semibold">No se ha podido conectar con la API</h2>
      <p class="mt-2 text-sm">{{ loadError }}</p>
      <p class="mt-4 text-sm">Asegúrate de arrancar el backend con:</p>
      <pre class="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"><code>cd api
PORT=3100 npm start</code></pre>
    </section>
  </main>

  <main v-else id="dashboard-panel" class="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <section class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div class="max-w-2xl">
        <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Frontend externo independiente
        </p>
        <h1 class="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Panel de usuarios conectado a una API Express
        </h1>
        <p class="mt-3 text-slate-600">
          Esta página consume los endpoints de la carpeta <strong>api</strong> para demostrar
          cómo un frontend real obtiene datos JSON desde un backend Node.js.
        </p>
        <p class="mt-2 text-sm text-indigo-700">
          Variante Vue (Vite) — comparación con vanilla en
          <code class="rounded bg-indigo-50 px-1">:5173</code> y React en
          <code class="rounded bg-indigo-50 px-1">:5174</code>.
        </p>
      </div>
      <ConnectionStatus :is-online="isOnline" :connection-text="connectionText" />
    </section>

    <section
      class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">API base</p>
        <code class="text-sm text-slate-800">{{ API_BASE_URL }}</code>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
        <button
          type="button"
          :disabled="isLoading"
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          @click="loadDashboardData"
        >
          {{ isLoading ? 'Cargando...' : 'Recargar datos' }}
        </button>
      </div>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <HealthCard :health-status="healthStatus" :health-timestamp="healthTimestamp" />
      <ApiInfoCard
        :api-message="apiMessage"
        :api-version="apiVersion"
        :endpoints="endpoints"
      />
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Endpoint</p>
          <h2 class="text-lg font-semibold text-slate-900">GET /users</h2>
        </div>
        <p class="text-sm text-slate-600">
          Datos recibidos desde Express y ordenados por nombre en el backend.
        </p>
      </header>

      <UserForm
        :name="name"
        :email="email"
        :form-mode-message="formModeMessage"
        :submit-label="submitLabel"
        :show-cancel="editingUserId !== null"
        :mutation-feedback="mutationFeedback"
        :mutation-feedback-type="mutationFeedbackType"
        :email-field-error="emailFieldError"
        :is-form-busy="isFormBusy"
        @update:name="name = $event"
        @update:email="handleEmailUpdate"
        @submit="handleUserFormSubmit"
        @cancel="resetUserForm"
      />

      <p v-if="isLoading && users.length === 0" class="text-center text-sm text-slate-500">
        Cargando usuarios...
      </p>
      <UsersTable
        v-else
        :users="users"
        :is-form-busy="isFormBusy"
        @edit="handleEditUser"
        @delete="handleDeleteUser"
      />
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold text-slate-900">Qué demuestra este proyecto</h2>
      <ol class="list-decimal space-y-2 pl-5 text-sm text-slate-700">
        <li>El backend Express expone datos JSON mediante endpoints HTTP.</li>
        <li>
          Este frontend independiente llama a esos endpoints con
          <code class="rounded bg-slate-100 px-1">fetch()</code> y cookie de sesión.
        </li>
        <li>
          Los datos recibidos se transforman en interfaz visual: estado, versión y tabla de
          usuarios.
        </li>
        <li>Si apagas la API, el panel muestra un error de conexión.</li>
      </ol>
    </section>

    <section
      v-if="loadError"
      class="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900"
    >
      <h2 class="text-lg font-semibold">No se ha podido conectar con la API</h2>
      <p class="mt-2 text-sm">{{ loadError }}</p>
      <p class="mt-4 text-sm">Asegúrate de arrancar el backend con:</p>
      <pre class="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"><code>cd api
PORT=3100 npm start</code></pre>
    </section>
  </main>
</template>
