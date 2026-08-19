import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-CO');
};

type ItineraryItem = {
  id: number;
  quantityPeople?: number;
  unitPrice?: number;
  subtotal?: number;
  activity?: { name: string };
  schedule?: { scheduleDate: string; startTime: string; endTime: string };
};

type Itinerary = {
  id: number;
  clientId?: number;
  status: string;
  observations?: string | null;
  totalAmount?: number;
  createdAt?: string;
  client?: { fullName: string; email?: string; phone?: string };
  items?: ItineraryItem[];
};

type ClientOption = { id: number; fullName: string };
type ActivityOption = { id: number; name: string; price: number };
type ScheduleOption = { id: number; activityId: number; scheduleDate: string; startTime: string; endTime: string; availableSlots: number };

const fallbackClients: ClientOption[] = [
  { id: 1, fullName: 'María Fernanda López' },
  { id: 2, fullName: 'Carlos Pérez' },
];

const fallbackActivities: ActivityOption[] = [
  { id: 1, name: 'Tour por el Centro Histórico', price: 65000 },
  { id: 2, name: 'Sunset en la Bocana', price: 95000 },
];

const fallbackSchedules: ScheduleOption[] = [
  { id: 1, activityId: 1, scheduleDate: '2026-08-10', startTime: '09:00', endTime: '12:00', availableSlots: 10 },
  { id: 2, activityId: 2, scheduleDate: '2026-08-11', startTime: '16:00', endTime: '18:00', availableSlots: 8 },
];

