import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Schedule = {
  id: number;
  activityId: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSlots: number;
  status: string;
};

type Activity = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  category?: { id?: number; name: string };
  touristPlace?: { id?: number; name: string };
  categoryId?: number;
  touristPlaceId?: number;
  schedules?: Schedule[];
};

type Category = { id: number; name: string };
type TouristPlace = { id: number; name: string; city?: string; location?: string | null };

const formatTimeDisplay = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr.slice(0, 5);
};

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-CO');
};

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modales principales
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<number | null>(null);

  // Modal de horarios
  const [selectedActivityForSchedules, setSelectedActivityForSchedules] = useState<Activity | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  // Sub-modales para Categorías y Lugares
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [newPlaceForm, setNewPlaceForm] = useState({ name: '', city: 'Cartagena', location: '' });

  // Formulario de actividad
  const [activityForm, setActivityForm] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: '60',
    touristPlaceId: '',
    categoryId: '',
  });

  // Formulario de horario (Sin input de cupos manual)
  const [scheduleForm, setScheduleForm] = useState({
    scheduleDate: '',
    startTime: '',
    endTime: '',
    capacity: '10',
  });

  const loadData = async () => {
    try {
      const [activitiesResponse, categoriesResponse, placesResponse, schedulesResponse] = await Promise.all([
        api.get('/v1/catalog/activities'),
        api.get('/v1/catalog/categories'),
        api.get('/v1/catalog/tourist-places'),
        api.get('/v1/itineraries/schedules'),
      ]);

      let cats = categoriesResponse.data;
      let pls = placesResponse.data;

      // Seed por defecto si la base de datos está vacía para facilidad del operador
      if (cats.length === 0) {
        try {
          await api.post('/v1/catalog/categories', { name: 'Tours y Excursiones', description: 'Recorridos guiados' });
          await api.post('/v1/catalog/categories', { name: 'Náutica y Playas', description: 'Actividades en el mar' });
          await api.post('/v1/catalog/categories', { name: 'Cultura e Historia', description: 'Museos y monumentos' });
          const refreshedCats = await api.get('/v1/catalog/categories');
          cats = refreshedCats.data;
        } catch {
          // ignore
        }
      }

      if (pls.length === 0) {
        try {
          await api.post('/v1/catalog/tourist-places', { name: 'Centro Histórico / Ciudad Amurallada', city: 'Cartagena' });
          await api.post('/v1/catalog/tourist-places', { name: 'Islas del Rosario & Barú', city: 'Cartagena' });
          await api.post('/v1/catalog/tourist-places', { name: 'Castillo de San Felipe', city: 'Cartagena' });
          const refreshedPls = await api.get('/v1/catalog/tourist-places');
          pls = refreshedPls.data;
        } catch {
          // ignore
        }
      }

      setActivities(activitiesResponse.data);
      setCategories(cats);
      setPlaces(pls);
      setSchedules(schedulesResponse.data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetActivityForm = () => {
    setEditingActivityId(null);
    setActivityForm({
      name: '',
      description: '',
      price: '',
      durationMinutes: '60',
      touristPlaceId: places[0]?.id ? String(places[0].id) : '',
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
    });
  };

  const openCreateActivityModal = () => {
    resetActivityForm();
    setMessage('');
    setErrorMessage('');
    setIsActivityModalOpen(true);
  };

  const openEditActivityModal = (activity: Activity) => {
    setEditingActivityId(activity.id);
    setMessage('');
    setErrorMessage('');
    setActivityForm({
      name: activity.name,
      description: activity.description || '',
      price: String(activity.price),
      durationMinutes: String(activity.durationMinutes),
      touristPlaceId: String(activity.touristPlaceId || activity.touristPlace?.id || ''),
      categoryId: String(activity.categoryId || activity.category?.id || ''),
    });
    setIsActivityModalOpen(true);
  };

  const handleDeleteActivity = async (activity: Activity) => {
    if (!window.confirm(`¿Estás seguro de eliminar la actividad "${activity.name}"?`)) return;
    setMessage('');
    setErrorMessage('');

    try {
      await api.delete(`/v1/catalog/activities/${activity.id}`);
      setMessage('Actividad eliminada correctamente.');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'No se pudo eliminar la actividad.');
    }
  };

  const handleSubmitActivity = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    try {
      const payload = {
        name: activityForm.name,
        description: activityForm.description,
        price: Number(activityForm.price),
        durationMinutes: Number(activityForm.durationMinutes),
        touristPlaceId: Number(activityForm.touristPlaceId),
        categoryId: Number(activityForm.categoryId),
      };

      if (editingActivityId) {
        await api.patch(`/v1/catalog/activities/${editingActivityId}`, payload);
        setMessage('Actividad actualizada correctamente.');
      } else {
        await api.post('/v1/catalog/activities', payload);
        setMessage('Actividad creada exitosamente.');
      }

      resetActivityForm();
      setIsActivityModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || (editingActivityId ? 'No se pudo actualizar la actividad.' : 'No se pudo crear la actividad.'));
    }
  };

  // Crear nueva categoría rápidamente
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/v1/catalog/categories', { name: newCategoryName.trim() });
      setCategories((prev) => [...prev, res.data]);
      setActivityForm((prev) => ({ ...prev, categoryId: String(res.data.id) }));
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch {
      alert('No se pudo crear la categoría.');
    }
  };

  // Crear nuevo lugar turístico rápidamente
  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceForm.name.trim()) return;
    try {
      const res = await api.post('/v1/catalog/tourist-places', {
        name: newPlaceForm.name.trim(),
        city: newPlaceForm.city || 'Cartagena',
        location: newPlaceForm.location || null,
      });
      setPlaces((prev) => [...prev, res.data]);
      setActivityForm((prev) => ({ ...prev, touristPlaceId: String(res.data.id) }));
      setNewPlaceForm({ name: '', city: 'Cartagena', location: '' });
      setIsPlaceModalOpen(false);
    } catch {
      alert('No se pudo crear el lugar turístico.');
    }
  };

  // --- GESTIÓN DE HORARIOS INTEGRADA ---
  const openSchedulesModal = (activity: Activity) => {
    setSelectedActivityForSchedules(activity);
    setEditingScheduleId(null);
    setScheduleMessage('');
    setScheduleError('');
    setScheduleForm({
      scheduleDate: '',
      startTime: '',
      endTime: '',
      capacity: '10',
    });
    setIsScheduleModalOpen(true);
  };

  const handleScheduleTimeChange = (startTime: string) => {
    let autoEndTime = scheduleForm.endTime;
    if (selectedActivityForSchedules && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const totalMinutes = hours * 60 + minutes + (selectedActivityForSchedules.durationMinutes || 60);
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        autoEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }
    }
    setScheduleForm((prev) => ({
      ...prev,
      startTime,
      endTime: autoEndTime,
    }));
  };

  const startEditSchedule = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id);
    setScheduleMessage('');
    setScheduleError('');

    const formattedDate = schedule.scheduleDate ? schedule.scheduleDate.split('T')[0] : '';
    const formattedStartTime = formatTimeDisplay(schedule.startTime);
    const formattedEndTime = formatTimeDisplay(schedule.endTime);

    setScheduleForm({
      scheduleDate: formattedDate,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      capacity: String(schedule.capacity),
    });
  };

  const cancelEditSchedule = () => {
    setEditingScheduleId(null);
    setScheduleForm({
      scheduleDate: '',
      startTime: '',
      endTime: '',
      capacity: '10',
    });
  };

  const handleSubmitSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedActivityForSchedules) return;
    setScheduleMessage('');
    setScheduleError('');

    try {
      if (editingScheduleId) {
        await api.patch(`/v1/itineraries/schedules/${editingScheduleId}`, {
          scheduleDate: scheduleForm.scheduleDate,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          capacity: Number(scheduleForm.capacity),
        });
        setScheduleMessage('Horario actualizado correctamente.');
      } else {
        await api.post('/v1/itineraries/schedules', {
          activityId: selectedActivityForSchedules.id,
          scheduleDate: scheduleForm.scheduleDate,
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          capacity: Number(scheduleForm.capacity),
        });
        setScheduleMessage('Horario creado exitosamente. Los cupos disponibles coinciden con la capacidad inicial.');
      }

      cancelEditSchedule();
      await loadData();
    } catch (err: any) {
      setScheduleError(err?.response?.data?.message || 'No se pudo guardar el horario.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario?')) return;
    setScheduleMessage('');
    setScheduleError('');

    try {
      await api.delete(`/v1/itineraries/schedules/${scheduleId}`);
      setScheduleMessage('Horario eliminado correctamente.');
      await loadData();
    } catch (err: any) {
      setScheduleError(err?.response?.data?.message || 'No se pudo eliminar el horario.');
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const query = search.toLowerCase();
    return [activity.name, activity.category?.name, activity.touristPlace?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  const currentActivitySchedules = selectedActivityForSchedules
    ? schedules.filter((s) => Number(s.activityId) === Number(selectedActivityForSchedules.id))
    : [];

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Actividades y Horarios</h1>
            <p className="mt-1 text-sm text-slate-400">
              Catálogo de experiencias turísticas, categorías, lugares y control dinámico de horarios.
            </p>
          </div>
          <button
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            onClick={openCreateActivityModal}
          >
            + Nueva Actividad
          </button>
        </div>

        {message ? <p className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">{message}</p> : null}
        {errorMessage ? <p className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-400">{errorMessage}</p> : null}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-white">Catálogo de Actividades</h2>
            <div className="flex flex-wrap gap-2">
              <input
                className="w-72 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                placeholder="Buscar por nombre, categoría o lugar..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/80 text-left text-slate-300">
                <tr>
                  <th className="p-3.5 font-semibold">Actividad</th>
                  <th className="p-3.5 font-semibold">Categoría</th>
                  <th className="p-3.5 font-semibold">Lugar</th>
                  <th className="p-3.5 font-semibold">Duración</th>
                  <th className="p-3.5 font-semibold">Precio Unit.</th>
                  <th className="p-3.5 font-semibold">Horarios / Turnos</th>
                  <th className="p-3.5 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No se encontraron actividades registradas.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((activity) => {
                    const activityScheds = schedules.filter((s) => Number(s.activityId) === Number(activity.id));
                    const totalAvailableSlots = activityScheds.reduce((sum, s) => sum + Number(s.availableSlots || 0), 0);

                    return (
                      <tr key={activity.id} className="border-t border-slate-800/70 hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{activity.name}</p>
                          {activity.description ? <p className="text-xs text-slate-400 truncate max-w-xs">{activity.description}</p> : null}
                        </td>
                        <td className="p-3.5 text-slate-300">{activity.category?.name || 'Sin categoría'}</td>
                        <td className="p-3.5 text-slate-300">{activity.touristPlace?.name || 'Sin lugar'}</td>
                        <td className="p-3.5 text-slate-300">{activity.durationMinutes} min</td>
                        <td className="p-3.5 font-bold text-emerald-400">${Number(activity.price).toFixed(2)}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700">
                            📅 {activityScheds.length} turno(s) · {totalAvailableSlots} cupos
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            className="rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                            onClick={() => openSchedulesModal(activity)}
                            title="Gestionar horarios de esta actividad"
                          >
                            📅 Horarios
                          </button>
                          <button
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
                            onClick={() => openEditActivityModal(activity)}
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition"
                            onClick={() => handleDeleteActivity(activity)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL 1: CREAR / EDITAR ACTIVIDAD */}
        {isActivityModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {editingActivityId ? 'Editar Actividad' : 'Nueva Actividad'}
                </h3>
                <button
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                  onClick={() => setIsActivityModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleSubmitActivity} className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Nombre de la actividad *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                      placeholder="Ej: Tour Islas del Rosario en Lancha"
                      value={activityForm.name}
                      onChange={(event) => setActivityForm({ ...activityForm, name: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Precio ($ COP / USD) *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej: 150000"
                      value={activityForm.price}
                      onChange={(event) => setActivityForm({ ...activityForm, price: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Duración estimada (minutos) *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                      type="number"
                      min="1"
                      placeholder="Ej: 120"
                      value={activityForm.durationMinutes}
                      onChange={(event) => setActivityForm({ ...activityForm, durationMinutes: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">Categoría *</label>
                      <button
                        type="button"
                        className="text-[11px] text-emerald-400 hover:underline"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        + Nueva Categoría
                      </button>
                    </div>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                      value={activityForm.categoryId}
                      onChange={(event) => setActivityForm({ ...activityForm, categoryId: event.target.value })}
                      required
                    >
                      <option value="">Selecciona categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">Lugar Turístico *</label>
                      <button
                        type="button"
                        className="text-[11px] text-emerald-400 hover:underline"
                        onClick={() => setIsPlaceModalOpen(true)}
                      >
                        + Nuevo Lugar
                      </button>
                    </div>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                      value={activityForm.touristPlaceId}
                      onChange={(event) => setActivityForm({ ...activityForm, touristPlaceId: event.target.value })}
                      required
                    >
                      <option value="">Selecciona lugar turístico</option>
                      {places.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-300">Descripción / Detalles de la experiencia</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="Describe qué incluye la actividad, recomendaciones, punto de encuentro..."
                    rows={3}
                    value={activityForm.description}
                    onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition"
                    onClick={() => setIsActivityModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition">
                    {editingActivityId ? 'Actualizar Actividad' : 'Crear Actividad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* SUB-MODAL: CREAR CATEGORÍA RÁPIDA */}
        {isCategoryModalOpen ? (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-3">Agregar Nueva Categoría</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Nombre de la categoría *</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="Ej: Ecoturismo y Aventura"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400">
                    Guardar Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* SUB-MODAL: CREAR LUGAR TURÍSTICO RÁPIDO */}
        {isPlaceModalOpen ? (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-3">Agregar Nuevo Lugar Turístico</h3>
              <form onSubmit={handleCreatePlace} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Nombre del lugar *</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="Ej: Playa Blanca, Isla Barú"
                    value={newPlaceForm.name}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-300">Ciudad</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-white outline-none focus:border-emerald-500"
                    placeholder="Cartagena"
                    value={newPlaceForm.city}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, city: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                    onClick={() => setIsPlaceModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400">
                    Guardar Lugar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* MODAL 2: GESTIÓN DE HORARIOS DE LA ACTIVIDAD */}
        {isScheduleModalOpen && selectedActivityForSchedules ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Gestión de Horarios: <span className="text-emerald-400">{selectedActivityForSchedules.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Duración: {selectedActivityForSchedules.durationMinutes} min · Precio: ${Number(selectedActivityForSchedules.price).toFixed(2)}
                  </p>
                </div>
                <button
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 transition"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              {scheduleMessage ? <p className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">{scheduleMessage}</p> : null}
              {scheduleError ? <p className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">{scheduleError}</p> : null}

              {/* Formulario para Crear / Editar Horario */}
              <form onSubmit={handleSubmitSchedule} className="mt-5 rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white">
                    {editingScheduleId ? '✏️ Editar Horario' : '+ Programar Nuevo Horario'}
                  </h4>
                  {editingScheduleId ? (
                    <button
                      type="button"
                      className="text-xs text-slate-400 hover:text-white underline"
                      onClick={cancelEditSchedule}
                    >
                      Cancelar edición
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Fecha del turno *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      type="date"
                      value={scheduleForm.scheduleDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Hora de inicio *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => handleScheduleTimeChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Hora de fin (Autocalculada) *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-300">Capacidad Total (Personas) *</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                      type="number"
                      min="1"
                      placeholder="Ej: 15"
                      value={scheduleForm.capacity}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <p className="mt-2 text-[11px] text-slate-400">
                  ℹ️ Los cupos disponibles son dinámicos: se calculan y descuentan automáticamente conforme se reserven en los itinerarios.
                </p>

                <div className="mt-3 flex justify-end gap-2">
                  <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-400 transition">
                    {editingScheduleId ? 'Guardar Cambios del Horario' : 'Crear Horario'}
                  </button>
                </div>
              </form>

              {/* Listado de horarios existentes */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Horarios y Disponibilidad ({currentActivitySchedules.length})
                </h4>

                {currentActivitySchedules.length === 0 ? (
                  <p className="rounded-xl border border-slate-800 bg-slate-800/30 p-6 text-center text-xs text-slate-400">
                    No hay horarios creados para esta actividad. Utiliza el formulario superior para programar el primer turno.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-800">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-800 text-left text-slate-300">
                        <tr>
                          <th className="p-3">Fecha</th>
                          <th className="p-3">Horario</th>
                          <th className="p-3">Capacidad Total</th>
                          <th className="p-3">Cupos Disponibles</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentActivitySchedules.map((schedule) => {
                          const isFull = schedule.availableSlots <= 0;
                          const isLow = schedule.availableSlots > 0 && schedule.availableSlots <= 3;

                          return (
                            <tr key={schedule.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition">
                              <td className="p-3 font-medium text-white">
                                📅 {formatDateDisplay(schedule.scheduleDate)}
                              </td>
                              <td className="p-3 text-slate-300">
                                ⏰ {formatTimeDisplay(schedule.startTime)} - {formatTimeDisplay(schedule.endTime)}
                              </td>
                              <td className="p-3 text-slate-300">{schedule.capacity} personas</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    isFull
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                      : isLow
                                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  }`}
                                >
                                  {isFull ? 'Agotado (0 cupos)' : `${schedule.availableSlots} disponibles`}
                                </span>
                              </td>
                              <td className="p-3 text-slate-400">
                                {isFull ? 'Completo' : 'Disponible'}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition"
                                  onClick={() => startEditSchedule(schedule)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="rounded-lg border border-rose-700/40 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/20 transition"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ActivitiesPage;
