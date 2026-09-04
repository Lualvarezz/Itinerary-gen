import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Bar,
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
  topTour: TourKPI;
  topHotel: HotelKPI;
  mainChannel: ChannelKPI;
  clientsByHotel: ClientsByHotel[];
  nationalityDistribution: Nationality[];
  channelDistribution: ChannelDistribution[];
  comparativeModalities: ComparativeModality[];
};

const DashboardPage = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get('/v1/dashboard/summary');
        setSummary(data);
      } catch {
        // Fallback to mock data for development
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
          topTour: { activityName: 'Citytour', reservationCount: 12, totalRevenue: 850000 },
          topHotel: { hotelName: 'Hotel Las Américas', clientCount: 45 },
          mainChannel: { channel: 'Instagram', count: 32 },
          clientsByHotel: [
            { hotelName: 'Hotel Las Américas', clientCount: 25, totalRevenue: 3500000 },
            { hotelName: 'Sofitel', clientCount: 20, totalRevenue: 2800000 },
            { hotelName: 'Estelar', clientCount: 15, totalRevenue: 2000000 },
          ],
          nationalityDistribution: [
            { nationality: 'Nacional', count: 55 },
            { nationality: 'Extranjero', count: 25 },
          ],
          channelDistribution: [
            { channel: 'Instagram', count: 32 },
            { channel: 'Recomendación de Hotel', count: 25 },
            { channel: 'Sitio Web', count: 18 },
            { channel: 'WhatsApp', count: 12 },
          ],
          comparativeModalities: [
            { activityName: 'Citytour', schedulePeriod: 'Mañana', reservationCount: 45, totalRevenue: 5200000 },
            { activityName: 'Citytour', schedulePeriod: 'Tarde', reservationCount: 25, totalRevenue: 2800000 },
            { activityName: 'Pasadía Barú', schedulePeriod: 'Día completo', reservationCount: 30, totalRevenue: 4500000 },
            { activityName: 'Pasadía Rosario', schedulePeriod: 'Día completo', reservationCount: 18, totalRevenue: 2500000 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (!summary) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
        <div className="mx-auto max-w-6xl">
          <p className="text-slate-500 text-center">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  const topTour = summary.topTour;
  const topHotel = summary.topHotel;
  const mainChannel = summary.mainChannel;
  const clientsByHotel = summary.clientsByHotel;
  const nationalityDistribution = summary.nationalityDistribution;
  const channelDistribution = summary.channelDistribution;
  const comparativeModalities = summary.comparativeModalities;

  let comparisonText = '';
  if (comparativeModalities[0]) {
    const ratio = comparativeModalities[0].reservationCount / Math.max(1, comparativeModalities[1]?.reservationCount || 1);
    const percentage = Math.round((ratio - 1) * 100);
    comparisonText = `La modalidad ${comparativeModalities[0].activityName} ${comparativeModalities[0].schedulePeriod} registra ${comparativeModalities[0].reservationCount} reservas, superando a la ${comparativeModalities[1]?.activityName || 'Tarde'} (${comparativeModalities[1]?.reservationCount || 15} reservas) por la preferencia de evitar las altas temperaturas`;
  }

  const totalClientsByHotel = clientsByHotel.reduce((sum, h) => sum + h.clientCount, 0);

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen operativo del MVP de itinerarios turísticos.</p>

        {loading ? (
          <p className="mt-8 text-slate-400">Cargando resumen...</p>
        ) : summary ? (
          <>
            {/* KPIs Superiores */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tour Más Vendido</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{topTour.activityName}</p>
                <p className="text-sm text-slate-400">Reservas: {topTour.reservationCount} | Ingresos: ${topTour.totalRevenue.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Hotel Aliado</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{topHotel.hotelName}</p>
                <p className="text-sm text-slate-400">Clientes: {topHotel.clientCount}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Principal Canal</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{mainChannel.channel}</p>
                <p className="text-sm text-slate-400">(${mainChannel.count} clientes)</p>
              </div>
            </div>

            {/* Gráficos e Indicadores Detallados */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Gráfico de Barras - Clientes por Hotel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Clientes por Hotel</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientsByHotel}>
                    <XAxis dataKey="hotelName" stroke="#8884d8" margin={{ bottom: 30, left: 20 }} />
<YAxis stroke="#8884d8"
                      tickFormatter={(value: number) => value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `${value}`}
                      width={60}
                      margin={{ left: 20, right: 20 }}
                    />
                    <Tooltip />
                    <Label labelY={6} labelMargin={5} />
                    <Bar dataKey="clientCount" name="Clientes" fill="#4361EE" />
                    <Bar dataKey="totalRevenue" name="Ingresos" fill="#38B2AC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Dona - Origen de Clientes */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Procedencia de Turistas</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart data={nationalityDistribution}>
                    <Pie dataKey="count" nameKey="nationality" activeFill="#38B2AC">
                      <Cell fill="#3B82F6" />
                      <Cell fill="#2DD4BF" />
                    </Pie>
                    <Legend legendType="series" x="80" y="40" />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Dona - Canal de Atribución */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Canal de Atribución</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart data={channelDistribution}>
                    <Pie dataKey="count" activeFill="#38B2AC">
                      <Cell fill="#3B82F6" />
                      <Cell fill="#2DD4BF" />
                      <Cell fill="#8B5CF6" />
                      <Cell fill="#9CA3AF" />
                    </Pie>
                    <Legend legendType="series" x="80" y="40" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

{/* Análisis Comparativo de Horarios / Modalidades */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Comparativa de Modalidades</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparativeModalities}>
                  <XAxis dataKey="schedulePeriod" stroke="#8884d8" />
                  <YAxis stroke="#8884d8"
                    tickFormatter={(value: number) => value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  />
                  <Tooltip />
                  <Label labelY={6} labelMargin={5} />
                  {comparativeModalities.map((modality, index) => (
                    <Bar
                      key={index}
                      dataKey="reservationCount"
                      name={modality.activityName}
                      fill="#3B82F6"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              {/* Tarjeta de lectura de negocio */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-slate-500 text-sm">
{comparativeModalities[0] && comparisonText}
                </p>
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
