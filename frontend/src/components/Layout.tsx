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
    <div className="flex min-h-screen bg-[#F6F8FC] text-slate-900">
      <aside className="w-72 border-r border-slate-200 bg-white p-6 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4361EE] text-white font-bold text-lg shadow-sm">
              CT
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Cartagena Tours</h2>
              <p className="text-xs text-slate-500 font-medium">Generador de Itinerarios</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-2.5 text-sm transition font-medium ${
                    isActive
                      ? 'bg-[#4361EE] text-white font-semibold shadow-sm shadow-[#4361EE]/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4361EE] font-bold text-xs">
              {(user?.fullName || 'OP').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user?.fullName || 'Operador'}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || 'Sin sesión'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
