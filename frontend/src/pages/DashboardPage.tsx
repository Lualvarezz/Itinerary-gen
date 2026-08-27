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
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen operativo del MVP de itinerarios turísticos.</p>

        {loading ? (
          <p className="mt-8 text-slate-400">Cargando resumen...</p>
        ) : summary ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clientes</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.clientsCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Actividades</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.activitiesCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Itinerarios</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{summary.itinerariesCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor reciente</p>
                <p className="mt-2 text-3xl font-extrabold text-[#4361EE]">${Number(summary.totalValue || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Itinerarios recientes</h2>
                  <p className="text-xs text-slate-500">Últimas cotizaciones generadas</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                  {summary.schedulesCount} horarios disponibles
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {summary.recentItineraries.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Aún no hay itinerarios creados.</p>
                ) : (
                  summary.recentItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-900">{itinerary.client?.fullName || 'Cliente sin nombre'}</p>
                        <p className="text-xs text-slate-500">
                          Estado: <span className={itinerary.status === 'confirmed' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{itinerary.status === 'confirmed' ? 'Confirmado' : 'Borrador'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="font-bold text-[#4361EE]">${Number(itinerary.totalAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</p>
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
