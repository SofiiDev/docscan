import { useState, type ReactNode } from 'react'

type NavItem = {
  id: string
  label: string
  icon: ReactNode
  badge?: number
}

interface Props {
  navItems: NavItem[]
  activeId: string
  onNavChange: (id: string) => void
  children: ReactNode
}

export default function Layout({ navItems, activeId, onNavChange, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NavLink = ({ item }: { item: NavItem }) => (
    <button
      onClick={() => { onNavChange(item.id); setSidebarOpen(false) }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
        activeId === item.id
          ? 'bg-green-600 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={`flex-shrink-0 ${activeId === item.id ? 'text-white' : 'text-gray-400'}`}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeId === item.id ? 'bg-white text-green-700' : 'bg-yellow-400 text-white'}`}>
          {item.badge}
        </span>
      )}
    </button>
  )

  const activeItem = navItems.find((n) => n.id === activeId)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-base hidden sm:block">ComprasApp</span>
          </div>
          <div className="flex-1 min-w-0 lg:hidden">
            <span className="text-sm font-medium text-gray-700 truncate block">
              {activeItem?.label}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">ComprasApp v1.0</p>
            <p className="text-xs text-gray-400">Powered by Claude AI</p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
