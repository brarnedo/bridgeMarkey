import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import CredencialesPanel from "../components/CredencialesPanel";
import { api } from "../api/client";

export default function Catalogo() {
  const navigate = useNavigate();
  const [catalogo, setCatalogo] = useState(null);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState("turnos");
  const [filtro, setFiltro] = useState("");
  const [vista, setVista] = useState("grid");

  useEffect(() => {
    api
      .catalogo()
      .then((data) => {
        setCatalogo(data);
        if (data.categorias?.length) setCategoriaActiva(data.categorias[0].key);
      })
      .catch((err) => setError(err.message));
  }, []);

  const categoria = useMemo(
    () => catalogo?.categorias.find((c) => c.key === categoriaActiva),
    [catalogo, categoriaActiva],
  );

  const items = useMemo(() => {
    if (!catalogo) return [];
    return catalogo.apis.filter(
      (a) =>
        a.categoria === categoriaActiva &&
        a.titulo.toLowerCase().includes(filtro.toLowerCase()),
    );
  }, [catalogo, categoriaActiva, filtro]);

  const hayApisEnCategoria = useMemo(() => {
    if (!catalogo) return false;
    return catalogo.apis.some((a) => a.categoria === categoriaActiva);
  }, [catalogo, categoriaActiva]);

  if (error)
    return (
      <div className="container" style={{ padding: 40 }}>
        No pudimos cargar el catálogo: {error}
      </div>
    );
  if (!catalogo)
    return (
      <div className="container" style={{ padding: 40 }}>
        Cargando catálogo…
      </div>
    );

  return (
    <>
      <Topbar />
      <div className="portal-screen">
        <div className="container">
          <div className="hero-block">
            <h1>Turnos de Markey, listos para tu integración</h1>
            <p>
              Consultá disponibilidad, reservá y gestioná turnos en tiempo real
              con los mismos datos que va a usar el consultorio, sin acceso
              directo a su base.
            </p>
          </div>

          <CredencialesPanel />

          <div className="catalog-layout">
            <div className="sidebar-panel">
              <p className="sidebar-title">Categorías</p>
              {catalogo.categorias.map((c) => (
                <button
                  key={c.key}
                  className={`cat-item ${c.key === categoriaActiva ? "active" : ""}`}
                  onClick={() => {
                    setCategoriaActiva(c.key);
                    setFiltro("");
                  }}
                >
                  <span>{c.label}</span>

                  <span className="cat-count">
                    {(() => {
                      const n = catalogo.apis.filter(
                        (a) => a.categoria === c.key,
                      ).length;
                      return n > 0 ? n : "·";
                    })()}
                  </span>
                </button>
              ))}
            </div>

            <div className="apis-panel">
              <div className="section-head">
                <h2>{categoria?.label}</h2>
                <p>
                  {hayApisEnCategoria
                    ? `${items.length} de un catálogo en crecimiento`
                    : `${categoria?.countPlanificado || 0} APIs planificadas`}
                </p>
              </div>

              {!hayApisEnCategoria ? (
                <div className="empty-state">
                  <strong>Estamos documentando esta categoría</strong>
                  Las APIs de {categoria?.label.toLowerCase()} van a sumarse al
                  catálogo en las próximas semanas.
                </div>
              ) : (
                <>
                  <div className="apis-toolbar">
                    <input
                      className="filter-input"
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                    />
                    <div className="view-toggle">
                      <button
                        className={`view-btn ${vista === "grid" ? "active" : ""}`}
                        onClick={() => setVista("grid")}
                      >
                        ▦
                      </button>
                      <button
                        className={`view-btn ${vista === "list" ? "active" : ""}`}
                        onClick={() => setVista("list")}
                      >
                        ☰
                      </button>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div className="empty-state">
                      <strong>Sin resultados</strong>No encontramos APIs que
                      coincidan con "{filtro}".
                    </div>
                  ) : (
                    <div
                      className={`cards-grid ${vista === "list" ? "list" : ""}`}
                    >
                      {items.map((a) => (
                        <div
                          key={a.id}
                          className="api-card"
                          onClick={() => navigate(`/catalogo/${a.id}`)}
                        >
                          <div className="card-top">
                            <span className={`badge ${a.metodo}`}>
                              {a.metodo}
                            </span>
                            <span className="card-endpoint">{a.endpoint}</span>
                          </div>
                          <h3>{a.titulo}</h3>
                          <p className="desc">{a.descripcion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
