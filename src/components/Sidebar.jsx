import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: '◈' },
  { to: '/factures', label: 'Factures', icon: '◻' },
  { to: '/clients', label: 'Clients', icon: '◎' },
  { to: '/factures/nouvelle', label: 'Nouvelle facture', icon: '+' },
  { to: '/parametres', label: 'Paramètres', icon: '⚙' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-blue-950 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-blue-900">
        <h1 className="text-lg font-bold tracking-tight text-white">Théo Lambret</h1>
        <p className="text-xs text-blue-400 mt-0.5">Facturation freelance</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-900 hover:text-white'
              }`
            }
          >
            <span className="text-base w-4 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-blue-900 text-xs text-blue-500">
        SIRET 941 296 998 00011
      </div>
    </aside>
  )
}
