import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { saveToken } from '../lib/auth';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('carmenalvarezmar@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      // 1. Intentar autenticación vía Supabase Auth
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!supaError && supaData.session) {
        saveToken(supaData.session.access_token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: supaData.user.id,
            email: supaData.user.email,
            fullName: supaData.user.user_metadata?.full_name || 'Operador',
          })
        );
        navigate('/itineraries');
        return;
      }

      // 2. Fallback al backend API JWT
      const { data } = await api.post('/auth/login', { email, password });
      saveToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/itineraries');
    } catch {
      setError('Credenciales inválidas. Intenta de nuevo.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FC] px-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4361EE] text-white font-bold text-lg shadow-sm">
            CT
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Cartagena Tours</h2>
            <p className="text-xs text-slate-500 font-medium">Generador de Itinerarios</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900">Iniciar sesión</h3>
        <p className="mt-1 text-sm text-slate-500">Accede al panel de operadores turísticos.</p>
        <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-600">
          <span className="font-semibold">Acceso directo:</span> carmenalvarezmar@gmail.com / 12345678
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Correo electrónico</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Contraseña</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/20"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? <p className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-medium text-rose-600">{error}</p> : null}

          <button className="w-full rounded-xl bg-[#4361EE] py-2.5 text-sm font-bold text-white shadow-md shadow-[#4361EE]/20 transition hover:bg-[#3730A3]">
            Entrar al sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
