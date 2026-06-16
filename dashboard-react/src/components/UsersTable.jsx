export default function UsersTable({ users, onEdit, onDelete, isFormBusy }) {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">ID</th>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                No hay usuarios disponibles.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">ID</th>
            <th className="px-4 py-2 font-medium">Nombre</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody id="users-table-body" className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="bg-white">
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isFormBusy}
                    onClick={() => onEdit(user)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={isFormBusy}
                    onClick={() => onDelete(user.id)}
                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
