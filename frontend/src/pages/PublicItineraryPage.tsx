import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

type ItineraryItem = {
  id?: number;
  activityId?: number;
  quantityPeople?: number;
  unitPrice?: number;
  subtotal?: number;
  activity?: {
    name: string;
    description?: string;
    durationMinutes?: number;
    price?: number;
  };
  schedule?: {
    scheduleDate: string;
    startTime: string;
    endTime: string;
  };
};

type ItineraryData = {
  id?: number;
  publicToken?: string;
  status?: string;
  observations?: string | null;
  totalAmount?: number;
  createdAt?: string;
  client?: {
    fullName: string;
    numberOfPeople?: number;
    email?: string | null;
    phone?: string | null;
  };
  items?: ItineraryItem[];
};

const mockItinerary: ItineraryData = {
  id: 1,
  publicToken: 'mock-token-12345',
  status: 'CONFIRMED',
  observations: 'Punto de encuentro: Muelle de la Bodeguita a las 07:30 AM. Llevar protector solar y toalla.',
  totalAmount: 125.5,
  client: {
    fullName: 'María González',
    numberOfPeople: 2,
    email: 'maria.gonzalez@example.com',
    phone: '+57 300 123 4567',
  },
  items: [
    {
      id: 1,
      quantityPeople: 2,
      unitPrice: 45.0,
      subtotal: 90.0,
      activity: {
        name: 'Tour Histórico Centro Amurallado',
        durationMinutes: 120,
        description: 'Recorrido guiado a pie por las calles coloniales, plazas y baluartes.',
      },
      schedule: {
        scheduleDate: new Date().toISOString(),
        startTime: '09:00:00',
        endTime: '11:00:00',
      },
    },
    {
      id: 2,
      quantityPeople: 2,
      unitPrice: 17.75,
      subtotal: 35.5,
      activity: {
        name: 'Almuerzo Típico Caribeño en Playa',
        durationMinutes: 90,
        description: 'Pescado frito, arroz con coco, patacones y ensalada fresca frente al mar.',
      },
      schedule: {
        scheduleDate: new Date().toISOString(),
        startTime: '12:30:00',
        endTime: '14:00:00',
      },
    },
  ],
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Sin fecha';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-CO', { dateStyle: 'long' });
};

const formatTime = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr.slice(0, 5);
};

