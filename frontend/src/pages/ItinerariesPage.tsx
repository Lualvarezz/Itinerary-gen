import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Client = {
  id: number;
  fullName: string;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  nationality: string;
  numberOfPeople: number;
};

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
  price: number;
  durationMinutes: number;
};

type ItineraryItemDraft = {
  id?: number;
  activityId: number | '';
  scheduleId: number | '';
  quantityPeople: number;
  unitPrice: number;
  subtotal: number;
};

type Itinerary = {
  id: number;
  clientId: number;
  status: string;
  observations?: string | null;
  totalAmount: number;
  createdAt?: string;
  client?: Client;
  items?: Array<{
    id: number;
    activityId: number;
    scheduleId: number;
    quantityPeople: number;
    unitPrice: number;
    subtotal: number;
    activity?: { name: string };
    schedule?: { scheduleDate: string; startTime: string; endTime: string };
  }>;
};

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return 'Sin fecha';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('es-CO');
};

const formatTimeDisplay = (timeStr?: string) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? timeStr : d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr.slice(0, 5);
};

const ItinerariesPage = () => {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal único para Crear / Editar Itinerario Completo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItineraryId, setEditingItineraryId] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);

  // Formulario único
  const [clientId, setClientId] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<ItineraryItemDraft[]>([]);

  const loadData = async () => {
    try {
      const [itinerariesResponse, clientsResponse, activitiesResponse, schedulesResponse] = await Promise.all([
        api.get('/v1/itineraries'),
        api.get('/v1/clients'),
        api.get('/v1/catalog/activities'),
        api.get('/v1/itineraries/schedules'),
      ]);

      setItineraries(itinerariesResponse.data || []);
      setClients(clientsResponse.data || []);
      setActivities(activitiesResponse.data || []);
      setSchedules(schedulesResponse.data || []);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedClient = clients.find((c) => String(c.id) === clientId);

  const resetForm = () => {
    setEditingItineraryId(null);
    setClientId('');
    setObservations('');
    setSelectedItems([]);
  };

  const openCreateModal = () => {
    resetForm();
    setMessage('');
    setErrorMessage('');
    // Agregar una fila inicial de actividad vacía
    setSelectedItems([
      {
        activityId: '',
        scheduleId: '',
        quantityPeople: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (itinerary: Itinerary) => {
    setEditingItineraryId(itinerary.id);
    setMessage('');
    setErrorMessage('');
    setClientId(String(itinerary.clientId));
    setObservations(itinerary.observations || '');

    const itemsDraft: ItineraryItemDraft[] = (itinerary.items || []).map((it) => ({
      id: it.id,
      activityId: it.activityId,
      scheduleId: it.scheduleId,
      quantityPeople: it.quantityPeople,
      unitPrice: Number(it.unitPrice),
      subtotal: Number(it.subtotal),
    }));

    setSelectedItems(
      itemsDraft.length > 0
        ? itemsDraft
        : [{ activityId: '', scheduleId: '', quantityPeople: itinerary.client?.numberOfPeople || 1, unitPrice: 0, subtotal: 0 }]
    );
    setIsModalOpen(true);
  };

  // Al cambiar de cliente, sincronizar el número de personas por defecto para las actividades
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const client = clients.find((c) => String(c.id) === newClientId);
    const defaultPax = client?.numberOfPeople || 1;

    setSelectedItems((prev) =>
      prev.map((item) => {
        const qty = item.quantityPeople === 1 && defaultPax > 1 ? defaultPax : item.quantityPeople;
        return {
          ...item,
          quantityPeople: qty,
          subtotal: qty * item.unitPrice,
        };
      })
    );
  };

  const handleAddActivityRow = () => {
    const defaultPax = selectedClient?.numberOfPeople || 1;
    setSelectedItems((prev) => [
      ...prev,
      {
        activityId: '',
        scheduleId: '',
        quantityPeople: defaultPax,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveActivityRow = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemActivityChange = (index: number, actId: string) => {
    const activity = activities.find((a) => String(a.id) === actId);
    const price = activity ? Number(activity.price) : 0;

    setSelectedItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const pax = item.quantityPeople || (selectedClient?.numberOfPeople || 1);
        return {
          ...item,
          activityId: actId ? Number(actId) : '',
          scheduleId: '', // Reset schedule when activity changes
          unitPrice: price,
          subtotal: pax * price,
        };
      })
    );
  };

  const handleItemScheduleChange = (index: number, schedId: string) => {
    setSelectedItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, scheduleId: schedId ? Number(schedId) : '' } : item))
    );
  };

  const handleItemPaxChange = (index: number, pax: number) => {
    const validPax = Math.max(1, pax || 1);
    setSelectedItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              quantityPeople: validPax,
              subtotal: validPax * item.unitPrice,
            }
          : item
      )
    );
  };

  const calculateTotalAmount = () => {
    return selectedItems.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);
  };

  // Guardar itinerario (sea como Borrador o Confirmado)
  const saveItinerary = async (targetStatus: 'draft' | 'confirmed'): Promise<number | null> => {
    if (!clientId) {
      setErrorMessage('Debes seleccionar un cliente.');
      return null;
    }

    // Filtrar items válidos
    const validItems = selectedItems.filter((it) => it.activityId && it.scheduleId);
    if (validItems.length === 0) {
      setErrorMessage('Debes seleccionar al menos una actividad con su horario disponible.');
      return null;
    }

    const payload = {
      clientId: Number(clientId),
      observations,
      status: targetStatus,
      items: validItems.map((it) => ({
        activityId: Number(it.activityId),
        scheduleId: Number(it.scheduleId),
        quantityPeople: Number(it.quantityPeople),
        unitPrice: Number(it.unitPrice),
        subtotal: Number(it.subtotal),
      })),
    };

    if (editingItineraryId) {
      await api.patch(`/v1/itineraries/${editingItineraryId}`, payload);
      return editingItineraryId;
    } else {
      const res = await api.post('/v1/itineraries', payload);
      return res.data.id;
    }
  };

  // Acción 1: Guardar como Borrador
  const handleSaveAsDraft = async () => {
    setMessage('');
    setErrorMessage('');

    try {
      const id = await saveItinerary('draft');
      if (id) {
        setMessage('Itinerario guardado en BORRADOR exitosamente.');
        setIsModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Error al guardar el itinerario.');
    }
  };

  // Acción 2: Generar PDF y Confirmar
  const handleGeneratePdfAndConfirm = async (itineraryIdParam?: number) => {
    setMessage('');
    setErrorMessage('');

    let targetId = itineraryIdParam || editingItineraryId;

    try {
      // Si se llama desde el modal de edición/creación, primero guardar los cambios
      if (isModalOpen) {
        targetId = await saveItinerary('confirmed');
        if (!targetId) return;
      }

      if (!targetId) return;
      setIsGeneratingPdf(targetId);

      const response = await api.post(`/v1/itineraries/${targetId}/generate-pdf`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `itinerario-${targetId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage(`¡Itinerario #${targetId} CONFIRMADO y PDF generado exitosamente!`);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'No se pudo generar el PDF del itinerario.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  const handleDeleteItinerary = async (id: number) => {
    if (!window.confirm(`¿Estás seguro de eliminar el itinerario #${id}? Los cupos de sus actividades serán liberados.`)) return;
    setMessage('');
    setErrorMessage('');

    try {
      await api.delete(`/v1/itineraries/${id}`);
      setMessage('Itinerario eliminado y cupos liberados correctamente.');
      await loadData();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'No se pudo eliminar el itinerario.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] p-8 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Itinerarios de Viaje</h1>
            <p className="mt-1 text-sm text-slate-500">
              Genera propuestas personalizadas, asigna actividades con horarios y emite el PDF oficial confirmado.
            </p>
          </div>
          <button
            className="rounded-xl bg-[#4361EE] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3730A3]"
            onClick={openCreateModal}
          >
            + Crear Itinerario
          </button>
        </div>

        {message ? <p className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm font-medium text-emerald-700">{message}</p> : null}
        {errorMessage ? <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm font-medium text-rose-700">{errorMessage}</p> : null}

        {/* LISTADO DE ITINERARIOS */}
        <div className="mt-8 space-y-4">
          {itineraries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-xs">
              <p className="text-lg font-bold text-slate-800">No hay itinerarios registrados aún.</p>
              <p className="text-sm text-slate-500 mt-1">Haz clic en "+ Crear Itinerario" para construir la primera propuesta turística.</p>
            </div>
          ) : (
            itineraries.map((itinerary) => {
              const isConfirmed = itinerary.status === 'confirmed';

              return (
                <div key={itinerary.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-slate-900">
                          {itinerary.client?.fullName || 'Cliente sin nombre'}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isConfirmed ? '✓ CONFIRMADO' : '✎ BORRADOR (Editable)'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Doc: {itinerary.client?.documentNumber || 'N/A'} · Tel: {itinerary.client?.phone || 'N/A'} · Creado: {formatDateDisplay(itinerary.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">Total del Itinerario</p>
                      <p className="text-2xl font-black text-[#4361EE]">
                        ${Number(itinerary.totalAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {itinerary.observations ? (
                    <p className="mt-3 text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      Notas: "{itinerary.observations}"
                    </p>
                  ) : null}

                  {/* Detalle de actividades incluidas */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-700">Actividades programadas ({itinerary.items?.length || 0}):</p>
                    {(itinerary.items || []).map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                        <div>
                          <p className="font-semibold text-slate-900">{item.activity?.name || 'Actividad'}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            📅 {formatDateDisplay(item.schedule?.scheduleDate)} · ⏰ {formatTimeDisplay(item.schedule?.startTime)} - {formatTimeDisplay(item.schedule?.endTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#4361EE]">{item.quantityPeople} persona(s) x ${Number(item.unitPrice).toFixed(2)}</p>
                          <p className="text-slate-800 font-bold">Subtotal: ${Number(item.subtotal).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex gap-2">
                      <button
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                        onClick={() => openEditModal(itinerary)}
                      >
                        ✏️ Editar Itinerario
                      </button>
                      <button
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                        onClick={() => handleDeleteItinerary(itinerary.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>

                    <button
                      className="rounded-xl bg-[#4361EE] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3730A3] transition flex items-center gap-2"
                      onClick={() => handleGeneratePdfAndConfirm(itinerary.id)}
                      disabled={isGeneratingPdf === itinerary.id}
                    >
                      {isGeneratingPdf === itinerary.id ? 'Generando PDF...' : isConfirmed ? '📄 Descargar PDF Oficial' : '📄 Generar PDF y Confirmar'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL ÚNICO: FORMULARIO INTEGRADO DE CREACIÓN / EDICIÓN */}
        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingItineraryId ? `Editar Itinerario #${editingItineraryId}` : 'Crear Nuevo Itinerario'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Selecciona al cliente y agrega las actividades con sus horarios disponibles en un solo flujo.
                  </p>
                </div>
                <button
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cerrar
                </button>
              </div>

              {errorMessage ? <p className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">{errorMessage}</p> : null}

              <div className="mt-6 space-y-6">
                {/* SECCIÓN 1: CLIENTE */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">1. Datos del Cliente</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Cliente *</label>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                        value={clientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        required
                      >
                        <option value="">-- Selecciona un cliente registrado --</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} (Doc: {c.documentNumber}) · Grupo: {c.numberOfPeople} persona(s)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">Observaciones generales</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                        placeholder="Ej: Turistas de España, hotel en Bocagrande, vuelo de regreso el domingo"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                      />
                    </div>
                  </div>

                  {selectedClient ? (
                    <div className="mt-3 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 font-medium">
                      <span>👤 <strong className="text-slate-900">{selectedClient.fullName}</strong></span>
                      <span>📄 Doc: <strong className="text-slate-900">{selectedClient.documentNumber}</strong></span>
                      <span>🌎 Nacionalidad: <strong className="text-slate-900">{selectedClient.nationality}</strong></span>
                      <span>👥 Personas base: <strong className="text-slate-900">{selectedClient.numberOfPeople}</strong></span>
                    </div>
                  ) : null}
                </div>

                {/* SECCIÓN 2: ACTIVIDADES A REALIZAR */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">2. Actividades y Horarios a Realizar</h4>
                      <p className="text-[11px] text-slate-500">
                        Los cupos se reservan automáticamente de los turnos disponibles de cada actividad.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-xl bg-[#EEF2FF] border border-[#4361EE]/30 px-3.5 py-1.5 text-xs font-semibold text-[#4361EE] hover:bg-[#E0E7FF] transition"
                      onClick={handleAddActivityRow}
                    >
                      + Agregar otra actividad
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedItems.map((item, index) => {
                      const itemSchedules = schedules.filter((s) => Number(s.activityId) === Number(item.activityId));

                      return (
                        <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Actividad #{index + 1}</span>
                            {selectedItems.length > 1 ? (
                              <button
                                type="button"
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                onClick={() => handleRemoveActivityRow(index)}
                              >
                                Quitar actividad ✕
                              </button>
                            ) : null}
                          </div>

                          <div className="grid gap-3 md:grid-cols-12">
                            {/* Selector de actividad */}
                            <div className="md:col-span-4">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">Actividad *</label>
                              <select
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                                value={item.activityId}
                                onChange={(e) => handleItemActivityChange(index, e.target.value)}
                                required
                              >
                                <option value="">-- Selecciona actividad --</option>
                                {activities.map((act) => (
                                  <option key={act.id} value={act.id}>
                                    {act.name} (${Number(act.price).toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Selector de horario disponible */}
                            <div className="md:col-span-4">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">Horario Disponible *</label>
                              <select
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                                value={item.scheduleId}
                                onChange={(e) => handleItemScheduleChange(index, e.target.value)}
                                disabled={!item.activityId}
                                required
                              >
                                <option value="">-- Selecciona horario --</option>
                                {itemSchedules.map((s) => {
                                  const isFull = s.availableSlots <= 0;
                                  return (
                                    <option key={s.id} value={s.id} disabled={isFull}>
                                      {formatDateDisplay(s.scheduleDate)} ({formatTimeDisplay(s.startTime)} - {formatTimeDisplay(s.endTime)}) · {isFull ? 'AGOTADO (0 cupos)' : `${s.availableSlots} cupos`}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Personas */}
                            <div className="md:col-span-2">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">Personas *</label>
                              <input
                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
                                type="number"
                                min="1"
                                value={item.quantityPeople}
                                onChange={(e) => handleItemPaxChange(index, Number(e.target.value))}
                                required
                              />
                            </div>

                            {/* Subtotal */}
                            <div className="md:col-span-2 text-right">
                              <label className="mb-1 block text-xs font-semibold text-slate-700">Subtotal</label>
                              <p className="mt-2 text-sm font-bold text-[#4361EE]">
                                ${Number(item.subtotal).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen Total */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs font-bold text-slate-700">Total a Pagar del Itinerario:</span>
                    <span className="text-xl font-black text-[#4361EE]">
                      ${calculateTotalAmount().toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN UNIFICADOS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 transition"
                      onClick={handleSaveAsDraft}
                    >
                      💾 Guardar como Borrador
                    </button>

                    <button
                      type="button"
                      className="rounded-xl bg-[#4361EE] px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#3730A3] transition flex items-center gap-2"
                      onClick={() => handleGeneratePdfAndConfirm()}
                      disabled={isGeneratingPdf !== null}
                    >
                      📄 Generar PDF y Confirmar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ItinerariesPage;
