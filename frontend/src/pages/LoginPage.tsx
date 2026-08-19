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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold text-white">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-slate-400">Accede al panel de operadores turísticos.</p>
        <p className="mt-2 text-xs text-slate-500">Acceso directo: carmenalvarezmar@gmail.com / 12345678</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Correo</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">Contraseña</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-400">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
