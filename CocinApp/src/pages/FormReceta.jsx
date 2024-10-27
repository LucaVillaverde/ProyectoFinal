import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Tabs from "../components/Tabs/Tabs";

export const FormReceta = () => {
  const { localUsername } = useParams();
  const tabData = [
    { label: 'AGREGAR', content: 'Contenido de Tab 1' },
    { label: 'EDITAR', content: 'Contenido de Tab 2' },
    { label: 'ELIMINAR', content: 'Contenido de Tab 3' },
  ];

  const llamadaDB = async () => {
    try{
      const postForm = await axios.post(`${host}/api/receta-nueva`,{
        
      })
    }catch(err){
      console.error(err);
    }
  }

  return (
    <div>
      <h2 className='title' >Formularios</h2>
     <Tabs tabs={tabData} />
    </div>
  );
};

