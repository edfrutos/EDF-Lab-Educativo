export default function ConnectionStatus({ isOnline, connectionText }) {
  const dotClass = isOnline
    ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]'
    : 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Estado de conexión
        </p>
        <p className="text-sm font-semibold text-slate-900">{connectionText}</p>
      </div>
    </div>
  );
}
