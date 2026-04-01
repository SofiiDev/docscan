import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type {
  AppState,
  Proveedor,
  Cotizacion,
  ComparacionCotizacion,
  OrdenCompra,
  SolicitudCompra,
  Remito,
  Pago,
} from '../types'

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState: AppState = {
  proveedores: [],
  cotizaciones: [],
  comparaciones: [],
  ordenes: [],
  solicitudes: [],
  remitos: [],
  pagos: [],
}

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  // Proveedores
  | { type: 'ADD_PROVEEDOR'; payload: Proveedor }
  | { type: 'UPDATE_PROVEEDOR'; payload: Proveedor }
  | { type: 'DELETE_PROVEEDOR'; payload: string }
  // Cotizaciones
  | { type: 'ADD_COTIZACION'; payload: Cotizacion }
  | { type: 'UPDATE_COTIZACION'; payload: Cotizacion }
  | { type: 'DELETE_COTIZACION'; payload: string }
  // Comparaciones
  | { type: 'ADD_COMPARACION'; payload: ComparacionCotizacion }
  | { type: 'UPDATE_COMPARACION'; payload: ComparacionCotizacion }
  // Órdenes
  | { type: 'ADD_ORDEN'; payload: OrdenCompra }
  | { type: 'UPDATE_ORDEN'; payload: OrdenCompra }
  | { type: 'DELETE_ORDEN'; payload: string }
  // Solicitudes
  | { type: 'ADD_SOLICITUD'; payload: SolicitudCompra }
  | { type: 'UPDATE_SOLICITUD'; payload: SolicitudCompra }
  | { type: 'DELETE_SOLICITUD'; payload: string }
  // Remitos
  | { type: 'ADD_REMITO'; payload: Remito }
  | { type: 'UPDATE_REMITO'; payload: Remito }
  // Pagos
  | { type: 'ADD_PAGO'; payload: Pago }
  | { type: 'DELETE_PAGO'; payload: string }
  // Reset
  | { type: 'LOAD_STATE'; payload: AppState }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'ADD_PROVEEDOR':
      return { ...state, proveedores: [...state.proveedores, action.payload] }
    case 'UPDATE_PROVEEDOR':
      return {
        ...state,
        proveedores: state.proveedores.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      }
    case 'DELETE_PROVEEDOR':
      return { ...state, proveedores: state.proveedores.filter((p) => p.id !== action.payload) }

    case 'ADD_COTIZACION':
      return { ...state, cotizaciones: [...state.cotizaciones, action.payload] }
    case 'UPDATE_COTIZACION':
      return {
        ...state,
        cotizaciones: state.cotizaciones.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      }
    case 'DELETE_COTIZACION':
      return { ...state, cotizaciones: state.cotizaciones.filter((c) => c.id !== action.payload) }

    case 'ADD_COMPARACION':
      return { ...state, comparaciones: [...state.comparaciones, action.payload] }
    case 'UPDATE_COMPARACION':
      return {
        ...state,
        comparaciones: state.comparaciones.map((c) =>
          c.solicitudId === action.payload.solicitudId ? action.payload : c
        ),
      }

    case 'ADD_ORDEN':
      return { ...state, ordenes: [...state.ordenes, action.payload] }
    case 'UPDATE_ORDEN':
      return {
        ...state,
        ordenes: state.ordenes.map((o) => (o.id === action.payload.id ? action.payload : o)),
      }
    case 'DELETE_ORDEN':
      return { ...state, ordenes: state.ordenes.filter((o) => o.id !== action.payload) }

    case 'ADD_SOLICITUD':
      return { ...state, solicitudes: [...state.solicitudes, action.payload] }
    case 'UPDATE_SOLICITUD':
      return {
        ...state,
        solicitudes: state.solicitudes.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      }
    case 'DELETE_SOLICITUD':
      return { ...state, solicitudes: state.solicitudes.filter((s) => s.id !== action.payload) }

    case 'ADD_REMITO':
      return { ...state, remitos: [...state.remitos, action.payload] }
    case 'UPDATE_REMITO':
      return {
        ...state,
        remitos: state.remitos.map((r) => (r.id === action.payload.id ? action.payload : r)),
      }

    case 'ADD_PAGO':
      return { ...state, pagos: [...state.pagos, action.payload] }
    case 'DELETE_PAGO':
      return { ...state, pagos: state.pagos.filter((p) => p.id !== action.payload) }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

const STORAGE_KEY = 'compras-app-state'

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...initialState, ...JSON.parse(saved) }
    } catch {
      // ignore parse errors
    }
    return initialState
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
