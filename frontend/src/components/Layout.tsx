import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken, getStoredUser } from '../lib/auth';

const navItems = [
  { to: '/itineraries', label: 'Itinerarios (Principal)' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clients', label: 'Clientes' },
  { to: '/activities', label: 'Actividades y Horarios' },
];

const Layout = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-72 border-r border-slate-800 bg-slate-900 p-6">
        <div>
          <h2 className="text-xl font-semibold">Cartagena Tours</h2>
          <p className="mt-1 text-sm text-slate-400">Panel de operador</p>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm transition ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-800/70 p-4">
          <p className="text-sm font-semibold">{user?.fullName || 'Operador'}</p>
          <p className="text-xs text-slate-400">{user?.email || 'Sin sesión'}</p>
          <button onClick={handleLogout} className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
