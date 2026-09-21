import { Navigate } from 'react-router-dom';

export default function RutaPrivada({ children }) {
  const token = localStorage.getItem('mc_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
