import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import {
  mockClients,
  mockItineraries,
  mockTours
} from '../lib/mockData';

type TourKPI = {
  activityName: string;
  reservationCount: number;
  totalRevenue: number;
};

type HotelKPI = {
  hotelName: string;
  clientCount: number;
};

type ChannelKPI = {
  channel: string;
  count: number;
};

type ClientsByHotel = {
  hotelName: string;
  clientCount: number;
  totalRevenue: number;
};

type Nationality = {
  nationality: string;
  count: number;
};

type ChannelDistribution = {
  channel: string;
  count: number;
};

type ComparativeModality = {
  activityName: string;
  schedulePeriod: string;
  reservationCount: number;
  totalRevenue: number;
};

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
  topTour: TourKPI | null;
  topHotel: HotelKPI | null;
  mainChannel: ChannelKPI | null;
  clientsByHotel: ClientsByHotel[];
  nationalityDistribution: Nationality[];
  channelDistribution: ChannelDistribution[];
  comparativeModalities: ComparativeModality[];
};

// Paleta fija para destacar Top 3 (1. Azul, 2. Morado, 3. Verde)
const TOP3_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#64748B', '#94A3B8', '#CBD5E1'];
const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

const DashboardPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get('/v1/dashboard/summary');
        setSummary(data);
      } catch {
        // Fallback a datos mock para desarrollo local
        const clientsCount = mockClients.length;
        const activitiesCount = mockTours.length;
        const itinerariesCount = mockItineraries.length;
        const schedulesCount = 5;
        const totalValue = mockItineraries.reduce((sum, it) => sum + it.totalAmount, 0);
        setSummary({
          clientsCount,
          activitiesCount,
          itinerariesCount,
          schedulesCount,
          totalValue,
          recentItineraries: [],
          topTour: { activityName: 'Citytour Cartagena', reservationCount: 12, totalRevenue: 850000 },
          topHotel: { hotelName: 'Hotel Las Américas', clientCount: 45 },
          mainChannel: { channel: 'Instagram', count: 32 },
          clientsByHotel: [
            { hotelName: 'Hotel Las Américas', clientCount: 25, totalRevenue: 3500000 },
            { hotelName: 'Sofitel Santa Clara', clientCount: 20, totalRevenue: 2800000 },
            { hotelName: 'Hotel Estelar', clientCount: 15, totalRevenue: 2000000 },
            { hotelName: 'Hyatt Regency', clientCount: 8, totalRevenue: 1200000 },
          ],
          nationalityDistribution: [
            { nationality: 'Colombia', count: 55 },
            { nationality: 'Estados Unidos', count: 25 },
            { nationality: 'México', count: 18 },
            { nationality: 'Argentina', count: 12 },
            { nationality: 'España', count: 9 },
            { nationality: 'Chile', count: 7 },
            { nationality: 'Brasil', count: 5 },
            { nationality: 'Perú', count: 4 },
          ],
          channelDistribution: [
            { channel: 'Instagram', count: 32 },
            { channel: 'Recomendación Hotelera', count: 25 },
            { channel: 'Sitio Web Directo', count: 18 },
            { channel: 'WhatsApp / Asesor', count: 12 },
          ],
          comparativeModalities: [
            { activityName: 'Citytour', schedulePeriod: 'Mañana', reservationCount: 45, totalRevenue: 5200000 },
            { activityName: 'Citytour', schedulePeriod: 'Tarde', reservationCount: 25, totalRevenue: 2800000 },
            { activityName: 'Pasadía Barú', schedulePeriod: 'Día Completo', reservationCount: 30, totalRevenue: 4500000 },
            { activityName: 'Pasadía Rosario', schedulePeriod: 'Día Completo', reservationCount: 18, totalRevenue: 2500000 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans flex items-center justify-center">
        <p className="text-slate-500 text-base font-semibold animate-pulse">Cargando métricas del dashboard...</p>
      </div>
    );
  }

  // --- Normalización segura de datos para evitar valores vacíos / undefined ---
  const topTour = {
    activityName: summary?.topTour?.activityName || (summary?.topTour as any)?.activityname || 'Sin registros de tours',
    reservationCount: Number(summary?.topTour?.reservationCount ?? (summary?.topTour as any)?.reservationcount ?? 0),
    totalRevenue: Number(summary?.topTour?.totalRevenue ?? (summary?.topTour as any)?.totalrevenue ?? 0),
  };

  const topHotel = {
    hotelName: summary?.topHotel?.hotelName || (summary?.topHotel as any)?.hotelname || 'Sin registros de hoteles',
    clientCount: Number(summary?.topHotel?.clientCount ?? (summary?.topHotel as any)?.clientcount ?? 0),
  };

  const mainChannel = {
    channel: summary?.mainChannel?.channel || (summary?.mainChannel as any)?.channel || 'Canal Directo',
    count: Number(summary?.mainChannel?.count ?? (summary?.mainChannel as any)?.count ?? 0),
  };

  const clientsByHotel = (summary?.clientsByHotel || []).map((item: any) => ({
    hotelName: item.hotelName || item.hotelname || 'Hotel',
    clientCount: Number(item.clientCount ?? item.clientcount ?? 0),
    totalRevenue: Number(item.totalRevenue ?? item.totalrevenue ?? 0),
  }));

  const comparativeModalities = (summary?.comparativeModalities || []).map((item: any) => ({
    activityName: item.activityName || item.activityname || 'Actividad',
    schedulePeriod: item.schedulePeriod || item.scheduleperiod || 'Jornada',
    reservationCount: Number(item.reservationCount ?? item.reservationcount ?? 0),
    totalRevenue: Number(item.totalRevenue ?? item.totalrevenue ?? 0),
  }));

  const channelDistribution = (summary?.channelDistribution || []).map((item: any) => ({
    channel: item.channel || 'Otros',
    count: Number(item.count ?? 0),
  }));

  // Agrupación de Nacionalidades (Top 5 + "Otros") para evitar sobrecarga visual
  const rawNationalities = (summary?.nationalityDistribution || []).map((item: any) => ({
    nationality: item.nationality || 'No especificado',
    count: Number(item.count ?? 0),
  }));

  const sortedNationalities = [...rawNationalities].sort((a, b) => b.count - a.count);
  const top5Nationalities = sortedNationalities.slice(0, 5);
  const remainingNationalities = sortedNationalities.slice(5);

  const otherCount = remainingNationalities.reduce((sum, n) => sum + n.count, 0);

  const formattedNationalities = [...top5Nationalities];
  if (otherCount > 0) {
    formattedNationalities.push({ nationality: 'Otros', count: otherCount });
  }

  // Lectura de texto de negocio seguro sin `undefined`
  let comparisonText = '';
  if (comparativeModalities.length >= 2) {
    const m1 = comparativeModalities[0];
    const m2 = comparativeModalities[1];
    if (m1 && m2 && m1.reservationCount > 0) {
      comparisonText = `La modalidad "${m1.activityName}" (${m1.schedulePeriod}) encabeza las reservas con ${m1.reservationCount} itinerarios ($${m1.totalRevenue.toLocaleString('es-CO')}), seguida de "${m2.activityName}" (${m2.schedulePeriod}) con ${m2.reservationCount} reservas.`;
    }
  } else if (comparativeModalities.length === 1 && comparativeModalities[0]?.reservationCount > 0) {
    const m1 = comparativeModalities[0];
    comparisonText = `La modalidad "${m1.activityName}" (${m1.schedulePeriod}) acumula un total de ${m1.reservationCount} reservas ($${m1.totalRevenue.toLocaleString('es-CO')}).`;
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Operativo</h1>
          <p className="mt-1 text-sm text-slate-500">Métricas clave e insights del sistema de itinerarios turísticos.</p>
        </div>

        {/* Resumen Global Métricas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Clientes Totales</p>
            <p className="mt-1.5 text-2xl font-black text-slate-900">{summary?.clientsCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Actividades</p>
            <p className="mt-1.5 text-2xl font-black text-slate-900">{summary?.activitiesCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Itinerarios Creados</p>
            <p className="mt-1.5 text-2xl font-black text-slate-900">{summary?.itinerariesCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ingresos Totales</p>
            <p className="mt-1.5 text-2xl font-black text-[#4361EE]">${(summary?.totalValue ?? 0).toLocaleString('es-CO')}</p>
          </div>
        </div>

        {/* 1. Tarjetas Secundarias con Fallbacks Validados */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition hover:shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tour Más Vendido</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">🏆</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 truncate">{topTour.activityName}</p>
            <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Reservas: <strong className="text-slate-800">{topTour.reservationCount}</strong></span>
              <span>Ingresos: <strong className="text-emerald-600">${topTour.totalRevenue.toLocaleString('es-CO')}</strong></span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition hover:shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Hotel Aliado</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-purple-600 text-xs font-bold">🏨</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 truncate">{topHotel.hotelName}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Clientes Atendidos: <strong className="text-slate-800">{topHotel.clientCount}</strong>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition hover:shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Principal Canal</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">📣</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900 truncate">{mainChannel.channel}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Captación: <strong className="text-slate-800">{mainChannel.count} clientes</strong>
            </p>
          </div>
        </div>

        {/* 2. SECCIÓN INTERMEDIA: "Clientes por Hotel" y "Comparativa de Modalidades" */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gráfico: Clientes por Hotel (Barras delgadas con Top 3 destacado) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Clientes por Hotel Aliado</h2>
                <p className="text-xs text-slate-500">Barras clasificadas destacando el Top 3 (Azul, Morado, Verde)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientsByHotel} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <XAxis dataKey="hotelName" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'clientCount' ? `${value} clientes` : `$${Number(value || 0).toLocaleString('es-CO')}`,
                    name === 'clientCount' ? 'Clientes' : 'Ingresos',
                  ]}
                />
                <Bar dataKey="clientCount" name="clientCount" barSize={18} radius={[4, 4, 0, 0]}>
                  {clientsByHotel.map((_, index) => (
                    <Cell key={`hotel-cell-${index}`} fill={TOP3_COLORS[index] || TOP3_COLORS[3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#3B82F6]"></span> Top 1</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#8B5CF6]"></span> Top 2</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#10B981]"></span> Top 3</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#64748B]"></span> Otros</span>
            </div>
          </div>

          {/* Gráfico: Comparativa de Modalidades (Sección intermedia con tonos azul, morado y verde) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Comparativa de Modalidades</h2>
              <p className="text-xs text-slate-500">Rendimiento por horario y variante de actividad</p>
              
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={comparativeModalities} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <XAxis dataKey="schedulePeriod" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip formatter={(val: any) => [`${val} reservas`, 'Reservas']} />
                    <Bar dataKey="reservationCount" name="Reservas" barSize={22} radius={[4, 4, 0, 0]}>
                      {comparativeModalities.map((_, index) => (
                        <Cell key={`comp-cell-${index}`} fill={TOP3_COLORS[index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lectura de negocio sin valores undefined */}
            {comparisonText && (
              <div className="mt-4 pt-3 border-t border-slate-100 rounded-xl bg-slate-50/80 p-3">
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  💡 <strong className="text-slate-900">Insight Operativo:</strong> {comparisonText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. SECCIÓN INFERIOR: "Procedencia de Turistas" y "Canal de Atribución" */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gráfico de Barras Horizontales: Procedencia de Turistas (Top 5 + Otros sin saturación ni solapamiento) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Procedencia de Turistas</h2>
                <p className="text-xs text-slate-500">Distribución por nacionalidad (Top 5 y categoría agrupada Otros)</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 items-center">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={formattedNationalities}
                  margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                >
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis type="category" dataKey="nationality" stroke="#64748B" fontSize={11} width={90} />
                  <Tooltip formatter={(val: any) => [`${val} turistas`, 'Cantidad']} />
                  <Bar dataKey="count" barSize={16} radius={[0, 4, 4, 0]}>
                    {formattedNationalities.map((_, index) => (
                      <Cell key={`nat-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Desglose de Origen</p>
                {formattedNationalities.map((n, idx) => {
                  const total = rawNationalities.reduce((s, item) => s + item.count, 0) || 1;
                  const pct = Math.round((n.count / total) * 100);
                  return (
                    <div key={n.nationality} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                        <span className="font-semibold text-slate-700">{n.nationality}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">{n.count} personas</span>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gráfico de Dona: Canal de Atribución */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Canal de Atribución</h2>
              <p className="text-xs text-slate-500 mb-4">Medios de captación de turistas</p>
              
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={channelDistribution}
                    dataKey="count"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {channelDistribution.map((_, index) => (
                      <Cell key={`chan-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} clientes`, 'Clientes']} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
