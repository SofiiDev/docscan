import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import type { EstadoOC, OrdenCompra } from '../../types'
import { generarTextoOC } from '../../utils/claudeApi'
import { formatCurrency, formatDate, nowISO } from '../../utils/helpers'

const ESTADO_LABELS: Record<EstadoOC, string> = {
  borrador: 'Borrador',
  enviada: 'Enviada',
  aprobada: 'Aprobada',
  recibida: 'Recibida',
  pagada: 'Pagada',
}

const ESTADO_COLORS: Record<EstadoOC, string> = {
  borrador: 'bg-gray-100 text-gray-600',
  enviada: 'bg-yellow-100 text-yellow-700',
  aprobada: 'bg-green-100 text-green-700',
  recibida: 'bg-blue-100 text-blue-700',
  pagada: 'bg-emerald-100 text-emerald-700',
}

const SIGUIENTES: Record<EstadoOC, EstadoOC | null> = {
  borrador: 'enviada',
  enviada: 'aprobada',
  aprobada: 'recibida',
  recibida: 'pagada',
  pagada: null,
}

const ACCIONES: Partial<Record<EstadoOC, string>> = {
  borrador: 'Enviar',
  enviada: 'Aprobar',
  aprobada: 'Marcar recibida',
  recibida: 'Marcar pagada',
}

export default function OrdenesCompra() {
  const { state, dispatch } = useAppContext()
  const [selected, setSelected] = useState<OrdenCompra | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<EstadoOC | 'todos'>('todos')
  const [loadingText, setLoadingText] = useState(false)
  const [ocText, setOcText] = useState('')

  const filtered = state.ordenes.filter(
    (o) => filtroEstado === 'todos' || o.estado === filtroEstado
  )

  const avanzarEstado = (oc: OrdenCompra) => {
    const siguiente = SIGUIENTES[oc.estado]
    if (!siguiente) return
    const updated: OrdenCompra = {
      ...oc,
      estado: siguiente,
      ...(siguiente === 'enviada' && { fechaEnvio: nowISO() }),
      ...(siguiente === 'aprobada' && { fechaAprobacion: nowISO() }),
      ...(siguiente === 'recibida' && { fechaEntrega: nowISO() }),
    }
    dispatch({ type: 'UPDATE_ORDEN', payload: updated })
    if (selected?.id === oc.id) setSelected(updated)
  }

  const handleGenerarTexto = async (oc: OrdenCompra) => {
    setLoadingText(true)
    setOcText('')
    try {
      const texto = await generarTextoOC({
        numero: oc.numero,
        proveedor: oc.proveedorNombre,
        items: oc.items,
        total: oc.total,
        condicionPago: undefined,
        notas: oc.notas,
      })
      setOcText(texto)
      dispatch({ type: 'UPDATE_ORDEN', payload: { ...oc, textoCotizacion: texto } })
    } catch (e: unknown) {
      setOcText(`Error: ${e instanceof Error ? e.message : 'Error generando OC'}`)
    } finally {
      setLoadingText(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Órdenes de Compra</h2>
          <p className="text-gray-500 text-sm mt-1">{state.ordenes.length} órdenes en total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'borrador', 'enviada', 'aprobada', 'recibida', 'pagada'] as const).map(
            (e) => (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtroEstado === e
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {e === 'todos' ? 'Todas' : ESTADO_LABELS[e]}
              </button>
            )
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No hay órdenes de compra. Generá una desde el módulo de Cotizaciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((oc) => (
            <div
              key={oc.id}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                selected?.id === oc.id ? 'border-green-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => { setSelected(selected?.id === oc.id ? null : oc); setOcText('') }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{oc.numero}</p>
                    <p className="text-sm text-gray-500">{oc.proveedorNombre}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLORS[oc.estado]}`}>
                    {ESTADO_LABELS[oc.estado]}
                  </span>
                  <span className="text-gray-700 font-semibold">{formatCurrency(oc.total)}</span>
                  <span className="text-xs text-gray-400">{formatDate(oc.fechaCreacion)}</span>
                </div>
              </div>

              {selected?.id === oc.id && (
                <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="border-t border-gray-100 pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs uppercase">
                          <th className="text-left pb-2">Descripción</th>
                          <th className="text-right pb-2">Cant.</th>
                          <th className="text-right pb-2">P. Unit.</th>
                          <th className="text-right pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oc.items.map((item, i) => (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="py-1.5">{item.descripcion}</td>
                            <td className="py-1.5 text-right">{item.cantidad} {item.unidad}</td>
                            <td className="py-1.5 text-right">{formatCurrency(item.precioUnitario)}</td>
                            <td className="py-1.5 text-right">{formatCurrency(item.precioTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200 text-xs text-gray-500">
                          <td colSpan={3} className="py-1.5 text-right">Subtotal</td>
                          <td className="py-1.5 text-right">{formatCurrency(oc.subtotal)}</td>
                        </tr>
                        <tr className="text-xs text-gray-500">
                          <td colSpan={3} className="py-1.5 text-right">IVA 21%</td>
                          <td className="py-1.5 text-right">{formatCurrency(oc.iva)}</td>
                        </tr>
                        <tr className="font-bold">
                          <td colSpan={3} className="py-1.5 text-right">TOTAL</td>
                          <td className="py-1.5 text-right">{formatCurrency(oc.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {SIGUIENTES[oc.estado] && (
                      <button
                        onClick={() => avanzarEstado(oc)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        {ACCIONES[oc.estado]}
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerarTexto(oc)}
                      disabled={loadingText}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingText ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Generando...
                        </>
                      ) : (
                        'Generar OC formal con IA'
                      )}
                    </button>
                  </div>

                  {(ocText || oc.textoCotizacion) && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Texto de Orden de Compra
                        </p>
                        <button
                          onClick={() => navigator.clipboard.writeText(ocText || oc.textoCotizacion || '')}
                          className="text-xs text-gray-400 hover:text-gray-700"
                        >
                          Copiar
                        </button>
                      </div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                        {ocText || oc.textoCotizacion}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
