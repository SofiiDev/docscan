// ============================================================
// PROVEEDORES
// ============================================================
export type EstadoProveedor = 'activo' | 'en_revision' | 'inactivo'
export type CondicionPago = '30_dias' | '60_dias' | 'contado' | 'anticipado'

export interface Proveedor {
  id: string
  razonSocial: string
  cuit: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  categoria: string
  condicionPago: CondicionPago
  productos: string
  notas: string
  estado: EstadoProveedor
  rating: number // 1-5
  fechaAlta: string
}

// ============================================================
// COTIZACIONES
// ============================================================
export interface ItemCotizacion {
  descripcion: string
  cantidad: number
  unidad: string
  precioUnitario: number
  precioTotal: number
}

export interface Cotizacion {
  id: string
  proveedorId: string
  proveedorNombre: string
  fechaCotizacion: string
  items: ItemCotizacion[]
  total: number
  plazoEntrega?: string
  condicionPago?: string
  notas?: string
  archivo?: string
}

export interface ComparacionCotizacion {
  solicitudId: string
  cotizaciones: Cotizacion[]
  recomendacionIA?: string
  fechaComparacion: string
}

// ============================================================
// ÓRDENES DE COMPRA
// ============================================================
export type EstadoOC =
  | 'borrador'
  | 'enviada'
  | 'aprobada'
  | 'recibida'
  | 'pagada'

export interface ItemOC {
  descripcion: string
  cantidad: number
  unidad: string
  precioUnitario: number
  precioTotal: number
}

export interface OrdenCompra {
  id: string
  numero: string
  proveedorId: string
  proveedorNombre: string
  estado: EstadoOC
  fechaCreacion: string
  fechaEnvio?: string
  fechaAprobacion?: string
  fechaEntrega?: string
  items: ItemOC[]
  subtotal: number
  iva: number
  total: number
  notas?: string
  solicitudId?: string
  cotizacionId?: string
  textoCotizacion?: string
  aprobadoPor?: string
}

// ============================================================
// SOLICITUDES DE COMPRA / FLUJO
// ============================================================
export type EstadoSolicitud =
  | 'solicitud'
  | 'cotizaciones'
  | 'comparacion'
  | 'aceptacion'
  | 'oc_generada'
  | 'aprobacion'
  | 'entrega'
  | 'remito'
  | 'pago'

export interface SolicitudCompra {
  id: string
  numero: string
  titulo: string
  descripcion: string
  solicitante: string
  area: string
  prioridad: 'alta' | 'media' | 'baja'
  estado: EstadoSolicitud
  fechaCreacion: string
  fechaRequerida?: string
  items: { descripcion: string; cantidad: number; unidad: string }[]
  notas?: string
  ocId?: string
}

// ============================================================
// REMITOS Y PAGOS
// ============================================================
export type MetodoPago = 'transferencia' | 'cheque' | 'efectivo'

export interface ItemRemito {
  descripcion: string
  cantidadOC: number
  cantidadRecibida: number
  unidad: string
  diferencia: number
}

export interface Remito {
  id: string
  ocId: string
  proveedorId: string
  proveedorNombre: string
  numeroRemito: string
  fechaRecepcion: string
  items: ItemRemito[]
  hayDiferencias: boolean
  notasDiferencias?: string
  archivoAdjunto?: string
}

export interface Pago {
  id: string
  ocId: string
  proveedorId: string
  proveedorNombre: string
  monto: number
  metodo: MetodoPago
  fecha: string
  referencia: string
  notas?: string
  comprobante?: string
}

// ============================================================
// STORE STATE
// ============================================================
export interface AppState {
  proveedores: Proveedor[]
  cotizaciones: Cotizacion[]
  comparaciones: ComparacionCotizacion[]
  ordenes: OrdenCompra[]
  solicitudes: SolicitudCompra[]
  remitos: Remito[]
  pagos: Pago[]
}
