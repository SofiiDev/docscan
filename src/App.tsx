import { useState } from 'react'
import { AppProvider, useAppContext } from './context/AppContext'
import Layout from './components/shared/Layout'
import ComparadorCotizaciones from './components/Cotizaciones/ComparadorCotizaciones'
import GestionProveedores from './components/Proveedores/GestionProveedores'
import OrdenesCompra from './components/Ordenes/OrdenesCompra'
import FlujoCompras from './components/Flujo/FlujoCompras'
import RemitosYPagos from './components/Remitos/RemitosYPagos'

type ModuleId = 'cotizaciones' | 'proveedores' | 'ordenes' | 'flujo' | 'remitos'

function IconCotizaciones() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function IconProveedores() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function IconOrdenes() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )
}
function IconFlujo() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
function IconRemitos() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function AppShell() {
  const { state } = useAppContext()
  const [activeModule, setActiveModule] = useState<ModuleId>('flujo')

  const pendientesFlujo = state.solicitudes.filter((s) => s.estado === 'aprobacion').length
  const ocPendientes = state.ordenes.filter((o) => o.estado === 'enviada').length

  const navItems = [
    { id: 'flujo', label: 'Flujo de Compras', icon: <IconFlujo />, badge: pendientesFlujo },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: <IconCotizaciones /> },
    { id: 'proveedores', label: 'Proveedores', icon: <IconProveedores /> },
    { id: 'ordenes', label: 'Órdenes de Compra', icon: <IconOrdenes />, badge: ocPendientes },
    { id: 'remitos', label: 'Remitos y Pagos', icon: <IconRemitos /> },
  ]

  return (
    <Layout
      navItems={navItems}
      activeId={activeModule}
      onNavChange={(id) => setActiveModule(id as ModuleId)}
    >
      {activeModule === 'cotizaciones' && <ComparadorCotizaciones />}
      {activeModule === 'proveedores' && <GestionProveedores />}
      {activeModule === 'ordenes' && <OrdenesCompra />}
      {activeModule === 'flujo' && <FlujoCompras />}
      {activeModule === 'remitos' && <RemitosYPagos />}
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
