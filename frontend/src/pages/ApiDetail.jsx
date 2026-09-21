import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Topbar from '../components/Topbar';
import TesterPanel from '../components/TesterPanel';
import { jsonPretty } from '../components/jsonHighlight';
import { api } from '../api/client';

export default function ApiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiSpec, setApiSpec] = useState(null);
  const [error, setError] = useState(null);
  const [ejemploTab, setEjemploTab] = useState('enviar');

  useEffect(() => {
    api.catalogo()
      .then((data) => {
        const encontrada = data.apis.find((a) => a.id === id);
        if (!encontrada) throw new Error('No encontramos esa API en el catálogo.');
        setApiSpec(encontrada);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div className="container" style={{ padding: 40 }}>{error}</div>;
  if (!apiSpec) return <div className="container" style={{ padding: 40 }}>Cargando…</div>;

  const ejemploRequestCompleto = {
    aplicacion: '<tu_aplicacion>',
    operacion: apiSpec.endpoint,
    apiKey: '<tu_apiKey>',
    filtro: apiSpec.ejemploRequest,
  };

  return (
    <>
      <Topbar />
      <div className="container">
        <a className="breadcrumb" onClick={() => navigate('/catalogo')}>← Volver al catálogo</a>

        <div className="detail-grid">
          <div className="detail-panel">
            <div className="detail-head">
              <div className="card-top" style={{ marginBottom: 14 }}>
                <span className={`badge ${apiSpec.metodo}`}>{apiSpec.metodo}</span>
                <span className="card-endpoint">{apiSpec.endpoint}</span>
              </div>
              <h1>{apiSpec.titulo}</h1>
              <p className="lead">{apiSpec.descripcionLarga}</p>
            </div>

            <div className="detail-section">
              <h2>Parámetros</h2>
              <table className="params">
                <tbody>
                  <tr><th>Nombre</th><th>Tipo</th><th>Requerido</th><th>Descripción</th></tr>
                  {apiSpec.parametros.map((p) => (
                    <tr key={p.nombre}>
                      <td className="pname">{p.nombre}</td>
                      <td>{p.tipo}</td>
                      <td><span className={`req-flag ${p.requerido ? 'si' : 'no'}`}>{p.requerido ? 'Sí' : 'No'}</span></td>
                      <td>{p.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="detail-section">
              <h2>Ejemplo</h2>
              <div className="subtabs" style={{ marginBottom: 12 }}>
                <button className={`subtab-btn ${ejemploTab === 'enviar' ? 'active' : ''}`} onClick={() => setEjemploTab('enviar')}>Enviás</button>
                <button className={`subtab-btn ${ejemploTab === 'recibir' ? 'active' : ''}`} onClick={() => setEjemploTab('recibir')}>Recibís</button>
              </div>
              {ejemploTab === 'enviar' && <pre>{jsonPretty(ejemploRequestCompleto)}</pre>}
              {ejemploTab === 'recibir' && <pre>{jsonPretty(apiSpec.ejemploResponse)}</pre>}
            </div>

            <div className="detail-section">
              <h2>Errores posibles</h2>
              <table className="params">
                <tbody>
                  <tr><th>Código</th><th>HTTP</th><th>Mensaje</th></tr>
                  {apiSpec.errores.map((e) => (
                    <tr key={e.code}><td className="pname">{e.code}</td><td>{e.http}</td><td>{e.message}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <TesterPanel apiSpec={apiSpec} />
        </div>
      </div>
    </>
  );
}