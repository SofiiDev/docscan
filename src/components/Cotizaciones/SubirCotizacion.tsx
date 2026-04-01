import { useState, useRef } from 'react'
import { useAppContext } from '../../context/AppContext'
import { extraerCotizacion } from '../../utils/claudeApi'
import { fileToBase64, isValidCotizacionFile, formatFileSize } from '../../utils/fileParser'
import { generateId, today } from '../../utils/helpers'
import type { Cotizacion, ItemCotizacion } from '../../types'

interface Props {
  onCotizacionAgregada?: (c: Cotizacion) => void
}

export default function SubirCotizacion({ onCotizacionAgregada }: Props) {
  const { state, dispatch } = useAppContext()
  const fileRef = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [proveedorId, setProveedorId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<Partial<Cotizacion> | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidCotizacionFile(f)) {
      setError('Formato no soportado. Use PDF, imagen, Word o Excel.')
      return
    }
    setArchivo(f)
    setError('')
    setPreview(null)
  }

  const handleExtract = async () => {
    if (!archivo || !proveedorId) {
      setError('Seleccione archivo y proveedor')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { base64, mediaType } = await fileToBase64(archivo)
      const rawJson = await extraerCotizacion(base64, mediaType, archivo.name)
      const jsonMatch = rawJson.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No se pudo extraer JSON de la respuesta')
      const parsed = JSON.parse(jsonMatch[0])
      const proveedor = state.proveedores.find((p) => p.id === proveedorId)
      const cot: Cotizacion = {
        id: generateId(),
        proveedorId,
        proveedorNombre: proveedor?.razonSocial ?? parsed.proveedor ?? 'Desconocido',
        fechaCotizacion: parsed.fecha ?? today(),
        items: (parsed.items ?? []).map((i: Partial<ItemCotizacion>) => ({
          descripcion: i.descripcion ?? '',
          cantidad: Number(i.cantidad ?? 1),
          unidad: i.unidad ?? 'u',
          precioUnitario: Number(i.precioUnitario ?? 0),
          precioTotal: Number(i.precioTotal ?? 0),
        })),
        total: Number(parsed.total ?? 0),
        plazoEntrega: parsed.plazoEntrega,
        condicionPago: parsed.condicionPago,
        notas: parsed.notas,
        archivo: archivo.name,
      }
      setPreview(cot)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error extrayendo cotización')
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = () => {
    if (!preview) return
    const cot = preview as Cotizacion
    dispatch({ type: 'ADD_COTIZACION', payload: cot })
    onCotizacionAgregada?.(cot)
    setArchivo(null)
    setProveedorId('')
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const proveedoresActivos = state.proveedores.filter((p) => p.estado === 'activo')

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">Subir cotización</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
          <select
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedoresActivos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.razonSocial}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo (PDF, imagen, Word, Excel) *
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.docx,.doc"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {archivo && (
            <p className="text-xs text-gray-500 mt-1">
              {archivo.name} ({formatFileSize(archivo.size)})
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleExtract}
        disabled={loading || !archivo || !proveedorId}
        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Extrayendo con IA...
          </>
        ) : (
          'Extraer cotización con IA'
        )}
      </button>

      {preview && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Vista previa — {(preview as Cotizacion).proveedorNombre}
            </span>
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Guardar cotización
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left">
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2 text-right">Cant.</th>
                  <th className="px-4 py-2">Unidad</th>
                  <th className="px-4 py-2 text-right">P. Unit.</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(preview.items ?? []).map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2">{item.descripcion}</td>
                    <td className="px-4 py-2 text-right">{item.cantidad}</td>
                    <td className="px-4 py-2">{item.unidad}</td>
                    <td className="px-4 py-2 text-right">${item.precioUnitario.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">${item.precioTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan={4} className="px-4 py-2 text-right">TOTAL</td>
                  <td className="px-4 py-2 text-right">${preview.total?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
