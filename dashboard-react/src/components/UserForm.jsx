export default function UserForm({
  name,
  email,
  formModeMessage,
  submitLabel,
  showCancel,
  mutationFeedback,
  mutationFeedbackType,
  emailFieldError,
  isFormBusy,
  onNameChange,
  onEmailChange,
  onSubmit,
  onCancel
}) {
  const feedbackClass =
    mutationFeedbackType === 'success'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : mutationFeedbackType === 'error'
        ? 'text-rose-700 bg-rose-50 border-rose-200'
        : 'text-transparent border-transparent';

  return (
    <form onSubmit={onSubmit} className="mb-6 space-y-4 border-b border-slate-200 pb-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Gestionar usuarios</h3>
          <p className="text-sm text-slate-600">
            Crea un usuario nuevo o edita uno existente desde el mismo formulario.
          </p>
        </div>
        {formModeMessage ? (
          <p className="text-sm font-medium text-indigo-700">{formModeMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Nombre</span>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            required
            autoComplete="name"
            disabled={isFormBusy}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            autoComplete="email"
            disabled={isFormBusy}
            className={`w-full rounded-lg border px-3 py-2 text-slate-900 disabled:bg-slate-100 ${
              emailFieldError ? 'border-rose-500' : 'border-slate-300'
            }`}
          />
          {emailFieldError ? (
            <span className="mt-1 block text-xs text-rose-600">{emailFieldError}</span>
          ) : null}
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isFormBusy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {showCancel ? (
          <button
            type="button"
            disabled={isFormBusy}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar edición
          </button>
        ) : null}
      </div>

      {mutationFeedback ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${feedbackClass}`}
          aria-live="polite"
        >
          {mutationFeedback}
        </p>
      ) : null}
    </form>
  );
}
