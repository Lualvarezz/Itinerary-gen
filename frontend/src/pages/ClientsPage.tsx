import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Client = {
  id: number;
  fullName: string;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  nationality: string;
  numberOfPeople: number;
};

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    documentNumber: '',
    email: '',
    phone: '',
    nationality: '',
    numberOfPeople: 1,
    observations: '',
  });

  const loadClients = async () => {
    const { data } = await api.get('/v1/clients');
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const resetForm = () => {
    setEditingClientId(null);
    setForm({
      fullName: '',
      documentNumber: '',
      email: '',
      phone: '',
      nationality: '',
      numberOfPeople: 1,
      observations: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClientId(client.id);
    setForm({
      fullName: client.fullName,
      documentNumber: client.documentNumber,
      email: client.email || '',
      phone: client.phone || '',
      nationality: client.nationality || '',
      numberOfPeople: client.numberOfPeople || 1,
      observations: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      if (editingClientId) {
        await api.patch(`/v1/clients/${editingClientId}`, form);
        setMessage('Cliente actualizado correctamente.');
      } else {
        await api.post('/v1/clients', form);
        setMessage('Cliente creado correctamente.');
      }
      resetForm();
      setIsModalOpen(false);
      await loadClients();
    } catch {
      setMessage(editingClientId ? 'No se pudo actualizar el cliente.' : 'No se pudo crear el cliente.');
    }
  };

  const filteredClients = clients.filter((client) => {
    const query = search.toLowerCase();
    return [client.fullName, client.documentNumber, client.email, client.phone]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clientes</h1>
        <p className="mt-1 text-sm text-slate-500">Registro y búsqueda rápida de clientes.</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Listado de clientes</h2>
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                placeholder="Buscar por nombre o documento..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                className="rounded-xl bg-[#4361EE] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]"
                onClick={openCreateModal}
              >
                + Agregar cliente
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Documento</th>
                  <th className="p-3.5">Correo</th>
                  <th className="p-3.5">Teléfono</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">No se encontraron clientes registrados.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-semibold text-slate-900">{client.fullName}</td>
                      <td className="p-3.5 text-slate-600">{client.documentNumber}</td>
                      <td className="p-3.5 text-slate-600">{client.email || '—'}</td>
                      <td className="p-3.5 text-slate-600">{client.phone || '—'}</td>
                      <td className="p-3.5 text-right">
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
                          onClick={() => openEditModal(client)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">{editingClientId ? 'Editar cliente' : 'Agregar cliente'}</h3>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {message ? <p className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-700">{message}</p> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre completo *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="Ej: María López"
                      value={form.fullName}
                      onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Número de documento *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="Ej: 1045123456"
                      value={form.documentNumber}
                      onChange={(event) => setForm({ ...form, documentNumber: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Correo electrónico</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Teléfono</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="+57 300 000 0000"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nacionalidad *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="Ej: Colombiana"
                      value={form.nationality}
                      onChange={(event) => setForm({ ...form, nationality: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Número de personas *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      type="number"
                      min="1"
                      placeholder="Número de personas"
                      value={form.numberOfPeople}
                      onChange={(event) => setForm({ ...form, numberOfPeople: Number(event.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Observaciones</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                    placeholder="Preferencias de viaje, restricciones, requerimientos especiales..."
                    rows={3}
                    value={form.observations}
                    onChange={(event) => setForm({ ...form, observations: event.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-xl bg-[#4361EE] px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]">
                    {editingClientId ? 'Guardar cambios' : 'Guardar cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClientsPage;
