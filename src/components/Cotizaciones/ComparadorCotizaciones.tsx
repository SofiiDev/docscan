import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import SubirCotizacion from './SubirCotizacion'
import TablaComparativa from './TablaComparativa'
import { generarRecomendacion } from '../../utils/claudeApi'
import { generateId, generateNumero, nowISO, formatCurrency } from '../../utils/helpers'
import type { Cotizacion, OrdenCompra } from '../../types'

export default function ComparadorCotizaciones() {
  const { state, dispatch } = useAppContext()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [recomendacion, setRecomendacion] = useState('')
  const [loadingRec, setLoadingRec] = useState(false)
  const [errorRec, setErrorRec] = useState('')
  const [ocCreada, setOcCreada] = useState(false)

  const cotizacionesSeleccionadas = state.cotizaciones.filter((c) => selectedIds.includes(c.id))

  const toggleCot = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setRecomendacion('')
    setOcCreada(false)
  }

  const handleRecomendacion = async () => {
    if (cotizacionesSeleccionadas.length < 2) return
    setLoadingRec(true)
    setErrorRec('')
    try {
      const resumen = cotizacionesSeleccionadas
        .map(
          (c) =>
            `Proveedor: ${c.proveedorNombre}\nTotal: ${formatCurrency(c.total)}\nCondición: ${c.condicionPago ?? 'no especificada'}\nPlazo: ${c.plazoEntrega ?? 'no especificado'}`
        )
        .join('\n\n')
      const rec = await generarRecomendacion(resumen)
      setRecomendacion(rec)
    } catch (e: unknown) {
      setErrorRec(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoadingRec(false)
    }
  }

  const handleConvertirOC = (cotizacion: Cotizacion) => {
    const oc: OrdenCompra = {
      id: generateId(),
      numero: generateNumero('OC', state.ordenes.length + 1),
      proveedorId: cotizacion.proveedorId,
      proveedorNombre: cotizacion.proveedorNombre,
      estado: 'borrador',
      fechaCreacion: nowISO(),
      items: cotizacion.items.map((i) => ({ ...i })),
      subtotal: cotizacion.total,
      iva: +(cotizacion.total * 0.21).toFixed(2),
      total: +(cotizacion.total * 1.21).toFixed(2),
      cotizacionId: cotizacion.id,
    }
    dispatch({ type: 'ADD_ORDEN', payload: oc })
    setOcCreada(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Comparar Cotizaciones</h2>
        <p className="text-gray-500 text-sm mt-1">
          Subí cotizaciones de distintos proveedores y comparalas automáticamente.
        </p>
      </div>

      <SubirCotizacion />

      {state.cotizaciones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Seleccionar cotizaciones para comparar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.cotizaciones.map((c) => (
              <label
                key={c.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedIds.includes(c.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleCot(c.id)}
                  className="mt-0.5 accent-green-600"
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{c.proveedorNombre}</p>
                  <p className="text-xs text-gray-500">{c.fechaCotizacion}</p>
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(c.total)}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {cotizacionesSeleccionadas.length >= 2 && (
        <>
          <TablaComparativa cotizaciones={cotizacionesSeleccionadas} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRecomendacion}
              disabled={loadingRec}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loadingRec ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generando recomendación...
                </>
              ) : (
                'Recomendación IA'
              )}
            </button>
          </div>

          {errorRec && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {errorRec}
            </div>
          )}

          {recomendacion && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.375 3.375 0 0113.5 19.5h-3a3.375 3.375 0 01-2.38-.988l-.347-.347a5 5 0 010-7.072z" />
                </svg>
                Recomendación de IA
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{recomendacion}</p>
              <div className="border-t border-green-200 pt-4">
                <p className="text-sm text-gray-600 font-medium mb-3">Convertir cotización en Orden de Compra:</p>
                <div className="flex flex-wrap gap-2">
                  {cotizacionesSeleccionadas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleConvertirOC(c)}
                      className="bg-white border border-green-500 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50"
                    >
                      Generar OC — {c.proveedorNombre}
                    </button>
                  ))}
                </div>
                {ocCreada && (
                  <p className="mt-2 text-green-700 text-sm font-medium">
                    ✓ Orden de Compra creada exitosamente. Podés verla en el módulo de OC.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
