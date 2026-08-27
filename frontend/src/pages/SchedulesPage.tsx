import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Schedule = {
  id: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableSlots: number;
  status: string;
  activity?: { name: string; price: number };
};

type ActivityOption = { id: number; name: string; durationMinutes?: number };

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    activityId: '',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    capacity: '10',
    availableSlots: '10',
  });

  const loadData = async () => {
    const [schedulesResponse, activitiesResponse] = await Promise.all([
      api.get('/v1/itineraries/schedules'),
      api.get('/v1/catalog/activities'),
    ]);

    setSchedules(schedulesResponse.data);
    setActivities(activitiesResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivityOrTimeChange = (activityId: string, startTime: string) => {
    const selectedAct = activities.find((a) => String(a.id) === activityId);
    let autoEndTime = form.endTime;

    if (selectedAct && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const totalMinutes = hours * 60 + minutes + (selectedAct.durationMinutes || 60);
        const endH = Math.floor(totalMinutes / 60) % 24;
        const endM = totalMinutes % 60;
        autoEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      }
    }

    setForm((prev) => ({
      ...prev,
      activityId,
      startTime,
      endTime: autoEndTime,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/v1/itineraries/schedules', {
        ...form,
        activityId: Number(form.activityId),
        capacity: Number(form.capacity),
        availableSlots: Number(form.availableSlots),
      });
      setForm({
        activityId: '',
        scheduleDate: '',
        startTime: '',
        endTime: '',
        capacity: '10',
        availableSlots: '10',
      });
      setMessage('Horario creado correctamente.');
      await loadData();
    } catch {
      setMessage('No se pudo crear el horario.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Horarios</h1>
        <p className="mt-1 text-sm text-slate-500">Control de disponibilidad y turnos dinámicos de actividades.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {message ? <p className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-700">{message}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Actividad *</label>
              <select className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" value={form.activityId} onChange={(e) => handleActivityOrTimeChange(e.target.value, form.startTime)} required>
                <option value="">Selecciona actividad</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>{activity.name} ({activity.durationMinutes} min)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fecha *</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" type="date" value={form.scheduleDate} onChange={(event) => setForm({ ...form, scheduleDate: event.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Hora de inicio *</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" type="time" value={form.startTime} onChange={(e) => handleActivityOrTimeChange(form.activityId, e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Hora de fin (calculada dinámicamente) *</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Capacidad total (personas) *</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" type="number" min="1" placeholder="Ej: 15" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value, availableSlots: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Cupos disponibles *</label>
              <input className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20" type="number" min="0" placeholder="Cupos disponibles" value={form.availableSlots} onChange={(event) => setForm({ ...form, availableSlots: event.target.value })} required />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="rounded-xl bg-[#4361EE] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]">
              Guardar horario
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{schedule.activity?.name || 'Actividad'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">📅 {schedule.scheduleDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Disponibles</p>
                  <p className="text-2xl font-extrabold text-[#4361EE]">{schedule.availableSlots}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600 font-medium">
                ⏰ Horario: {schedule.startTime} - {schedule.endTime}
              </p>
              <p className="mt-1 text-xs text-slate-500">Capacidad total: {schedule.capacity} personas</p>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  Estado: {schedule.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulesPage;
