const API_BASE_URL = 'http://localhost:3100';
const TOKEN_STORAGE_KEY = 'edf_lab_token';

let currentUsers = [];
let editingUserId = null;

const elements = {
  apiBaseUrl: document.getElementById('api-base-url'),
  reloadButton: document.getElementById('reload-button'),
  logoutButton: document.getElementById('logout-button'),
  statusDot: document.getElementById('status-dot'),
  connectionValue: document.getElementById('connection-value'),
  loginSection: document.getElementById('login-section'),
  loginForm: document.getElementById('login-form'),
  loginUsernameInput: document.getElementById('login-username-input'),
  loginPasswordInput: document.getElementById('login-password-input'),
  loginSubmitButton: document.getElementById('login-submit-button'),
  loginFeedback: document.getElementById('login-feedback'),
  usersSection: document.getElementById('users-section'),
  healthStatus: document.getElementById('health-status'),
  healthTimestamp: document.getElementById('health-timestamp'),
  apiMessage: document.getElementById('api-message'),
  apiVersion: document.getElementById('api-version'),
  endpointList: document.getElementById('endpoint-list'),
  usersTableBody: document.getElementById('users-table-body'),
  userForm: document.getElementById('user-form'),
  userNameInput: document.getElementById('user-name-input'),
  userEmailInput: document.getElementById('user-email-input'),
  userSubmitButton: document.getElementById('user-submit-button'),
  cancelEditButton: document.getElementById('cancel-edit-button'),
  formModeMessage: document.getElementById('form-mode-message'),
  mutationFeedback: document.getElementById('mutation-feedback'),
  errorBox: document.getElementById('error-box'),
  errorMessage: document.getElementById('error-message')
};

class ApiError extends Error {
  constructor(message, status, body = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

elements.apiBaseUrl.textContent = API_BASE_URL;
elements.reloadButton.addEventListener('click', loadDashboardData);
elements.logoutButton.addEventListener('click', handleLogout);
elements.loginForm.addEventListener('submit', handleLoginSubmit);
elements.userForm.addEventListener('submit', handleUserFormSubmit);
elements.cancelEditButton.addEventListener('click', resetUserForm);
elements.usersTableBody.addEventListener('click', handleUsersTableClick);

loadDashboardData();

function getStoredToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

function setStoredToken(token) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function loadDashboardData() {
  setLoadingState(true);
  hideError();

  try {
    const [health, apiInfo] = await Promise.all([
      fetchJson('/health'),
      fetchJson('/')
    ]);

    renderHealth(health);
    renderApiInfo(apiInfo);

    try {
      const users = await fetchJson('/users');
      renderUsers(users);
      hideLoginPanel();
      setOnlineState();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearUsersSection();
        showLoginPanel('La API requiere autenticación. Inicia sesión para ver y gestionar usuarios.');
        setAuthRequiredState();
        return;
      }

      throw error;
    }
  } catch (error) {
    clearDashboardData();
    hideLoginPanel();
    setOfflineState();
    showError(error);
  } finally {
    setLoadingState(false);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const username = elements.loginUsernameInput.value.trim();
  const password = elements.loginPasswordInput.value;

  setLoginLoading(true);
  clearLoginFeedback();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const message =
        body?.error ??
        (response.status === 404
          ? 'La autenticación no está activada en la API.'
          : `El login ha fallado con estado HTTP ${response.status}.`);
      showLoginFeedback(message, 'error');
      return;
    }

    if (!body?.token) {
      showLoginFeedback('La API no devolvió un token válido.', 'error');
      return;
    }

    setStoredToken(body.token);
    elements.loginPasswordInput.value = '';
    showLoginFeedback('Sesión iniciada correctamente.', 'success');
    await loadDashboardData();
  } catch (error) {
    showLoginFeedback(
      'No se ha podido contactar con la API. Comprueba que el backend está arrancado.',
      'error'
    );
  } finally {
    setLoginLoading(false);
  }
}

function handleLogout() {
  clearStoredToken();
  resetUserForm();
  clearMutationFeedback();
  clearLoginFeedback();
  elements.loginUsernameInput.value = '';
  elements.loginPasswordInput.value = '';
  showLoginPanel('Has cerrado sesión. Vuelve a iniciar sesión para acceder a los usuarios.');
  setAuthRequiredState();
  clearUsersSection();
}

