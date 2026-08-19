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

type ActivityOption = { id: number; name: string };

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    activityId: '',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    capacity: '20',
    availableSlots: '20',
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
        capacity: '20',
        availableSlots: '20',
      });
      setMessage('Horario creado correctamente.');
      await loadData();
    } catch {
      setMessage('No se pudo crear el horario.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Horarios</h1>
        <p className="mt-2 text-slate-400">Control de disponibilidad y turnos de actividades.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={form.activityId} onChange={(event) => setForm({ ...form, activityId: event.target.value })} required>
              <option value="">Selecciona actividad</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>{activity.name}</option>
              ))}
            </select>
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="date" value={form.scheduleDate} onChange={(event) => setForm({ ...form, scheduleDate: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="1" placeholder="Capacidad" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="0" placeholder="Disponibles" value={form.availableSlots} onChange={(event) => setForm({ ...form, availableSlots: event.target.value })} required />
          </div>
          <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white">Guardar horario</button>
        </form>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{schedule.activity?.name || 'Actividad'}</h2>
                  <p className="text-sm text-slate-400">{schedule.scheduleDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Disponibles</p>
                  <p className="text-2xl font-semibold text-emerald-400">{schedule.availableSlots}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                {schedule.startTime} - {schedule.endTime}
              </p>
              <p className="mt-2 text-sm text-slate-400">Capacidad: {schedule.capacity} personas</p>
              <p className="mt-2 text-sm text-amber-400">Estado: {schedule.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulesPage;
