export default function HealthCard({ healthStatus, healthTimestamp }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Endpoint
        </p>
        <h2 className="text-lg font-semibold text-slate-900">GET /health</h2>
      </header>
      <div className="mb-2 flex justify-between gap-4 text-sm">
        <span className="text-slate-600">Estado</span>
        <strong className="text-slate-900">{healthStatus}</strong>
      </div>
      <div className="mb-4 flex justify-between gap-4 text-sm">
        <span className="text-slate-600">Última comprobación</span>
        <strong className="text-right text-slate-900">{healthTimestamp}</strong>
      </div>
      <p className="text-sm text-slate-600">
        Este endpoint sirve para comprobar que el backend está vivo y respondiendo.
      </p>
    </article>
  );
}
