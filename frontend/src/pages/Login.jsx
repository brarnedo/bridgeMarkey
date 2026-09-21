import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [form, setForm] = useState({ email: '', password: '', empresa: '' });
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const onChange = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const data = modo === 'login' ? await api.login(form) : await api.registro(form);
      localStorage.setItem('mc_token', data.token);
      localStorage.setItem('mc_credenciales', JSON.stringify(data.credenciales));
      navigate('/catalogo');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="brand"><span className="brand-mark"></span>Markey Connect</div>
        </div>
      </div>
      <div className="login-screen">
        <form className="login-card" onSubmit={onSubmit}>
          <div className="login-mark"></div>
          <h1>{modo === 'login' ? 'Ingresá a Markey Connect' : 'Creá tu cuenta de sandbox'}</h1>
          <p className="sub">
            Probá la disponibilidad, reserva y gestión de turnos con datos de un entorno de pruebas, antes de integrarlo en tu desarrollo.
          </p>

          {error && <div className="form-error">{error}</div>}

          {modo === 'registro' && (
            <div className="field">
              <label>Empresa</label>
              <input type="text" value={form.empresa} onChange={onChange('empresa')} placeholder="Chatbot Salud SRL" required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={onChange('email')} placeholder="empresa@chatbotsalud.com" required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={form.password} onChange={onChange('password')} placeholder="••••••••••" required />
          </div>

          <button className="btn-primary" type="submit" disabled={cargando}>
            {cargando ? 'Un momento…' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>

          <div className="login-footer">
            {modo === 'login' ? (
              <>¿Todavía no tenés acceso? <a onClick={() => setModo('registro')}>Solicitalo acá</a></>
            ) : (
              <>¿Ya tenés cuenta? <a onClick={() => setModo('login')}>Ingresá</a></>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
