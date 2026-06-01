export default function ApiInfoCard({ apiMessage, apiVersion, endpoints }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Endpoint
        </p>
        <h2 className="text-lg font-semibold text-slate-900">GET /</h2>
      </header>
      <p className="mb-4 text-sm text-slate-800">{apiMessage}</p>
      <div className="mb-4 flex justify-between gap-4 text-sm">
        <span className="text-slate-600">Versión</span>
        <strong className="text-slate-900">{apiVersion}</strong>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Endpoints anunciados
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          {(endpoints ?? []).map((endpoint) => (
            <li key={endpoint}>{endpoint}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