async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { ...(options.headers ?? {}) };

  if (!options.skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    if (response.status === 401 && !options.skipAuth) {
      clearStoredToken();
      const message = body?.error ?? 'Token inválido o caducado.';
      throw new ApiError(message, 401, body);
    }

    throw new ApiError(
      body?.error ?? `La petición a ${url} ha fallado con estado HTTP ${response.status}.`,
      response.status,
      body
    );
  }

  return body;
}

function renderHealth(health) {
  elements.healthStatus.textContent = health.status ?? '-';
  elements.healthTimestamp.textContent = health.timestamp ?? '-';
}

function renderApiInfo(apiInfo) {
  elements.apiMessage.textContent = apiInfo.message ?? '-';
  elements.apiVersion.textContent = apiInfo.version ?? '-';

  elements.endpointList.replaceChildren(
    ...(apiInfo.endpoints ?? []).map((endpoint) => {
      const item = document.createElement('li');
      item.textContent = endpoint;
      return item;
    })
  );
}

function renderUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    currentUsers = [];
    elements.usersTableBody.innerHTML = '<tr><td colspan="4">No hay usuarios disponibles.</td></tr>';
    return;
  }

  currentUsers = users;

  elements.usersTableBody.replaceChildren(
    ...users.map((user) => {
      const row = document.createElement('tr');

      const idCell = document.createElement('td');
      idCell.textContent = user.id;

      const nameCell = document.createElement('td');
      nameCell.textContent = user.name;

      const emailCell = document.createElement('td');
      emailCell.textContent = user.email;

      const actionsCell = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'row-action-button row-action-button--edit';
      editButton.dataset.action = 'edit';
      editButton.dataset.userId = user.id;
      editButton.textContent = 'Editar';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'row-action-button row-action-button--delete';
      deleteButton.dataset.action = 'delete';
      deleteButton.dataset.userId = user.id;
      deleteButton.textContent = 'Eliminar';

      actions.append(editButton, deleteButton);
      actionsCell.append(actions);

      row.append(idCell, nameCell, emailCell, actionsCell);
      return row;
    })
  );
}

