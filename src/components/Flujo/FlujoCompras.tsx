import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import type { EstadoSolicitud, SolicitudCompra } from '../../types'
import { generateId, generateNumero, nowISO, today, formatDate } from '../../utils/helpers'

const PASOS: { estado: EstadoSolicitud; label: string; descripcion: string }[] = [
  { estado: 'solicitud', label: 'Solicitud', descripcion: 'Solicitud de compra creada' },
  { estado: 'cotizaciones', label: 'Cotizaciones', descripcion: 'Recolectando cotizaciones' },
  { estado: 'comparacion', label: 'Comparación', descripcion: 'Comparando proveedores' },
  { estado: 'aceptacion', label: 'Aceptación', descripcion: 'Cotización aceptada' },
  { estado: 'oc_generada', label: 'OC Generada', descripcion: 'Orden de Compra emitida' },
  { estado: 'aprobacion', label: 'Aprobación', descripcion: 'Pendiente de aprobación' },
  { estado: 'entrega', label: 'Entrega', descripcion: 'Artículos entregados' },
  { estado: 'remito', label: 'Remito', descripcion: 'Remito registrado' },
  { estado: 'pago', label: 'Pago', descripcion: 'Pago realizado' },
]

const PRIORIDAD_COLORS = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-green-100 text-green-700',
}

const ORDEN_ESTADOS: EstadoSolicitud[] = [
  'solicitud', 'cotizaciones', 'comparacion', 'aceptacion',
  'oc_generada', 'aprobacion', 'entrega', 'remito', 'pago',
]

function getStepIndex(estado: EstadoSolicitud) {
  return ORDEN_ESTADOS.indexOf(estado)
}

