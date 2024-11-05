import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // `null` indica que aún no se ha determinado

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/protection");
        if (response.status === 200) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error(err);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Mientras se verifica la autenticación, puedes mostrar un indicador de carga o nada
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Si no está autenticado, redirige a la página de inicio
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si está autenticado, muestra el contenido de la ruta
  return children;
};

export default ProtectedRoute;