async function handleUserFormSubmit(event) {
  event.preventDefault();

  const name = elements.userNameInput.value.trim();
  const email = elements.userEmailInput.value.trim();

  setUserFormLoading(true);
  clearMutationFeedback();

  try {
    const isEditing = editingUserId !== null;

    if (isEditing) {
      await fetchJson(`/users/${editingUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });
    } else {
      await fetchJson('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });
    }

    const successFeedback = isEditing
      ? 'PUT /users/:id -> usuario actualizado'
      : 'POST /users -> usuario creado';

    resetUserForm();
    showMutationFeedback(successFeedback, 'success');
    await loadDashboardData();
  } catch (error) {
    if (handleAuthFailure(error, 'No se ha podido guardar el usuario.')) {
      return;
    }

    showMutationFeedback(getMutationErrorMessage(error), 'error');
  } finally {
    setUserFormLoading(false);
  }
}

function handleUsersTableClick(event) {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const userId = Number.parseInt(button.dataset.userId, 10);
  const user = currentUsers.find((candidate) => candidate.id === userId);

  if (!user) {
    showMutationFeedback('No se ha podido encontrar el usuario seleccionado.', 'error');
    return;
  }

  if (button.dataset.action === 'edit') {
    startEditingUser(user);
  }

  if (button.dataset.action === 'delete') {
    deleteUser(user.id);
  }
}

function startEditingUser(user) {
  editingUserId = user.id;
  elements.userNameInput.value = user.name;
  elements.userEmailInput.value = user.email;
  elements.userSubmitButton.textContent = 'Guardar cambios';
  elements.cancelEditButton.textContent = 'Cancelar edición';
  elements.formModeMessage.textContent = `Editando usuario ${user.id}`;
  elements.cancelEditButton.hidden = false;
  clearMutationFeedback();
  elements.userNameInput.focus();
}

async function deleteUser(userId) {
  const shouldDelete = confirm('¿Seguro que quieres eliminar este usuario?');

  if (!shouldDelete) {
    return;
  }

  setUserFormLoading(true);
  clearMutationFeedback();

  try {
    await fetchJson(`/users/${userId}`, {
      method: 'DELETE'
    });

    resetUserForm();
    showMutationFeedback('DELETE /users/:id -> usuario eliminado', 'success');
    await loadDashboardData();
  } catch (error) {
    if (handleAuthFailure(error, 'No se ha podido eliminar el usuario.')) {
      return;
    }

    showMutationFeedback(getMutationErrorMessage(error), 'error');
  } finally {
    setUserFormLoading(false);
  }
}

function handleAuthFailure(error, prefix) {
  if (!(error instanceof ApiError) || error.status !== 401) {
    return false;
  }

  const message =
    error.message === 'Token no proporcionado.' || error.message === 'Token inválido o caducado.'
      ? 'Tu sesión ha expirado o no es válida. Vuelve a iniciar sesión.'
      : error.message;

  showLoginPanel(`${prefix} ${message}`);
  setAuthRequiredState();
  clearUsersSection();
  showMutationFeedback(message, 'error');
  return true;
}

function clearDashboardData() {
  elements.healthStatus.textContent = '-';
  elements.healthTimestamp.textContent = '-';
  elements.apiMessage.textContent = '-';
  elements.apiVersion.textContent = '-';
  elements.endpointList.replaceChildren();
  clearUsersSection();
}

function clearUsersSection() {
  currentUsers = [];
  elements.usersTableBody.innerHTML = '<tr><td colspan="4">Inicia sesión para cargar usuarios.</td></tr>';
}

function showLoginPanel(message = '') {
  elements.loginSection.hidden = false;
  elements.usersSection.hidden = true;
  elements.logoutButton.hidden = true;

  if (message) {
    showLoginFeedback(message, 'error');
  }
}

function hideLoginPanel() {
  elements.loginSection.hidden = true;
  elements.usersSection.hidden = false;
  elements.logoutButton.hidden = false;
  clearLoginFeedback();
}

function setLoadingState(isLoading) {
  elements.reloadButton.disabled = isLoading;
  elements.reloadButton.textContent = isLoading ? 'Cargando...' : 'Recargar datos';
  elements.logoutButton.disabled = isLoading;
}

function setLoginLoading(isLoading) {
  elements.loginSubmitButton.disabled = isLoading;
  elements.loginSubmitButton.textContent = isLoading ? 'Iniciando sesión...' : 'Iniciar sesión';
}

function setOnlineState() {
  elements.statusDot.classList.remove('is-offline', 'is-auth-required');
  elements.statusDot.classList.add('is-online');
  elements.connectionValue.textContent = 'API conectada';
}

function setAuthRequiredState() {
  elements.statusDot.classList.remove('is-online', 'is-offline');
  elements.statusDot.classList.add('is-auth-required');
  elements.connectionValue.textContent = 'API conectada — inicia sesión';
}

function setOfflineState() {
  elements.statusDot.classList.remove('is-online', 'is-auth-required');
  elements.statusDot.classList.add('is-offline');
  elements.connectionValue.textContent = 'API no disponible';
  elements.logoutButton.hidden = true;
}

function showError(error) {
  elements.errorMessage.textContent = `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`;
  elements.errorBox.hidden = false;
}

function hideError() {
  elements.errorBox.hidden = true;
  elements.errorMessage.textContent = '';
}

function showLoginFeedback(message, type) {
  elements.loginFeedback.textContent = message;
  elements.loginFeedback.className = `login-feedback is-${type}`;
}

function clearLoginFeedback() {
  elements.loginFeedback.textContent = '';
  elements.loginFeedback.className = 'login-feedback';
}

function resetUserForm() {
  elements.userForm.reset();
  editingUserId = null;
  elements.userSubmitButton.textContent = 'Crear usuario';
  elements.formModeMessage.textContent = '';
  elements.cancelEditButton.hidden = true;
}

function setUserFormLoading(isLoading) {
  elements.userSubmitButton.disabled = isLoading;
  elements.cancelEditButton.disabled = isLoading;

  if (isLoading) {
    elements.userSubmitButton.textContent = 'Guardando...';
    return;
  }

  elements.userSubmitButton.textContent = editingUserId === null ? 'Crear usuario' : 'Guardar cambios';
}

function showMutationFeedback(message, type) {
  elements.mutationFeedback.textContent = message;
  elements.mutationFeedback.className = `mutation-feedback is-${type}`;
}

function clearMutationFeedback() {
  elements.mutationFeedback.textContent = '';
  elements.mutationFeedback.className = 'mutation-feedback';
}

function getMutationErrorMessage(error) {
  if (error instanceof ApiError && error.body?.error) {
    return error.body.error;
  }

  return `No se ha podido completar la operación. Revisa la API y vuelve a intentarlo. ${error.message}`;
}
