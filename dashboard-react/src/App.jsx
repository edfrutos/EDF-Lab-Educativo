import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL, fetchJson, login, logout } from './api.js';
import ApiInfoCard from './components/ApiInfoCard.jsx';
import ConnectionStatus from './components/ConnectionStatus.jsx';
import HealthCard from './components/HealthCard.jsx';
import LoginGate from './components/LoginGate.jsx';
import UserForm from './components/UserForm.jsx';
import UsersTable from './components/UsersTable.jsx';

const AUTH_FALLBACK = 'Inicia sesión para ver y gestionar usuarios.';

function getMutationErrorMessage(error) {
  return `No se ha podido completar la operación. Revisa la API y vuelve a intentarlo. ${error.message}`;
}

function getAuthMessage(error) {
  return error?.message || AUTH_FALLBACK;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const [users, setUsers] = useState([]);
  const [healthStatus, setHealthStatus] = useState('-');
  const [healthTimestamp, setHealthTimestamp] = useState('-');
  const [apiMessage, setApiMessage] = useState('-');
  const [apiVersion, setApiVersion] = useState('-');
  const [endpoints, setEndpoints] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [connectionText, setConnectionText] = useState('Comprobando API...');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formModeMessage, setFormModeMessage] = useState('');
  const [isFormBusy, setIsFormBusy] = useState(false);
  const [mutationFeedback, setMutationFeedback] = useState('');
  const [mutationFeedbackType, setMutationFeedbackType] = useState('');
  const [emailFieldError, setEmailFieldError] = useState('');

  const clearDashboardData = useCallback(() => {
    setHealthStatus('-');
    setHealthTimestamp('-');
    setApiMessage('-');
    setApiVersion('-');
    setEndpoints([]);
    setUsers([]);
  }, []);

  const returnToLoginGate = useCallback(
    (message) => {
      clearDashboardData();
      setIsAuthenticated(false);
      setLoadError('');
      setLoginError(message);
    },
    [clearDashboardData]
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [health, apiInfo, usersResponse] = await Promise.all([
        fetchJson('/health'),
        fetchJson('/'),
        fetchJson('/users')
      ]);

      setHealthStatus(health.status ?? '-');
      setHealthTimestamp(health.timestamp ?? '-');
      setApiMessage(apiInfo.message ?? '-');
      setApiVersion(apiInfo.version ?? '-');
      setEndpoints(apiInfo.endpoints ?? []);
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);
      setIsOnline(true);
      setConnectionText('API conectada');
    } catch (error) {
      if (error.status === 401) {
        returnToLoginGate(getAuthMessage(error));
        return;
      }

      clearDashboardData();
      setIsOnline(false);
      setConnectionText('API no disponible');
      setLoadError(
        `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [clearDashboardData, returnToLoginGate]);

  const bootstrapAuth = useCallback(async () => {
    setIsBootstrapping(true);
    setLoginError('');
    setLoadError('');

    try {
      await fetchJson('/health');
      setIsOnline(true);
      setConnectionText('API conectada');
    } catch (error) {
      clearDashboardData();
      setIsOnline(false);
      setConnectionText('API no disponible');
      setLoadError(
        `${error.message} Comprueba que el backend está arrancado y que CORS está habilitado.`
      );
      setIsAuthenticated(false);
      setIsBootstrapping(false);
      return;
    }

    try {
      await fetchJson('/users');
      setIsAuthenticated(true);
      await loadDashboardData();
    } catch (error) {
      setIsAuthenticated(false);
      if (error.status === 401) {
        setLoginError('');
      } else {
        setLoginError(error.message || 'No se ha podido comprobar la sesión.');
      }
    } finally {
      setIsBootstrapping(false);
    }
  }, [clearDashboardData, loadDashboardData]);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  const clearMutationFeedback = () => {
    setMutationFeedback('');
    setMutationFeedbackType('');
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setFormModeMessage('');
    setEmailFieldError('');
    clearMutationFeedback();
  };

  const showMutationFeedback = (message, type) => {
    setMutationFeedback(message);
    setMutationFeedbackType(type);
  };

  const handleMutationError = (error) => {
    if (error.status === 401) {
      resetUserForm();
      returnToLoginGate(getAuthMessage(error));
      return;
    }

    showMutationFeedback(getMutationErrorMessage(error), 'error');
    if (error.status === 409) {
      setEmailFieldError(error.message);
    }
  };

  const handleLogin = async (loginEmail, loginPassword) => {
    setIsLoginSubmitting(true);
    setLoginError('');

    try {
      await login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      setLoginError('');
      await loadDashboardData();
    } catch (error) {
      if (error.status === 403) {
        setLoginError(error.message || 'Credenciales inválidas');
      } else {
        setLoginError(error.message || 'No se ha podido iniciar sesión.');
      }
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Return to gate even if logout request fails.
    }

    clearDashboardData();
    resetUserForm();
    setLoginError('');
    setLoadError('');
    setIsAuthenticated(false);
  };

  const startEditingUser = (user) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setFormModeMessage(`Editando usuario ${user.id}`);
    setEmailFieldError('');
    clearMutationFeedback();
  };

  const handleUserFormSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    setIsFormBusy(true);
    clearMutationFeedback();
    setEmailFieldError('');

    try {
      const isEditing = editingUserId !== null;

      if (isEditing) {
        await fetchJson(`/users/${editingUserId}`, {
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
      setIsFormBusy(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este usuario?');

    if (!shouldDelete) {
      return;
    }

    setIsFormBusy(true);
    clearMutationFeedback();
    setEmailFieldError('');

    try {
      await fetchJson(`/users/${userId}`, { method: 'DELETE' });
      resetUserForm();
      showMutationFeedback('DELETE /users/:id -> usuario eliminado', 'success');
      await loadDashboardData();
    } catch (error) {
      handleMutationError(error);
    } finally {
      setIsFormBusy(false);
    }
  };

  const handleEditUser = (user) => {
    const found = users.find((candidate) => candidate.id === user.id);
    if (!found) {
      showMutationFeedback('No se ha podido encontrar el usuario seleccionado.', 'error');
      return;
    }
    startEditingUser(found);
  };

  const submitLabel = isFormBusy
    ? 'Guardando...'
    : editingUserId === null
      ? 'Crear usuario'
      : 'Guardar cambios';

  if (isBootstrapping) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <p className="text-sm text-slate-600">Comprobando sesión…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <LoginGate
          onLogin={handleLogin}
          error={loginError}
          isSubmitting={isLoginSubmitting}
        />

        {loadError ? (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <h2 className="text-lg font-semibold">No se ha podido conectar con la API</h2>
            <p className="mt-2 text-sm">{loadError}</p>
            <p className="mt-4 text-sm">Asegúrate de arrancar el backend con:</p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
              <code>{`cd api\nPORT=3100 npm start`}</code>
            </pre>
          </section>
        ) : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Frontend externo independiente
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Panel de usuarios conectado a una API Express
          </h1>
          <p className="mt-3 text-slate-600">
            Esta página consume los endpoints de la carpeta <strong>api</strong> para
            demostrar cómo un frontend real obtiene datos JSON desde un backend Node.js.
          </p>
          <p className="mt-2 text-sm text-indigo-700">
            Variante React (Vite) — comparación con el dashboard vanilla en{' '}
            <code className="rounded bg-indigo-50 px-1">:5173</code>.
          </p>
        </div>
        <ConnectionStatus isOnline={isOnline} connectionText={connectionText} />
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            API base
          </p>
          <code className="text-sm text-slate-800">{API_BASE_URL}</code>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : 'Recargar datos'}
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <HealthCard healthStatus={healthStatus} healthTimestamp={healthTimestamp} />
        <ApiInfoCard
          apiMessage={apiMessage}
          apiVersion={apiVersion}
          endpoints={endpoints}
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Endpoint
            </p>
            <h2 className="text-lg font-semibold text-slate-900">GET /users</h2>
          </div>
          <p className="text-sm text-slate-600">
            Datos recibidos desde Express y ordenados por nombre en el backend.
          </p>
        </header>

        <UserForm
          name={name}
          email={email}
          formModeMessage={formModeMessage}
          submitLabel={submitLabel}
          showCancel={editingUserId !== null}
          mutationFeedback={mutationFeedback}
          mutationFeedbackType={mutationFeedbackType}
          emailFieldError={emailFieldError}
          isFormBusy={isFormBusy}
          onNameChange={setName}
          onEmailChange={(value) => {
            setEmail(value);
            if (emailFieldError) {
              setEmailFieldError('');
            }
          }}
          onSubmit={handleUserFormSubmit}
          onCancel={resetUserForm}
        />

        {isLoading && users.length === 0 ? (
          <p className="text-center text-sm text-slate-500">Cargando usuarios...</p>
        ) : (
          <UsersTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            isFormBusy={isFormBusy}
          />
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Qué demuestra este proyecto
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>El backend Express expone datos JSON mediante endpoints HTTP.</li>
          <li>
            Este frontend independiente llama a esos endpoints con{' '}
            <code className="rounded bg-slate-100 px-1">fetch()</code> y cookie de sesión.
          </li>
          <li>
            Los datos recibidos se transforman en interfaz visual: estado, versión y tabla de
            usuarios.
          </li>
          <li>Si apagas la API, el panel muestra un error de conexión.</li>
        </ol>
      </section>

      {loadError ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <h2 className="text-lg font-semibold">No se ha podido conectar con la API</h2>
          <p className="mt-2 text-sm">{loadError}</p>
          <p className="mt-4 text-sm">Asegúrate de arrancar el backend con:</p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
            <code>{`cd api\nPORT=3100 npm start`}</code>
          </pre>
        </section>
      ) : null}
    </main>
  );
}