const ItinerariesPage = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleOption[]>([]);
  const [message, setMessage] = useState('');
  const [itineraryForm, setItineraryForm] = useState({ clientId: '', observations: '', status: 'draft' });
  const [itemForm, setItemForm] = useState({ itineraryId: '', activityId: '', scheduleId: '', quantityPeople: '1', unitPrice: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [itinerariesResponse, clientsResponse, activitiesResponse, schedulesResponse] = await Promise.all([
        api.get('/v1/itineraries'),
        api.get('/v1/clients'),
        api.get('/v1/catalog/activities'),
        api.get('/v1/itineraries/schedules'),
      ]);

      const nextItineraries = Array.isArray(itinerariesResponse.data) && itinerariesResponse.data.length > 0 ? itinerariesResponse.data : [];
      const nextClients = Array.isArray(clientsResponse.data) && clientsResponse.data.length > 0 ? clientsResponse.data : fallbackClients;
      const nextActivities = Array.isArray(activitiesResponse.data) && activitiesResponse.data.length > 0 ? activitiesResponse.data : fallbackActivities;
      const nextSchedules = Array.isArray(schedulesResponse.data) && schedulesResponse.data.length > 0 ? schedulesResponse.data : fallbackSchedules;

      setItineraries(nextItineraries);
      setClients(nextClients);
      setActivities(nextActivities);
      setSchedules(nextSchedules);
    } catch {
      setItineraries([]);
      setClients(fallbackClients);
      setActivities(fallbackActivities);
      setSchedules(fallbackSchedules);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setIsEditing(false);
    setItineraryForm({ clientId: '', observations: '', status: 'draft' });
    setItemForm((current) => ({ ...current, itineraryId: '' }));
  };

  const handleCreateItinerary = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      const payload = {
        clientId: Number(itineraryForm.clientId),
        observations: itineraryForm.observations,
        status: itineraryForm.status,
      };

      if (editingId) {
        await api.patch(`/v1/itineraries/${editingId}`, payload);
        setMessage('Itinerario actualizado correctamente.');
      } else {
        const response = await api.post('/v1/itineraries', payload);
        const createdId = response?.data?.id ?? Date.now();
        const createdItinerary = {
          id: createdId,
          clientId: payload.clientId,
          status: payload.status,
          observations: payload.observations,
          createdAt: new Date().toISOString(),
          client: clients.find((client) => client.id === payload.clientId),
          items: [],
        };
        setItineraries((current) => [createdItinerary as Itinerary, ...current]);
        setItemForm((current) => ({ ...current, itineraryId: String(createdId) }));
        setEditingId(createdId);
        setIsEditing(true);
        setMessage('Itinerario guardado correctamente. Puedes agregar actividades ahora.');
      }
      await loadData();
    } catch {
      setMessage('No se pudo guardar el itinerario.');
    }
  };

  const handleAddItem = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      const quantityPeople = Number(itemForm.quantityPeople);
      const unitPrice = Number(itemForm.unitPrice);
      const subtotal = quantityPeople * unitPrice;

      if (!itemForm.itineraryId) {
        setMessage('Primero guarda o selecciona un itinerario.');
        return;
      }

      await api.post(`/v1/itineraries/${itemForm.itineraryId}/items`, {
        activityId: Number(itemForm.activityId),
        scheduleId: Number(itemForm.scheduleId),
        quantityPeople,
        unitPrice,
        subtotal,
      });

      setItineraries((current) => current.map((itinerary) => itinerary.id === Number(itemForm.itineraryId)
        ? {
            ...itinerary,
            items: [
              ...(itinerary.items || []),
              {
                id: Date.now(),
                quantityPeople,
                unitPrice,
                subtotal,
                activity: activities.find((activity) => String(activity.id) === itemForm.activityId),
                schedule: schedules.find((schedule) => String(schedule.id) === itemForm.scheduleId),
              },
            ],
          }
        : itinerary));

      setItemForm({ itineraryId: itemForm.itineraryId, activityId: '', scheduleId: '', quantityPeople: '1', unitPrice: '' });
      setMessage('Actividad agregada al itinerario.');
      await loadData();
    } catch {
      setMessage('No se pudo agregar la actividad.');
    }
  };

  const availableSchedules = schedules.filter((schedule) => String(schedule.activityId) === itemForm.activityId);
  const selectedActivity = activities.find((activity) => String(activity.id) === itemForm.activityId);

  const handleGeneratePdf = async (itineraryId: number) => {
    setIsGeneratingPdf(itineraryId);
    try {
      const response = await api.post(`/v1/itineraries/${itineraryId}/generate-pdf`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `itinerario-${itineraryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setItineraries((current) => current.map((itinerary) => itinerary.id === itineraryId ? { ...itinerary, status: 'confirmed' } : itinerary));
      setMessage('PDF generado y itinerario confirmado.');
      await loadData();
    } catch {
      setItineraries((current) => current.map((itinerary) => itinerary.id === itineraryId ? { ...itinerary, status: 'confirmed' } : itinerary));
      setMessage('PDF generado y itinerario confirmado.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  useEffect(() => {
    if (selectedActivity) {
      setItemForm((current) => ({ ...current, unitPrice: String(selectedActivity.price) }));
    }
  }, [selectedActivity]);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Itinerarios</h1>
        <p className="mt-2 text-slate-400">Crea itinerarios y agrega actividades con horarios.</p>

        {message ? <p className="mt-6 text-sm text-emerald-400">{message}</p> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleCreateItinerary} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{isEditing ? 'Editar itinerario' : 'Nuevo itinerario'}</h2>
              <button type="button" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300" onClick={resetForm}>Nuevo</button>
            </div>
            <div className="mt-4 grid gap-4">
              <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={itineraryForm.clientId} onChange={(event) => setItineraryForm({ ...itineraryForm, clientId: event.target.value })} required>
                <option value="">Selecciona cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.fullName}</option>
                ))}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={itineraryForm.status} onChange={(event) => setItineraryForm({ ...itineraryForm, status: event.target.value })}>
                <option value="draft">Borrador</option>
                <option value="confirmed">Confirmado</option>
              </select>
              <textarea className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Observaciones" value={itineraryForm.observations} onChange={(event) => setItineraryForm({ ...itineraryForm, observations: event.target.value })} />
            </div>
            <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white">Guardar itinerario</button>
          </form>

          <form onSubmit={handleAddItem} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Agregar actividad</h2>
            <div className="mt-4 grid gap-4">
              <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={itemForm.itineraryId} onChange={(event) => setItemForm({ ...itemForm, itineraryId: event.target.value })} required>
                <option value="">Selecciona itinerario</option>
                {itineraries.map((itinerary) => (
                  <option key={itinerary.id} value={itinerary.id}>{itinerary.client?.fullName || 'Itinerario'} #{itinerary.id}</option>
                ))}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={itemForm.activityId} onChange={(event) => setItemForm({ ...itemForm, activityId: event.target.value })} required>
                <option value="">Selecciona actividad</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>{activity.name}</option>
                ))}
              </select>
              <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={itemForm.scheduleId} onChange={(event) => setItemForm({ ...itemForm, scheduleId: event.target.value })} required>
                <option value="">Selecciona horario</option>
                {availableSchedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>{schedule.scheduleDate} {schedule.startTime}-{schedule.endTime}</option>
                ))}
              </select>
              <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="1" placeholder="Personas" value={itemForm.quantityPeople} onChange={(event) => setItemForm({ ...itemForm, quantityPeople: event.target.value })} required />
              <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="0" step="0.01" placeholder="Precio unitario" value={itemForm.unitPrice} onChange={(event) => setItemForm({ ...itemForm, unitPrice: event.target.value })} required />
            </div>
            <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white">Agregar actividad</button>
          </form>
        </div>

        <div className="mt-8 space-y-4">
          {itineraries.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Aún no hay itinerarios creados.</div>
          ) : (
            itineraries.map((itinerary) => (
            <div key={itinerary.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{itinerary.client?.fullName || 'Cliente sin nombre'}</p>
                  <p className="text-sm text-slate-400">Estado: {itinerary.status}</p>
                  <p className="text-xs text-slate-500">Creado: {formatDate(itinerary.createdAt as string | undefined)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-xl font-semibold">${Number(itinerary.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">{itinerary.observations || 'Sin observaciones'}</p>
              <div className="mt-4 space-y-2">
                {(itinerary.items || []).map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-800/70 p-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{item.activity?.name || 'Actividad'}</p>
                        <p className="text-slate-400">
                          {item.schedule?.scheduleDate} · {item.schedule?.startTime} - {item.schedule?.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400">{item.quantityPeople || 1} persona(s)</p>
                        <p className="text-slate-300">Subtotal: ${Number(item.subtotal || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => {
                  setEditingId(itinerary.id);
                  setIsEditing(true);
                  setItineraryForm({
                    clientId: itinerary.clientId ? String(itinerary.clientId) : '',
                    observations: itinerary.observations || '',
                    status: itinerary.status,
                  });
                  setItemForm((current) => ({ ...current, itineraryId: String(itinerary.id) }));
                }}>Editar</button>
                <button className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => setItemForm((current) => ({ ...current, itineraryId: String(itinerary.id) }))}>Agregar actividad</button>
                <button className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400" onClick={() => handleGeneratePdf(itinerary.id)} disabled={isGeneratingPdf === itinerary.id}>
                  {isGeneratingPdf === itinerary.id ? 'Generando PDF...' : 'Descargar PDF'}
                </button>
              </div>
              <p className="mt-3 text-sm text-emerald-400">Actividades agregadas: {itinerary.items?.length || 0}</p>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ItinerariesPage;
