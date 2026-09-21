import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Catalogo from './pages/Catalogo';
import ApiDetail from './pages/ApiDetail';
import RutaPrivada from './components/RutaPrivada';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalogo" element={<RutaPrivada><Catalogo /></RutaPrivada>} />
        <Route path="/catalogo/:id" element={<RutaPrivada><ApiDetail /></RutaPrivada>} />
      </Routes>
    </BrowserRouter>
  );
}