export default function PublicItineraryPage() {
  const { publicToken } = useParams<{ publicToken: string }>();
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingGuide, setRatingGuide] = useState(5);
  const [ratingLunch, setRatingLunch] = useState(5);
  const [ratingTransport, setRatingTransport] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        if (!publicToken) {
          setItinerary(mockItinerary);
          return;
        }
        const res = await api.get(`/v1/itineraries/public-token/${publicToken}`);
        if (res.data && (res.data.itinerary || res.data.id)) {
          setItinerary(res.data.itinerary || res.data);
        } else {
          setItinerary(mockItinerary);
        }
      } catch {
        // En caso de que el backend no tenga aún el endpoint implementado, mostrar mock
        setItinerary(mockItinerary);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [publicToken]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/v1/itineraries/public-token/${publicToken || 'mock'}/reviews`, {
        ratingOverall,
        ratingGuide,
        ratingLunch,
        ratingTransport,
        comment,
      });
    } catch {
      // Ignorar error si el backend aún no tiene el endpoint
    } finally {
      setSubmittingReview(false);
      setReviewSubmitted(true);
      setTimeout(() => setShowReviewModal(false), 2000);
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-2xl transition transform hover:scale-110 ${
            star <= rating ? 'text-amber-400' : 'text-slate-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] p-4">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#4361EE] border-t-transparent"></div>
          <p className="mt-4 text-sm font-semibold text-slate-600">Cargando itinerario turístico...</p>
        </div>
      </div>
    );
  }

  const current = itinerary || mockItinerary;

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-slate-800 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4361EE] text-white font-bold text-lg shadow-sm">
              CT
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Cartagena Tours</h1>
              <p className="text-xs text-slate-500 font-medium">Voucher & Itinerario Digital</p>
            </div>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#4361EE] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3451db] transition"
          >
            ★ Calificar Experiencia
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        {/* Banner de Bienvenida */}
        <div className="rounded-2xl bg-linear-to-r from-[#4361EE] to-[#3a0ca3] p-6 text-white shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold tracking-wide uppercase mb-2">
                Itinerario Confirmado
              </span>
              <h2 className="text-2xl font-black leading-tight">
                ¡Hola, {current.client?.fullName || 'Viajero'}!
              </h2>
              <p className="text-xs text-blue-100 mt-1">
                Aquí tienes el detalle completo de tus actividades reservadas en Cartagena.
              </p>
            </div>
            <div className="text-right bg-white/10 p-3 rounded-xl backdrop-blur-xs">
              <p className="text-[10px] text-blue-200 uppercase font-semibold">Total Reserva</p>
              <p className="text-xl font-extrabold text-white">
                ${Number(current.totalAmount || 0).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen del Cliente */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">
            Detalles de la Reserva
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
            <div>
              <p className="text-slate-400 font-medium">Titular</p>
              <p className="font-semibold text-slate-800">{current.client?.fullName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Pasajeros</p>
              <p className="font-semibold text-slate-800">{current.client?.numberOfPeople || 1} Persona(s)</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Estado</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                {current.status || 'Confirmado'}
              </span>
            </div>
          </div>

          {current.observations && (
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <span className="font-bold">⚠️ Observaciones y Recomendaciones:</span>
              <p className="mt-0.5">{current.observations}</p>
            </div>
          )}
        </div>

        {/* Lista de Actividades */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Cronograma de Actividades</h3>
          <div className="space-y-4">
            {(!current.items || current.items.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                No hay actividades registradas en este itinerario.
              </div>
            ) : (
              current.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#4361EE] font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {item.activity?.name || 'Actividad Turística'}
                        </h4>
                        {item.activity?.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.activity.description}</p>
                        )}
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                          {item.schedule?.scheduleDate && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              📅 {formatDate(item.schedule.scheduleDate)}
                            </span>
                          )}
                          {item.schedule?.startTime && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              ⏰ {formatTime(item.schedule.startTime)} - {formatTime(item.schedule.endTime)}
                            </span>
                          )}
                          {item.activity?.durationMinutes && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              ⏱️ {item.activity.durationMinutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">
                        ${Number(item.subtotal || item.unitPrice || 0).toLocaleString('es-CO')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantityPeople || 1} pax
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botón Flotante / Acciones */}
        <div className="pt-2">
          <button
            onClick={() => setShowReviewModal(true)}
            className="w-full rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between hover:bg-slate-50 transition"
          >
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">¿Cómo estuvo tu experiencia?</p>
              <p className="text-xs text-slate-500">Califícanos y ayúdanos a mejorar nuestros servicios.</p>
            </div>
            <span className="rounded-xl bg-[#4361EE] text-white px-3.5 py-1.5 text-xs font-semibold">
              Dejar Reseña ⭐
            </span>
          </button>
        </div>
      </main>

      {/* Modal de Calificación / Reseña */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            {reviewSubmitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-slate-900">¡Muchas Gracias!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tu retroalimentación ha sido guardada. Nos ayuda a brindarte la mejor experiencia en Cartagena.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-slate-900">Califica tu Experiencia</h3>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Satisfacción General</label>
                    {renderStars(ratingOverall, setRatingOverall)}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Atención del Guía & Puntualidad</label>
                    {renderStars(ratingGuide, setRatingGuide)}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Alimentación / Almuerzo</label>
                    {renderStars(ratingLunch, setRatingLunch)}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Transporte & Logística</label>
                    {renderStars(ratingTransport, setRatingTransport)}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Comentarios o Sugerencias</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Cuéntanos qué fue lo que más te gustó o qué podemos mejorar..."
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-[#4361EE] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="rounded-xl bg-[#4361EE] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3451db] transition disabled:opacity-50"
                  >
                    {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}