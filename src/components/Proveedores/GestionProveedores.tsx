import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import ProveedorForm from './ProveedorForm'
import type { Proveedor, EstadoProveedor } from '../../types'

const ESTADO_LABELS: Record<EstadoProveedor, string> = {
  activo: 'Activo',
  en_revision: 'En revisión',
  inactivo: 'Inactivo',
}

const ESTADO_COLORS: Record<EstadoProveedor, string> = {
  activo: 'bg-green-100 text-green-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  inactivo: 'bg-gray-100 text-gray-500',
}

const COND_LABELS: Record<string, string> = {
  contado: 'Contado',
  '30_dias': '30 días',
  '60_dias': '60 días',
  anticipado: 'Anticipado',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default function GestionProveedores() {
  const { state, dispatch } = useAppContext()
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Proveedor | undefined>()
  const [filtroEstado, setFiltroEstado] = useState<EstadoProveedor | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState<Proveedor | null>(null)

  const filtered = state.proveedores.filter((p) => {
    const matchEstado = filtroEstado === 'todos' || p.estado === filtroEstado
    const matchBusq =
      !busqueda ||
      p.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cuit.includes(busqueda) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusq
  })

  const handleSave = (p: Proveedor) => {
    if (editando) {
      dispatch({ type: 'UPDATE_PROVEEDOR', payload: p })
    } else {
      dispatch({ type: 'ADD_PROVEEDOR', payload: p })
    }
    setModalOpen(false)
    setEditando(undefined)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar proveedor? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'DELETE_PROVEEDOR', payload: id })
      if (detalle?.id === id) setDetalle(null)
    }
  }

  const handleEdit = (p: Proveedor) => {
    setEditando(p)
    setModalOpen(true)
    setDetalle(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Proveedores</h2>
          <p className="text-gray-500 text-sm mt-1">{state.proveedores.length} proveedores registrados</p>
        </div>
        <button
          onClick={() => { setEditando(undefined); setModalOpen(true) }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo proveedor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre, CUIT, categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoProveedor | 'todos')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="en_revision">En revisión</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No hay proveedores. Hacé clic en "Nuevo proveedor" para agregar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Razón Social</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">CUIT</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Cond. Pago</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left text-gray-600 font-semibold">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setDetalle(detalle?.id === p.id ? null : p)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{p.razonSocial}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.cuit}</td>
                    <td className="px-4 py-3 text-gray-600">{p.categoria || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{COND_LABELS[p.condicionPago] ?? p.condicionPago}</td>
                    <td className="px-4 py-3"><StarRating rating={p.rating} /></td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLORS[p.estado]}`}>
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="text-gray-400 hover:text-gray-700 p-1"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detalle */}
      {detalle && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-gray-800 text-lg">{detalle.razonSocial}</h3>
            <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {[
              ['CUIT', detalle.cuit],
              ['Contacto', detalle.contacto],
              ['Teléfono', detalle.telefono],
              ['Email', detalle.email],
              ['Dirección', detalle.direccion],
              ['Categoría', detalle.categoria],
              ['Condición de pago', COND_LABELS[detalle.condicionPago]],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-gray-800 font-medium mt-0.5">{value || '—'}</p>
              </div>
            ))}
          </div>
          {detalle.productos && (
            <div>
              <p className="text-xs text-gray-500">Productos / Servicios</p>
              <p className="text-sm text-gray-700 mt-0.5">{detalle.productos}</p>
            </div>
          )}
          {detalle.notas && (
            <div>
              <p className="text-xs text-gray-500">Notas</p>
              <p className="text-sm text-gray-700 mt-0.5">{detalle.notas}</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                {editando ? 'Editar proveedor' : 'Nuevo proveedor'}
              </h3>
              <button
                onClick={() => { setModalOpen(false); setEditando(undefined) }}
                className="text-gray-400 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProveedorForm
                proveedor={editando}
                onSave={handleSave}
                onCancel={() => { setModalOpen(false); setEditando(undefined) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
