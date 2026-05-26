const API_BASE_URL = 'http://localhost:3100';
let currentUsers = [];
let editingUserId = null;

const elements = {
  apiBaseUrl: document.getElementById('api-base-url'),
  reloadButton: document.getElementById('reload-button'),
  statusDot: document.getElementById('status-dot'),
  connectionValue: document.getElementById('connection-value'),
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

elements.apiBaseUrl.textContent = API_BASE_URL;
elements.reloadButton.addEventListener('click', loadDashboardData);
elements.userForm.addEventListener('submit', handleUserFormSubmit);
elements.cancelEditButton.addEventListener('click', resetUserForm);
elements.usersTableBody.addEventListener('click', handleUsersTableClick);

loadDashboardData();

async function loadDashboardData() {
  setLoadingState(true);
  hideError();

  try {
    const [health, apiInfo, users] = await Promise.all([
      fetchJson('/health'),
      fetchJson('/'),
      fetchJson('/users')
    ]);

    renderHealth(health);
    renderApiInfo(apiInfo);
    renderUsers(users);
    setOnlineState();
  } catch (error) {
    clearDashboardData();
    setOfflineState();
    showError(error);
  } finally {
    setLoadingState(false);
  }
}

async function fetchJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`La petición a ${url} ha fallado con estado HTTP ${response.status}.`);
  }

  return response.json();
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
    showMutationFeedback(getMutationErrorMessage(error), 'error');
  } finally {
    setUserFormLoading(false);
  }
}

function clearDashboardData() {
  elements.healthStatus.textContent = '-';
  elements.healthTimestamp.textContent = '-';
  elements.apiMessage.textContent = '-';
  elements.apiVersion.textContent = '-';
  elements.endpointList.replaceChildren();
  elements.usersTableBody.innerHTML = '<tr><td colspan="4">No se han podido cargar usuarios.</td></tr>';
}

function setLoadingState(isLoading) {
  elements.reloadButton.disabled = isLoading;
  elements.reloadButton.textContent = isLoading ? 'Cargando...' : 'Recargar datos';
}

function setOnlineState() {
  elements.statusDot.classList.remove('is-offline');
  elements.statusDot.classList.add('is-online');
  elements.connectionValue.textContent = 'API conectada';
}

function setOfflineState() {
  elements.statusDot.classList.remove('is-online');
  elements.statusDot.classList.add('is-offline');
  elements.connectionValue.textContent = 'API no disponible';
}

function showError(error) {
  elements.errorMessage.textContent = `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`;
  elements.errorBox.hidden = false;
}

function hideError() {
  elements.errorBox.hidden = true;
  elements.errorMessage.textContent = '';
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
  return `No se ha podido completar la operación. Revisa la API y vuelve a intentarlo. ${error.message}`;
}
