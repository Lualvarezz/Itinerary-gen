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
        } catch (error) {
          console.error('Error seeding categories:', error);
        }
      }

      if (pls.length === 0) {
        try {
          await api.post('/v1/catalog/tourist-places', { name: 'Centro Histórico / Ciudad Amurallada', city: 'Cartagena' });
          await api.post('/v1/catalog/tourist-places', { name: 'Islas del Rosario & Barú', city: 'Cartagena' });
          await api.post('/v1/catalog/tourist-places', { name: 'Castillo de San Felipe', city: 'Cartagena' });
          const refreshedPls = await api.get('/v1/catalog/tourist-places');
          pls = refreshedPls.data;
        } catch (error) {
          console.error('Error seeding tourist places:', error);
        }
      }

      setActivities(activitiesResponse.data);
      setCategories(cats);
      setPlaces(pls);
      setSchedules(schedulesResponse.data);
    } catch (error) {
      console.error('Error loading activities data:', error);
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

    if (activityForm.description && activityForm.description.length > 2250) {
      setErrorMessage('La descripción / detalles no puede superar los 2250 caracteres.');
      return;
    }

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
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Actividades y Horarios</h1>
            <p className="mt-1 text-sm text-slate-500">
              Catálogo de experiencias turísticas, categorías, lugares y control dinámico de horarios.
            </p>
          </div>
          <button
            className="rounded-xl bg-[#4361EE] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]"
            onClick={openCreateActivityModal}
          >
            + Nueva Actividad
          </button>
        </div>

        {message ? <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm font-medium text-emerald-700">{message}</p> : null}
        {errorMessage ? <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm font-medium text-rose-700">{errorMessage}</p> : null}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Catálogo de Actividades</h2>
            <div className="flex flex-wrap gap-2">
              <input
                className="w-72 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                placeholder="Buscar por nombre, categoría o lugar..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Actividad</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Lugar</th>
                  <th className="p-3.5">Duración</th>
                  <th className="p-3.5">Precio Unit.</th>
                  <th className="p-3.5">Horarios / Turnos</th>
                  <th className="p-3.5 text-right">Acciones</th>
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
                      <tr key={activity.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900">{activity.name}</p>
                          {activity.description ? (
                            <p
                              className="text-xs text-slate-500 truncate max-w-xs cursor-help mt-0.5"
                              title={activity.description}
                            >
                              {activity.description}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-3.5 text-slate-600">{activity.category?.name || 'Sin categoría'}</td>
                        <td className="p-3.5 text-slate-600">{activity.touristPlace?.name || 'Sin lugar'}</td>
                        <td className="p-3.5 text-slate-600 font-medium">{activity.durationMinutes} min</td>
                        <td className="p-3.5 font-bold text-[#4361EE]">${Number(activity.price).toFixed(2)}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                            📅 {activityScheds.length} turno(s) · {totalAvailableSlots} cupos
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            className="rounded-lg border border-[#4361EE]/30 bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4361EE] hover:bg-[#E0E7FF] transition"
                            onClick={() => openSchedulesModal(activity)}
                            title="Gestionar horarios de esta actividad"
                          >
                            📅 Horarios
                          </button>
                          <button
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
                            onClick={() => openEditActivityModal(activity)}
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingActivityId ? 'Editar Actividad' : 'Nueva Actividad'}
                </h3>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => setIsActivityModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleSubmitActivity} className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre de la actividad *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      placeholder="Ej: Tour Islas del Rosario en Lancha"
                      value={activityForm.name}
                      onChange={(event) => setActivityForm({ ...activityForm, name: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Precio ($ COP / USD) *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
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
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Duración estimada (minutos) *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
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
                      <label className="text-xs font-semibold text-slate-700">Categoría *</label>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-[#4361EE] hover:underline"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        + Nueva Categoría
                      </button>
                    </div>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
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
                      <label className="text-xs font-semibold text-slate-700">Lugar Turístico *</label>
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-[#4361EE] hover:underline"
                        onClick={() => setIsPlaceModalOpen(true)}
                      >
                        + Nuevo Lugar
                      </button>
                    </div>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Descripción / Detalles de la experiencia
                    </label>
                    <span
                      className={`text-xs font-mono transition-colors ${
                        (activityForm.description || '').length > 2250
                          ? 'text-rose-600 font-bold'
                          : (activityForm.description || '').length > 2000
                          ? 'text-amber-600 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {(activityForm.description || '').length} / 2250 caracteres
                    </span>
                  </div>
                  <textarea
                    maxLength={2250}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20 resize-y min-h-[110px] leading-relaxed"
                    placeholder="Describe qué incluye la experiencia, recomendaciones, punto de encuentro, etc. (admite emojis ✨🏖️🚤, números y letras hasta 2250 caracteres)..."
                    value={activityForm.description}
                    onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })}
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Permite emojis, números, letras y saltos de línea.</span>
                    <span>{2250 - (activityForm.description || '').length} restantes</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setIsActivityModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-xl bg-[#4361EE] px-5 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]">
                    {editingActivityId ? 'Actualizar Actividad' : 'Crear Actividad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* SUB-MODAL: CREAR CATEGORÍA RÁPIDA */}
        {isCategoryModalOpen ? (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Agregar Nueva Categoría</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre de la categoría *</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                    placeholder="Ej: Ecoturismo y Aventura"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-xl bg-[#4361EE] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]">
                    Guardar Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* SUB-MODAL: CREAR LUGAR TURÍSTICO RÁPIDO */}
        {isPlaceModalOpen ? (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Agregar Nuevo Lugar Turístico</h3>
              <form onSubmit={handleCreatePlace} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Nombre del lugar *</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                    placeholder="Ej: Playa Blanca, Isla Barú"
                    value={newPlaceForm.name}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Ciudad</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                    placeholder="Cartagena"
                    value={newPlaceForm.city}
                    onChange={(e) => setNewPlaceForm({ ...newPlaceForm, city: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsPlaceModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button className="rounded-xl bg-[#4361EE] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]">
                    Guardar Lugar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* MODAL 2: GESTIÓN DE HORARIOS DE LA ACTIVIDAD */}
        {isScheduleModalOpen && selectedActivityForSchedules ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Gestión de Horarios: <span className="text-[#4361EE]">{selectedActivityForSchedules.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Duración: {selectedActivityForSchedules.durationMinutes} min · Precio: ${Number(selectedActivityForSchedules.price).toFixed(2)}
                  </p>
                </div>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              {scheduleMessage ? <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-700">{scheduleMessage}</p> : null}
              {scheduleError ? <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">{scheduleError}</p> : null}

              {/* Formulario para Crear / Editar Horario */}
              <form onSubmit={handleSubmitSchedule} className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    {editingScheduleId ? '✏️ Editar Horario' : '+ Programar Nuevo Horario'}
                  </h4>
                  {editingScheduleId ? (
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                      onClick={cancelEditSchedule}
                    >
                      Cancelar edición
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Fecha del turno *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      type="date"
                      value={scheduleForm.scheduleDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Hora de inicio *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => handleScheduleTimeChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Hora de fin (Autocalculada) *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Capacidad Total (Personas) *</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                      type="number"
                      min="1"
                      placeholder="Ej: 15"
                      value={scheduleForm.capacity}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <p className="mt-2.5 text-[11px] text-slate-500">
                  ℹ️ Los cupos disponibles son dinámicos: se calculan y descuentan automáticamente conforme se reserven en los itinerarios.
                </p>

                <div className="mt-3.5 flex justify-end gap-2">
                  <button className="rounded-xl bg-[#4361EE] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3] transition">
                    {editingScheduleId ? 'Guardar Cambios del Horario' : 'Crear Horario'}
                  </button>
                </div>
              </form>

              {/* Listado de horarios existentes */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">
                  Horarios y Disponibilidad ({currentActivitySchedules.length})
                </h4>

                {currentActivitySchedules.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                    No hay horarios creados para esta actividad. Utiliza el formulario superior para programar el primer turno.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="min-w-full text-xs">
                      <thead className="bg-slate-50 text-left text-slate-600 font-semibold border-b border-slate-200">
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
                            <tr key={schedule.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                              <td className="p-3 font-semibold text-slate-900">
                                📅 {formatDateDisplay(schedule.scheduleDate)}
                              </td>
                              <td className="p-3 text-slate-600">
                                ⏰ {formatTimeDisplay(schedule.startTime)} - {formatTimeDisplay(schedule.endTime)}
                              </td>
                              <td className="p-3 text-slate-600">{schedule.capacity} personas</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    isFull
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : isLow
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isFull ? 'Agotado (0 cupos)' : `${schedule.availableSlots} disponibles`}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500">
                                {isFull ? 'Completo' : 'Disponible'}
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                                  onClick={() => startEditSchedule(schedule)}
                                >
                                  Editar
                                </button>
                                <button
                                  className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
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
