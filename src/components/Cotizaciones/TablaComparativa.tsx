import { useMemo } from 'react'
import type { Cotizacion } from '../../types'
import { formatCurrency } from '../../utils/helpers'

interface Props {
  cotizaciones: Cotizacion[]
}

interface RowItem {
  descripcion: string
  valores: (number | null)[] // one per cotizacion
  minIdx: number
  maxIdx: number
}

export default function TablaComparativa({ cotizaciones }: Props) {
  const rows = useMemo<RowItem[]>(() => {
    // Collect all unique item descriptions
    const descSet = new Set<string>()
    cotizaciones.forEach((c) => c.items.forEach((i) => descSet.add(i.descripcion)))
    const descs = Array.from(descSet)

    return descs.map((desc) => {
      const valores = cotizaciones.map((c) => {
        const item = c.items.find(
          (i) => i.descripcion.toLowerCase() === desc.toLowerCase()
        )
        return item ? item.precioTotal : null
      })
      const nonNull = valores.filter((v) => v !== null) as number[]
      const minVal = nonNull.length ? Math.min(...nonNull) : -1
      const maxVal = nonNull.length ? Math.max(...nonNull) : -1
      const minIdx = nonNull.length > 1 ? valores.findIndex((v) => v === minVal) : -1
      const maxIdx = nonNull.length > 1 ? valores.findIndex((v) => v === maxVal) : -1
      return { descripcion: desc, valores, minIdx, maxIdx }
    })
  }, [cotizaciones])

  const totales = cotizaciones.map((c) => c.total)
  const nonNullTotales = totales.filter((t) => t > 0)
  const minTotal = nonNullTotales.length ? Math.min(...nonNullTotales) : -1
  const maxTotal = nonNullTotales.length ? Math.max(...nonNullTotales) : -1

  if (cotizaciones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No hay cotizaciones para comparar.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left text-gray-700 font-semibold min-w-[200px]">
              Ítem
            </th>
            {cotizaciones.map((c) => (
              <th key={c.id} className="px-4 py-3 text-center text-gray-700 font-semibold min-w-[150px]">
                {c.proveedorNombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-2.5 font-medium text-gray-800">{row.descripcion}</td>
              {row.valores.map((val, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 text-center font-medium rounded-sm ${
                    val === null
                      ? 'text-gray-400'
                      : j === row.minIdx && row.minIdx !== row.maxIdx
                      ? 'bg-green-100 text-green-800'
                      : j === row.maxIdx && row.minIdx !== row.maxIdx
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700'
                  }`}
                >
                  {val === null ? '—' : formatCurrency(val)}
                  {j === row.minIdx && row.minIdx !== row.maxIdx && (
                    <span className="ml-1 text-green-600 text-xs font-bold">★</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
            <td className="px-4 py-3 text-gray-800">TOTAL</td>
            {totales.map((t, j) => (
              <td
                key={j}
                className={`px-4 py-3 text-center ${
                  t === minTotal && minTotal !== maxTotal
                    ? 'text-green-700'
                    : t === maxTotal && minTotal !== maxTotal
                    ? 'text-red-600'
                    : 'text-gray-800'
                }`}
              >
                {formatCurrency(t)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-200 rounded-sm inline-block" /> Mejor precio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-red-200 rounded-sm inline-block" /> Peor precio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-green-600 font-bold text-sm">★</span> Precio más bajo
        </span>
      </div>
    </div>
  )
}
