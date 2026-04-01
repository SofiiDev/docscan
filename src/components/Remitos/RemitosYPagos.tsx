import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import type { Remito, Pago, MetodoPago, ItemRemito, OrdenCompra } from '../../types'
import { generateId, formatCurrency, formatDate, nowISO, today } from '../../utils/helpers'
import { formatFileSize, isValidCotizacionFile } from '../../utils/fileParser'

type Tab = 'remitos' | 'pagos'

const METODO_LABELS: Record<MetodoPago, string> = {
  transferencia: 'Transferencia',
  cheque: 'Cheque',
  efectivo: 'Efectivo',
}

// ── Nuevo Remito Form ─────────────────────────────────────────────────────────
function NuevoRemitoForm({ oc, onSave, onCancel }: {
  oc: OrdenCompra
  onSave: (r: Remito) => void
  onCancel: () => void
}) {
  const [numeroRemito, setNumeroRemito] = useState('')
  const [fechaRecepcion, setFechaRecepcion] = useState(today())
  const [notasDiferencias, setNotasDiferencias] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [cantidades, setCantidades] = useState<number[]>(oc.items.map((i) => i.cantidad))

  const items: ItemRemito[] = oc.items.map((item, i) => ({
    descripcion: item.descripcion,
    cantidadOC: item.cantidad,
    cantidadRecibida: cantidades[i] ?? item.cantidad,
    unidad: item.unidad,
    diferencia: (cantidades[i] ?? item.cantidad) - item.cantidad,
  }))

  const hayDiferencias = items.some((i) => i.diferencia !== 0)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && isValidCotizacionFile(f)) setArchivo(f)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const remito: Remito = {
      id: generateId(),
      ocId: oc.id,
      proveedorId: oc.proveedorId,
      proveedorNombre: oc.proveedorNombre,
      numeroRemito,
      fechaRecepcion,
      items,
      hayDiferencias,
      notasDiferencias: notasDiferencias || undefined,
      archivoAdjunto: archivo?.name,
    }
    onSave(remito)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N° de Remito *</label>
          <input
            required
            value={numeroRemito}
            onChange={(e) => setNumeroRemito(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="0001-00001234"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de recepción *</label>
          <input
            type="date"
            required
            value={fechaRecepcion}
            onChange={(e) => setFechaRecepcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adjuntar remito escaneado
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFile}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          {archivo && <p className="text-xs text-gray-500 mt-1">{archivo.name} ({formatFileSize(archivo.size)})</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Cantidades recibidas</p>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="px-4 py-2 text-left">Ítem</th>
                <th className="px-4 py-2 text-center">Cant. OC</th>
                <th className="px-4 py-2 text-center">Cant. recibida</th>
                <th className="px-4 py-2 text-center">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {oc.items.map((item, i) => {
                const diff = (cantidades[i] ?? item.cantidad) - item.cantidad
                return (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2">{item.descripcion}</td>
                    <td className="px-4 py-2 text-center">{item.cantidad} {item.unidad}</td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        value={cantidades[i] ?? item.cantidad}
                        onChange={(e) => setCantidades((prev) => {
                          const next = [...prev]
                          next[i] = Number(e.target.value)
                          return next
                        })}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-green-500 outline-none"
                      />
                    </td>
                    <td className={`px-4 py-2 text-center font-medium ${diff < 0 ? 'text-red-600' : diff > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {hayDiferencias && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas sobre diferencias</label>
            <textarea
              rows={2}
              value={notasDiferencias}
              onChange={(e) => setNotasDiferencias(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder="Detalle las diferencias encontradas..."
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          Registrar remito
        </button>
        <button type="button" onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Nuevo Pago Form ───────────────────────────────────────────────────────────
function NuevoPagoForm({ ordenes, onSave, onCancel }: {
  ordenes: OrdenCompra[]
  onSave: (p: Pago) => void
  onCancel: () => void
}) {
  const [ocId, setOcId] = useState('')
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<MetodoPago>('transferencia')
  const [fecha, setFecha] = useState(today())
  const [referencia, setReferencia] = useState('')
  const [notas, setNotas] = useState('')

  const oc = ordenes.find((o) => o.id === ocId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oc) return
    const pago: Pago = {
      id: generateId(),
      ocId,
      proveedorId: oc.proveedorId,
      proveedorNombre: oc.proveedorNombre,
      monto: Number(monto),
      metodo,
      fecha,
      referencia,
      notas: notas || undefined,
    }
    onSave(pago)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Compra *</label>
          <select
            required
            value={ocId}
            onChange={(e) => setOcId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Seleccionar OC...</option>
            {ordenes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.numero} — {o.proveedorNombre} ({formatCurrency(o.total)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago *</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as MetodoPago)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="transferencia">Transferencia</option>
            <option value="cheque">Cheque</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Comprobante</label>
          <input
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="N° de comprobante, CBU, etc."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          Registrar pago
        </button>
        <button type="button" onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RemitosYPagos() {
  const { state, dispatch } = useAppContext()
  const [tab, setTab] = useState<Tab>('remitos')
  const [modalRemito, setModalRemito] = useState(false)
  const [modalPago, setModalPago] = useState(false)
  const [ocParaRemito, setOcParaRemito] = useState<OrdenCompra | null>(null)
  const [filtroProveedor, setFiltroProveedor] = useState('')

  const ordenesConRemito = state.ordenes.filter(
    (o) => o.estado === 'aprobada' || o.estado === 'recibida' || o.estado === 'pagada'
  )

  const handleSaveRemito = (r: Remito) => {
    dispatch({ type: 'ADD_REMITO', payload: r })
    // Advance OC state to recibida
    const oc = state.ordenes.find((o) => o.id === r.ocId)
    if (oc && oc.estado === 'aprobada') {
      dispatch({ type: 'UPDATE_ORDEN', payload: { ...oc, estado: 'recibida', fechaEntrega: nowISO() } })
    }
    setModalRemito(false)
    setOcParaRemito(null)
  }

  const handleSavePago = (p: Pago) => {
    dispatch({ type: 'ADD_PAGO', payload: p })
    const oc = state.ordenes.find((o) => o.id === p.ocId)
    if (oc && oc.estado === 'recibida') {
      dispatch({ type: 'UPDATE_ORDEN', payload: { ...oc, estado: 'pagada' } })
    }
    setModalPago(false)
  }

  const remitosFiltrados = state.remitos.filter(
    (r) => !filtroProveedor || r.proveedorNombre.toLowerCase().includes(filtroProveedor.toLowerCase())
  )
  const pagosFiltrados = state.pagos.filter(
    (p) => !filtroProveedor || p.proveedorNombre.toLowerCase().includes(filtroProveedor.toLowerCase())
  )

  const totalPagado = pagosFiltrados.reduce((s, p) => s + p.monto, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Remitos y Pagos</h2>
          <p className="text-gray-500 text-sm mt-1">
            {state.remitos.length} remitos · {state.pagos.length} pagos registrados
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setOcParaRemito(null); setModalRemito(true) }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
          >
            + Registrar remito
          </button>
          <button
            onClick={() => setModalPago(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
          >
            + Registrar pago
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['remitos', 'pagos'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filter */}
      <input
        type="text"
        placeholder="Filtrar por proveedor..."
        value={filtroProveedor}
        onChange={(e) => setFiltroProveedor(e.target.value)}
        className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
      />

      {tab === 'remitos' && (
        <div className="space-y-3">
          {remitosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
              No hay remitos registrados.
            </div>
          ) : (
            remitosFiltrados.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">Remito N° {r.numeroRemito}</p>
                    <p className="text-sm text-gray-500">{r.proveedorNombre} · {formatDate(r.fechaRecepcion)}</p>
                  </div>
                  {r.hayDiferencias && (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      Con diferencias
                    </span>
                  )}
                  {!r.hayDiferencias && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Conforme
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100">
                        <th className="text-left pb-1">Ítem</th>
                        <th className="text-center pb-1">Cant. OC</th>
                        <th className="text-center pb-1">Recibida</th>
                        <th className="text-center pb-1">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items.map((item, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="py-1">{item.descripcion}</td>
                          <td className="py-1 text-center">{item.cantidadOC} {item.unidad}</td>
                          <td className="py-1 text-center">{item.cantidadRecibida}</td>
                          <td className={`py-1 text-center font-medium ${item.diferencia < 0 ? 'text-red-600' : item.diferencia > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {item.diferencia > 0 ? `+${item.diferencia}` : item.diferencia}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {r.notasDiferencias && (
                  <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded">{r.notasDiferencias}</p>
                )}
                {r.archivoAdjunto && (
                  <p className="mt-1.5 text-xs text-gray-500">📎 {r.archivoAdjunto}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'pagos' && (
        <div className="space-y-3">
          {pagosFiltrados.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center justify-between">
              <p className="text-sm text-emerald-700 font-medium">Total pagado</p>
              <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalPagado)}</p>
            </div>
          )}
          {pagosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
              No hay pagos registrados.
            </div>
          ) : (
            pagosFiltrados.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{p.proveedorNombre}</p>
                  <p className="text-xs text-gray-500">
                    {METODO_LABELS[p.metodo]} · {formatDate(p.fecha)} · Ref: {p.referencia || '—'}
                  </p>
                  {p.notas && <p className="text-xs text-gray-500 mt-0.5">{p.notas}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">{formatCurrency(p.monto)}</p>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_PAGO', payload: p.id })}
                    className="text-xs text-red-400 hover:text-red-600 mt-1"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Remito */}
      {modalRemito && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Registrar Remito</h3>
              <button onClick={() => { setModalRemito(false); setOcParaRemito(null) }} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {!ocParaRemito ? (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Seleccionar Orden de Compra:</p>
                  {ordenesConRemito.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay OC aprobadas disponibles para registrar remito.</p>
                  ) : (
                    <div className="space-y-2">
                      {ordenesConRemito.map((oc) => (
                        <button
                          key={oc.id}
                          onClick={() => setOcParaRemito(oc)}
                          className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:border-green-400 hover:bg-green-50 transition-colors"
                        >
                          <p className="font-medium text-gray-800">{oc.numero}</p>
                          <p className="text-sm text-gray-500">{oc.proveedorNombre} · {formatCurrency(oc.total)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NuevoRemitoForm
                  oc={ocParaRemito}
                  onSave={handleSaveRemito}
                  onCancel={() => { setModalRemito(false); setOcParaRemito(null) }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pago */}
      {modalPago && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Registrar Pago</h3>
              <button onClick={() => setModalPago(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <NuevoPagoForm
                ordenes={state.ordenes}
                onSave={handleSavePago}
                onCancel={() => setModalPago(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
