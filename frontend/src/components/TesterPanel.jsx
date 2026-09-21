import { useState } from 'react';
import { jsonPretty } from './jsonHighlight';
import { api } from '../api/client';

export default function TesterPanel({ apiSpec }) {
  const credencialesDefault = JSON.parse(localStorage.getItem('mc_credenciales') || '{}');
  const [subTab, setSubTab] = useState('parametros'); // 'conexion' | 'parametros'
  const [conexion, setConexion] = useState({
    apiKey: credencialesDefault.apiKey || '',
    token: credencialesDefault.token || '',
    url: credencialesDefault.url || '',
    aplicacion: credencialesDefault.aplicacion || '',
  });
  const [valores, setValores] = useState(apiSpec.ejemploRequest);
  const [tab, setTab] = useState('respuesta');
  const [respuesta, setRespuesta] = useState(null);
  const [ejecutando, setEjecutando] = useState(false);

  const onChangeConexion = (campo) => (e) => setConexion((c) => ({ ...c, [campo]: e.target.value }));
  const onChangeValor = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));

  const ejecutar = async () => {
    setEjecutando(true);
    setRespuesta(null);
    try {
      const data = await api.ejecutar({ endpoint: apiSpec.endpoint, filtro: valores, ...conexion });
      setRespuesta(data);
    } catch (err) {
      setRespuesta({ error: err.message });
    } finally {
      setEjecutando(false);
    }
  };

  const bodyGateway = (vals) => jsonPretty({ aplicacion: conexion.aplicacion, apiKey: conexion.apiKey, operacion: apiSpec.endpoint, filtro: vals });
  const curl = `curl -X POST ${conexion.url} \\\n  -H "Content-Type: application/json" \\\n  -H "token: ${conexion.token}" \\\n  -d '${bodyGateway(valores)}'`;
  const js = `const res = await fetch("${conexion.url}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json", "token": "${conexion.token}" },\n  body: JSON.stringify(${bodyGateway(valores)})\n});\nconst data = await res.json();`;

  const copiar = (texto) => navigator.clipboard.writeText(texto);

  return (
    <aside className="tester-panel">
      <h2>Probar esta API</h2>
      <p className="sub">{apiSpec.endpoint}</p>

      <div className="subtabs">
        <button className={`subtab-btn ${subTab === 'parametros' ? 'active' : ''}`} onClick={() => setSubTab('parametros')}>
          Parámetros
        </button>
        <button className={`subtab-btn ${subTab === 'conexion' ? 'active' : ''}`} onClick={() => setSubTab('conexion')}>
          Conexión
        </button>
      </div>

      <div className="subtab-body">
        {subTab === 'conexion' ? (
          <>
            <p className="hint">Precargado con tu sandbox — pisalo si querés probar con otras credenciales (por ejemplo, las de producción de un cliente).</p>
            <div className="tfield"><label>apiKey</label><input value={conexion.apiKey} onChange={onChangeConexion('apiKey')} /></div>
            <div className="tfield"><label>token</label><input value={conexion.token} onChange={onChangeConexion('token')} /></div>
            <div className="tfield"><label>url</label><input value={conexion.url} onChange={onChangeConexion('url')} /></div>
            <div className="tfield"><label>aplicacion</label><input value={conexion.aplicacion} onChange={onChangeConexion('aplicacion')} /></div>
          </>
        ) : (
          apiSpec.parametros.map((p) => (
            <div className="tfield" key={p.nombre}>
              <label>{p.nombre} {p.requerido ? '' : '(opcional)'}</label>
              <input value={valores[p.nombre] ?? ''} onChange={onChangeValor(p.nombre)} placeholder={p.tipo} />
            </div>
          ))
        )}
      </div>

      <button className="btn-exec" onClick={ejecutar} disabled={ejecutando}>
        {ejecutando ? 'Ejecutando…' : 'Ejecutar'}
      </button>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'respuesta' ? 'active' : ''}`} onClick={() => setTab('respuesta')}>Respuesta</button>
        <button className={`tab-btn ${tab === 'curl' ? 'active' : ''}`} onClick={() => setTab('curl')}>cURL</button>
        <button className={`tab-btn ${tab === 'js' ? 'active' : ''}`} onClick={() => setTab('js')}>JavaScript</button>
      </div>

      {tab === 'respuesta' && <pre>{respuesta ? jsonPretty(respuesta) : 'Ejecutá la llamada para ver la respuesta acá.'}</pre>}
      {tab === 'curl' && <div className="snippet-wrap"><pre>{curl}</pre><button className="copy-btn snippet-copy" onClick={() => copiar(curl)}>Copiar</button></div>}
      {tab === 'js' && <div className="snippet-wrap"><pre>{js}</pre><button className="copy-btn snippet-copy" onClick={() => copiar(js)}>Copiar</button></div>}
    </aside>
  );
}