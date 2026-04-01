import { useState } from 'react'
import type { Proveedor, EstadoProveedor, CondicionPago } from '../../types'
import { generateId, nowISO } from '../../utils/helpers'

interface Props {
  proveedor?: Proveedor
  onSave: (p: Proveedor) => void
  onCancel: () => void
}

const emptyForm = (): Omit<Proveedor, 'id' | 'fechaAlta' | 'rating'> => ({
  razonSocial: '',
  cuit: '',
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
  categoria: '',
  condicionPago: '30_dias',
  productos: '',
  notas: '',
  estado: 'activo',
})

export default function ProveedorForm({ proveedor, onSave, onCancel }: Props) {
  const [form, setForm] = useState(() =>
    proveedor
      ? { ...proveedor }
      : { ...emptyForm(), id: '', fechaAlta: '', rating: 0 }
  )

  const set = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Proveedor = {
      ...form,
      id: form.id || generateId(),
      fechaAlta: form.fechaAlta || nowISO(),
      rating: form.rating || 0,
    }
    onSave(p)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
          <input
            required
            value={form.razonSocial}
            onChange={(e) => set('razonSocial', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Empresa S.A."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CUIT *</label>
          <input
            required
            value={form.cuit}
            onChange={(e) => set('cuit', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="30-12345678-9"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
          <input
            value={form.contacto}
            onChange={(e) => set('contacto', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Nombre del contacto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="contacto@empresa.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => set('direccion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Av. Ejemplo 1234, CABA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <input
            value={form.categoria}
            onChange={(e) => set('categoria', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Tecnología, Insumos, Servicios..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condición de Pago</label>
          <select
            value={form.condicionPago}
            onChange={(e) => set('condicionPago', e.target.value as CondicionPago)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="contado">Contado</option>
            <option value="30_dias">30 días</option>
            <option value="60_dias">60 días</option>
            <option value="anticipado">Anticipado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insumos / Productos que vende
          </label>
          <textarea
            rows={2}
            value={form.productos}
            onChange={(e) => set('productos', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
            placeholder="Descripción de los productos o servicios que ofrece..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            value={form.estado}
            onChange={(e) => set('estado', e.target.value as EstadoProveedor)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="activo">Activo</option>
            <option value="en_revision">En revisión</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            rows={2}
            value={form.notas}
            onChange={(e) => set('notas', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
            placeholder="Notas adicionales..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          {proveedor ? 'Guardar cambios' : 'Agregar proveedor'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
