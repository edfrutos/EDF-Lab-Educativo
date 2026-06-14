import { useState } from 'react';

export default function LoginGate({ onLogin, error = '', isSubmitting = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin(email.trim(), password);
  };

  return (
    <section
      className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="login-gate-title"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
        Variante React (Vite) — puerto 5174
      </p>
      <h2 id="login-gate-title" className="mt-2 text-xl font-semibold text-slate-900">
        Iniciar sesión
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Introduce las credenciales del operador del lab para acceder al CRUD protegido de
        usuarios.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {error ? (
          <p className="text-sm text-rose-700" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-xs text-slate-500">
        Credenciales del lab: <strong>admin@lab.local</strong> / <strong>changeme</strong>
      </p>
    </section>
  );
}
