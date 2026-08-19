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
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Clientes</h1>
        <p className="mt-2 text-slate-400">Registro y búsqueda rápida de clientes.</p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Listado de clientes</h2>
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                placeholder="Buscar por nombre o documento"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white" onClick={openCreateModal}>Agregar cliente</button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full text-sm">
            <thead className="bg-slate-800 text-left text-slate-300">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Documento</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400">No se encontraron clientes.</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-slate-800">
                    <td className="p-3">{client.fullName}</td>
                    <td className="p-3">{client.documentNumber}</td>
                    <td className="p-3">{client.email}</td>
                    <td className="p-3">{client.phone}</td>
                    <td className="p-3 text-right">
                      <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200" onClick={() => openEditModal(client)}>Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{editingClientId ? 'Editar cliente' : 'Agregar cliente'}</h3>
                <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300" onClick={() => setIsModalOpen(false)}>Cerrar</button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Nombre completo" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Documento" value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} required />
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Correo" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Teléfono" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Nacionalidad" value={form.nationality} onChange={(event) => setForm({ ...form, nationality: event.target.value })} required />
                  <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="1" value={form.numberOfPeople} onChange={(event) => setForm({ ...form, numberOfPeople: Number(event.target.value) })} />
                </div>
                <textarea className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Observaciones" value={form.observations} onChange={(event) => setForm({ ...form, observations: event.target.value })} />
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Guardar cliente</button>
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
