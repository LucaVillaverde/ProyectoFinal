import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { axios } from 'axios';

export const FormReceta = () => {
  const { localUsername } = useParams();
  const [form, setForm] = useState(0);
  // HOST intercambiables
// const host = 'http://localhost:5000';
const host = 'http://pruebita.webhop.me:5000';

  const agregar = () => {
    setForm(1);
  }

  const editar = () => {
    setForm(2);
  }

  const eliminar = () => {
    setForm(3);
  }

  const verifEstado = (e) => {
    e.preventDefault();
    console.log(form);
  }

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
      <span>Usuario {localUsername} favor de selecciónar una opción:</span>
      <form onSubmit={(e) => verifEstado(e)}>
        <label for='form'>Modo Agregar Receta:</label>
        <input name='form' onChange={agregar} type='radio'></input>
        <br></br>
        <label for='form'>Modo Editar Receta</label>
        <input name='form' onChange={editar} type='radio'></input>
        <br></br>
        <label for='form'>Modo Eliminar Receta</label>
        <input name='form' onChange={eliminar} type='radio'></input>
        <button type='submit'>Verificar Estado</button>
      </form>
      <br></br>
      <br></br>
      {form === 0 ?(
        <>
        <span>Favor de seleccionar un modo</span>
        </>
      ) : form === 1 ? (
        <>
          <form id="formReceta" onSubmit={llamadaDB}>
          <label for='nombreReceta'>Nombre de la Receta:</label>
          <input type='text' value={recipe_name} placeholder='Nombre de la receta' name='nombreReceta'/>
          <br></br>

          <label for='dificultad'>Dificultad de la Receta:</label>
          <select name='dificultad'>
            <option value='fácil'>Fácil</option>
            <option value='medio'>Medio</option>
            <option value='dificil'>Difícil</option>
          </select>
          <br></br>

          <label for='descripcion'>Descripción de la Receta:</label>
          <input type='text' name='descripcion' placeholder='Un postre muy saludable sin mucha porquería'/>
          <br></br>

          <label for='ingredientes'>Ingredientes de la Receta:</label>
          <input type='text' name='ingredientes' placeholder='1/2cda de azúcar, 1kg de NO PAPA'/>
          <br></br>

          <label for='pasos'>Pasos para la elaboración</label>
          <input type='text' name='pasos' placeholder='1ro Pelamos la papa'/>
          <br></br>

          <label for='categoria'>Favor de indicar categoría/s de la receta:</label>
          <input type='text' id='categoria' placeholder='Postre, Entrada, Saludable'/>
          <br></br>

          <label for='tiempo'>Tiempo de preparación</label>
          <input type='text' name='tiempo' placeholder='30 minutos / 1 horas'></input>
          <br></br>

          <button type='submit'>Enviar</button>
          </form>
        </>
      ) : form === 2 ? (
        <>
        <span>Usted ha seleccionado el formulario para editar recetas.</span>
        </>
      ) : (
        <>
        <span>Usted ha seleccionado el formulario para eliminar recetas.</span>
        </>
      )}
    </div>
  );
};