function Timeline({ solicitud }: { solicitud: SolicitudCompra }) {
  const currentIdx = getStepIndex(solicitud.estado)

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center min-w-[700px] py-4">
        {PASOS.map((paso, i) => {
          const isCompleted = i < currentIdx
          const isActive = i === currentIdx

          return (
            <div key={paso.estado} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-green-600 text-white ring-4 ring-green-100'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <div className="mt-1.5 text-center">
                  <p className={`text-xs font-medium whitespace-nowrap ${
                    isCompleted ? 'text-green-600' : isActive ? 'text-green-700 font-bold' : 'text-gray-400'
                  }`}>
                    {paso.label}
                  </p>
                </div>
              </div>
              {i < PASOS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface NuevaSolicitudFormProps {
  onSave: (s: SolicitudCompra) => void
  onCancel: () => void
  count: number
}

function NuevaSolicitudForm({ onSave, onCancel, count }: NuevaSolicitudFormProps) {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    solicitante: '',
    area: '',
    prioridad: 'media' as SolicitudCompra['prioridad'],
    fechaRequerida: '',
    notas: '',
    itemsRaw: [{ descripcion: '', cantidad: 1, unidad: 'u' }],
  })

  const setItemField = (idx: number, field: string, value: string | number) => {
    setForm((f) => ({
      ...f,
      itemsRaw: f.itemsRaw.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const s: SolicitudCompra = {
      id: generateId(),
      numero: generateNumero('SOL', count + 1),
      titulo: form.titulo,
      descripcion: form.descripcion,
      solicitante: form.solicitante,
      area: form.area,
      prioridad: form.prioridad,
      estado: 'solicitud',
      fechaCreacion: nowISO(),
      fechaRequerida: form.fechaRequerida || undefined,
      items: form.itemsRaw.filter((i) => i.descripcion.trim()),
      notas: form.notas || undefined,
    }
    onSave(s)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            required
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Ej: Compra de insumos de oficina"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante *</label>
          <input
            required
            value={form.solicitante}
            onChange={(e) => setForm((f) => ({ ...f, solicitante: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
          <input
            value={form.area}
            onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select
            value={form.prioridad}
            onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value as SolicitudCompra['prioridad'] }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha requerida</label>
          <input
            type="date"
            value={form.fechaRequerida}
            min={today()}
            onChange={(e) => setForm((f) => ({ ...f, fechaRequerida: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Ítems solicitados</label>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, itemsRaw: [...f.itemsRaw, { descripcion: '', cantidad: 1, unidad: 'u' }] }))}
            className="text-xs text-green-600 hover:text-green-800"
          >
            + Agregar ítem
          </button>
        </div>
        <div className="space-y-2">
          {form.itemsRaw.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item.descripcion}
                onChange={(e) => setItemField(i, 'descripcion', e.target.value)}
                placeholder="Descripción del ítem"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={(e) => setItemField(i, 'cantidad', Number(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              <input
                value={item.unidad}
                onChange={(e) => setItemField(i, 'unidad', e.target.value)}
                placeholder="u"
                className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
              {form.itemsRaw.length > 1 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, itemsRaw: f.itemsRaw.filter((_, j) => j !== i) }))}
                  className="text-gray-400 hover:text-red-500 px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          Crear solicitud
        </button>
        <button type="button" onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function FlujoCompras() {
  const { state, dispatch } = useAppContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<SolicitudCompra | null>(null)

  const pendientesAprobacion = state.solicitudes.filter((s) => s.estado === 'aprobacion')

  const handleSave = (s: SolicitudCompra) => {
    dispatch({ type: 'ADD_SOLICITUD', payload: s })
    setModalOpen(false)
  }

  const avanzar = (s: SolicitudCompra) => {
    const idx = getStepIndex(s.estado)
    if (idx < ORDEN_ESTADOS.length - 1) {
      dispatch({ type: 'UPDATE_SOLICITUD', payload: { ...s, estado: ORDEN_ESTADOS[idx + 1] } })
      setSelected((prev) => prev?.id === s.id ? { ...s, estado: ORDEN_ESTADOS[idx + 1] } : prev)
    }
  }

  const retroceder = (s: SolicitudCompra) => {
    const idx = getStepIndex(s.estado)
    if (idx > 0) {
      dispatch({ type: 'UPDATE_SOLICITUD', payload: { ...s, estado: ORDEN_ESTADOS[idx - 1] } })
      setSelected((prev) => prev?.id === s.id ? { ...s, estado: ORDEN_ESTADOS[idx - 1] } : prev)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Flujo de Compras</h2>
          <p className="text-gray-500 text-sm mt-1">
            {state.solicitudes.length} solicitudes · {pendientesAprobacion.length} pendientes de aprobación
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva solicitud
        </button>
      </div>

      {pendientesAprobacion.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Pendientes de aprobación ({pendientesAprobacion.length})
          </h3>
          <div className="space-y-2">
            {pendientesAprobacion.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-yellow-100">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{s.titulo}</p>
                  <p className="text-xs text-gray-500">{s.numero} · {s.solicitante}</p>
                </div>
                <button
                  onClick={() => avanzar(s)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                >
                  Aprobar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.solicitudes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No hay solicitudes. Creá una para iniciar el flujo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.solicitudes.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl border p-5 transition-colors cursor-pointer ${
                selected?.id === s.id ? 'border-green-500' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelected(selected?.id === s.id ? null : s)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{s.titulo}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORIDAD_COLORS[s.prioridad]}`}>
                      {s.prioridad.charAt(0).toUpperCase() + s.prioridad.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {s.numero} · {s.solicitante} · {s.area} · {formatDate(s.fechaCreacion)}
                  </p>
                </div>
                {s.fechaRequerida && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Requerida:</p>
                    <p className="text-sm font-medium text-gray-700">{formatDate(s.fechaRequerida)}</p>
                  </div>
                )}
              </div>

              <Timeline solicitud={s} />

              {selected?.id === s.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4" onClick={(e) => e.stopPropagation()}>
                  {s.items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ítems</p>
                      <ul className="space-y-1">
                        {s.items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            • {item.descripcion} — {item.cantidad} {item.unidad}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.descripcion && (
                    <p className="text-sm text-gray-600">{s.descripcion}</p>
                  )}
                  <div className="flex gap-2">
                    {getStepIndex(s.estado) < ORDEN_ESTADOS.length - 1 && (
                      <button
                        onClick={() => avanzar(s)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Avanzar → {PASOS[getStepIndex(s.estado) + 1]?.label}
                      </button>
                    )}
                    {getStepIndex(s.estado) > 0 && (
                      <button
                        onClick={() => retroceder(s)}
                        className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        ← Retroceder
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar esta solicitud?')) {
                          dispatch({ type: 'DELETE_SOLICITUD', payload: s.id })
                          setSelected(null)
                        }
                      }}
                      className="ml-auto text-red-500 hover:text-red-700 text-sm px-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Nueva solicitud de compra</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <NuevaSolicitudForm
                count={state.solicitudes.length}
                onSave={handleSave}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
