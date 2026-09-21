import { useState } from 'react';

function ValorCopiable({ valor }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = () => {
    navigator.clipboard.writeText(valor);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1200);
  };
  return (
    <div className="cred-value">
      <span>{valor}</span>
      <button className="copy-btn" onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</button>
    </div>
  );
}

export default function CredencialesPanel() {
  const credenciales = JSON.parse(localStorage.getItem('mc_credenciales') || '{}');
  const [abierto, setAbierto] = useState(true); // visible por defecto

  return (
    <div className="creds">
      <button className="creds-toggle" onClick={() => setAbierto((a) => !a)}>
        <div>
          <h2>Tus credenciales de sandbox</h2>
          <p className="desc">Usalas para probar acá abajo y para tu propio desarrollo — son las mismas.</p>
        </div>
        <span className={`creds-chevron ${abierto ? 'open' : ''}`}>▾</span>
      </button>

      {abierto && (
        <div className="creds-grid">
          <div className="cred-item"><label>API Key</label><ValorCopiable valor={credenciales.apiKey || '—'} /></div>
          <div className="cred-item"><label>Token</label><ValorCopiable valor={credenciales.token || '—'} /></div>
          <div className="cred-item"><label>URL</label><ValorCopiable valor={credenciales.url || '—'} /></div>
          <div className="cred-item"><label>Aplicación</label><ValorCopiable valor={credenciales.aplicacion || '—'} /></div>
        </div>
      )}
    </div>
  );
}