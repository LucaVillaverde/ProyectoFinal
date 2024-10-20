import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export const FormReceta = () => {
    console.log(user);
  return (
    <>
      {form === 0 ? (
        <div>Formulario 0</div>
      ) : form === 1 ? (
        <div>Formulario 1</div>
      ) : form === 2 ? (
        <div>Formulario 2</div>
      ) : form === undefined ?(
        <Navigate to={`/mis-recetas/:${user}`} />
      ) : (
        <Navigate to={`/mis-recetas/:${user}`} />
      )}
    </>
  );
};

