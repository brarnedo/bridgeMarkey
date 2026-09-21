import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('mc_token');
    localStorage.removeItem('mc_credenciales');
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="brand"><span className="brand-mark"></span>Markey Bridge</div>
        <div className="topbar-right">
          <span className="env-badge">Entorno: Sandbox</span>
          <div className="user-chip"><div className="avatar">CS</div>Tu empresa</div>
          <a className="logout-link" onClick={cerrarSesion}>Cerrar sesión</a>
        </div>
      </div>
    </div>
  );
}
