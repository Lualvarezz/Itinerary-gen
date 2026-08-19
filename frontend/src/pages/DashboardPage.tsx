import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Summary = {
  clientsCount: number;
  activitiesCount: number;
  itinerariesCount: number;
  schedulesCount: number;
  totalValue: number;
  recentItineraries: Array<{
    id: number;
    status: string;
    totalAmount: number;
    client?: { fullName: string };
  }>;
};

const DashboardPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get('/v1/dashboard/summary');
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-slate-400">Resumen operativo del MVP de itinerarios turísticos.</p>

        {loading ? (
          <p className="mt-8 text-slate-400">Cargando resumen...</p>
        ) : summary ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Clientes</p>
                <p className="mt-2 text-3xl font-semibold">{summary.clientsCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Actividades</p>
                <p className="mt-2 text-3xl font-semibold">{summary.activitiesCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Itinerarios</p>
                <p className="mt-2 text-3xl font-semibold">{summary.itinerariesCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Valor reciente</p>
                <p className="mt-2 text-3xl font-semibold">${Number(summary.totalValue || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Itinerarios recientes</h2>
                <p className="text-sm text-slate-400">{summary.schedulesCount} horarios disponibles</p>
              </div>
              <div className="mt-4 space-y-3">
                {summary.recentItineraries.length === 0 ? (
                  <p className="text-slate-400">Aún no hay itinerarios creados.</p>
                ) : (
                  summary.recentItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/70 p-4">
                      <div>
                        <p className="font-medium">{itinerary.client?.fullName || 'Cliente sin nombre'}</p>
                        <p className="text-sm text-slate-400">Estado: {itinerary.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Total</p>
                        <p className="font-semibold text-emerald-400">${Number(itinerary.totalAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="mt-8 text-slate-400">No se pudo cargar el resumen.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
