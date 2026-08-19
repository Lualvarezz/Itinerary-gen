import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Activity = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  category?: { name: string };
  touristPlace?: { name: string };
};

type Category = { id: number; name: string };
type TouristPlace = { id: number; name: string };

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: '60',
    touristPlaceId: '',
    categoryId: '',
  });

  const loadData = async () => {
    const [activitiesResponse, categoriesResponse, placesResponse] = await Promise.all([
      api.get('/v1/catalog/activities'),
      api.get('/v1/catalog/categories'),
      api.get('/v1/catalog/tourist-places'),
    ]);

    setActivities(activitiesResponse.data);
    setCategories(categoriesResponse.data);
    setPlaces(placesResponse.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/v1/catalog/activities', {
        ...form,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        touristPlaceId: Number(form.touristPlaceId),
        categoryId: Number(form.categoryId),
      });
      setForm({
        name: '',
        description: '',
        price: '',
        durationMinutes: '60',
        touristPlaceId: '',
        categoryId: '',
      });
      setMessage('Actividad creada correctamente.');
      await loadData();
    } catch {
      setMessage('No se pudo crear la actividad.');
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const query = search.toLowerCase();
    return [activity.name, activity.category?.name, activity.touristPlace?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Actividades</h1>
        <p className="mt-2 text-slate-400">Catálogo de actividades turísticas disponibles.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {message ? <p className="mb-4 text-sm text-emerald-400">{message}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="0" step="0.01" placeholder="Precio" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            <input className="rounded-lg border border-slate-700 bg-slate-800 p-3" type="number" min="1" placeholder="Duración (min)" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} required />
            <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
              <option value="">Selecciona categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select className="rounded-lg border border-slate-700 bg-slate-800 p-3" value={form.touristPlaceId} onChange={(event) => setForm({ ...form, touristPlaceId: event.target.value })} required>
              <option value="">Selecciona lugar</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
          <textarea className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 p-3" placeholder="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white">Guardar actividad</button>
        </form>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Catálogo de actividades</h2>
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
              placeholder="Buscar por nombre o lugar"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredActivities.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-800/70 p-4 text-sm text-slate-400 md:col-span-2">No se encontraron actividades.</div>
            ) : (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-slate-800 bg-slate-800/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{activity.name}</h2>
                  <p className="text-sm text-slate-400">{activity.category?.name || 'Sin categoría'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${Number(activity.price).toFixed(2)}</p>
                  <p className="text-sm text-slate-400">{activity.durationMinutes} min</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">{activity.description || 'Sin descripción'}</p>
                  <p className="mt-2 text-sm text-emerald-400">Lugar: {activity.touristPlace?.name || 'Sin lugar'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
