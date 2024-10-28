import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import "../css/tabs.css";

const FormReceta = ({ host }) => {
  // Estados
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [activeTab, setActiveTab] = useState("Agregar");
  const handleTabClick = (label) => {
    setActiveTab(label);
  };

  useEffect(() => {
    const id_user = Cookies.get("id_user");
    const obtenerNombre = async () => {
      try {
        const response = await axios.post(`${host}/api/info-usuario`, {
          id_user,
        });
        if (response.status === 200) {
          setNombreUsuario(response.data.username);
        }
      } catch (err) {
        console.error(err);
      }
    };

    obtenerNombre();
  }, []);

  const manejadorDeEnvio = (event) => {
    event.preventDefault();
    const formRecipeName = document.getElementById('recipename').value;
    const formDifficulty = document.getElementById('difficulty').value;
    const formDescription = document.getElementById('description').value;
    const formIngredients = document.getElementById('ingredients').value;
    const formSteps = document.getElementById('steps').value;
    const formTiempo = document.getElementById('tiempo').value;
    const formCategory1 = document.getElementById('recipeCategory1').value;
    const formCategory2 = document.getElementById('recipeCategory2').value;
    const formCategory3 = document.getElementById('recipeCategory3').value;
    const formCategory4 = document.getElementById('recipeCategory4').value;
    let arrayCategories;
    //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length !== 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory2, formCategory3, formCategory4]; 
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length === 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory2, formCategory3]; 
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length !== 0 && formCategory3.length === 0 && formCategory4.length === 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory2]; 
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length === 0 && formCategory3.length === 0 && formCategory4.length === 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1]; 
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length === 0 && formCategory3.length === 0 && formCategory4.length !== 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory4];
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length === 0 && formCategory3.length !== 0 && formCategory4.length !== 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory3, formCategory4];
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length === 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory2, formCategory3];
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    } else if (formCategory2.length !== 0 && formCategory3.length === 0 && formCategory4.length !== 0){
      //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
      arrayCategories = [formCategory1, formCategory2, formCategory4];
      console.log(nombreUsuario);
      console.log(formRecipeName);
      console.log(formDifficulty);
      console.log(formDescription);
      console.log(formIngredients);
      console.log(formSteps);
      console.log(formTiempo);
      console.log(arrayCategories);
    }
    // console.log(`El nombre de la receta es: ${nombreUsuario, formRecipeName, formDifficulty, formDescription, formIngredients, formSteps, formTiempo }`);
  }

  const llamadaDB =  (e) => {
    e.preventDefault();
    console.log("hola turu");
    // try {
    //   const postForm = await axios.post(`${host}/api/receta-nueva`, {
    //     username:    nombreUsuario,
    //     recipe_name: recipeName,
    //     difficulty:  recipeDiff,
    //     description: description,
    //     ingredients: ingredients,
    //     steps:       steps,
    //     categories: [`${formData.category1}, ${formData.category2}, ${formData.category3}, ${formData.category4}`],
    //     tiempo:      tiempo,
    //   })
    //   if (postForm === 201) {
    //     window.alert("Se ha creado la receta");
    //   }
    // } catch (err) {
    //   console.error(err);
    // };
  };



// );
  const AddForm2 = () => (
    <form onSubmit={manejadorDeEnvio}>
      <label htmlFor="nombreReceta">Nombre de la Receta:</label>
      <input
        type="text"
        id="recipename"
        placeholder="Nombre de receta"
        name="nombreReceta"
        required
      />
      <br />
      <label htmlFor="recipeDiff">Dificultad:</label>
      <select
        name="recipeDiff"
        id="difficulty"
        required
      >
        <option value="">Dificultad</option>
        <option value="Fácil">Fácil</option>
        <option value="Medio">Medio</option>
        <option value="Difícil">Difícil</option>
      </select>
      <br />
      <label required htmlFor="recipeCategory1">Categorias:</label>
      <select required name="recipeCategory1" id="recipeCategory1">
        <option value=''>Categoria Obligatoria</option>
        <option value="Entrada">Entrada</option>
        <option value="Sopa">Sopa</option>
        <option value="Caldo">Caldo</option>
        <option value="Ensalada">Ensalada</option>
        <option value="Plato Principal">Plato Principal</option>
        <option value="Guarnición">Guarnición</option>
        <option value="Postre">Postre</option>
        <option value="Bebida">Bebida</option>
        <option value="Vegetariana">Vegetariana</option>
        <option value="Saludable">Saludable</option>
      </select>
      <label htmlFor="recipeCategory2"></label>
      <select name="recipeCategory2" id="recipeCategory2">
        <option value=''>Categoria Opcional</option>
        <option value="Entrada">Entrada</option>
        <option value="Sopa">Sopa</option>
        <option value="Caldo">Caldo</option>
        <option value="Ensalada">Ensalada</option>
        <option value="Plato Principal">Plato Principal</option>
        <option value="Guarnición">Guarnición</option>
        <option value="Postre">Postre</option>
        <option value="Bebida">Bebida</option>
        <option value="Vegetariana">Vegetariana</option>
        <option value="Saludable">Saludable</option>
      </select>
      <label htmlFor="recipeCategory3"></label>
      <select name="recipeCategory3" id="recipeCategory3">
        <option value=''>Categoria Opcional</option>
        <option value="Entrada">Entrada</option>
        <option value="Sopa">Sopa</option>
        <option value="Caldo">Caldo</option>
        <option value="Ensalada">Ensalada</option>
        <option value="Plato Principal">Plato Principal</option>
        <option value="Guarnición">Guarnición</option>
        <option value="Postre">Postre</option>
        <option value="Bebida">Bebida</option>
        <option value="Vegetariana">Vegetariana</option>
        <option value="Saludable">Saludable</option>
      </select>
      <label htmlFor="recipeCategory4"></label>
      <select name="recipeCategory4" id="recipeCategory4">
        <option value=''>Categoria Opcional</option>
        <option value="Entrada">Entrada</option>
        <option value="Sopa">Sopa</option>
        <option value="Caldo">Caldo</option>
        <option value="Ensalada">Ensalada</option>
        <option value="Plato Principal">Plato Principal</option>
        <option value="Guarnición">Guarnición</option>
        <option value="Postre">Postre</option>
        <option value="Bebida">Bebida</option>
        <option value="Vegetariana">Vegetariana</option>
        <option value="Saludable">Saludable</option>
      </select>
      
      <br/>
      <label htmlFor="descripcion">Descripción de la Receta:</label>
      <input
        type="text"
        id="description"
        placeholder="Descripcion"
        required
      />
     <br />
    <label htmlFor="ingredientes">Ingredientes de la Receta:</label>
    <input
        type="text"
        id="ingredients"
        placeholder='Ingredientes separados por ","'
        required
    />
    <br />
    <label htmlFor="pasos">Pasos para la elaboración:</label>
    <input
        type="text"
        id="steps"
        placeholder="Pasos de la"
        required
      />
      <br />
      <label htmlFor="tiempo">Tiempo de preparación:</label>
      <input
        type="text"
        id="tiempo"
        placeholder="30 minutos / 1 hora"
        required
      />
      <br />
      <button type="submit">Enviar</button>
    </form>
  );



  
  const EditForm = () => (
    <form>
      <h3>Editar</h3>
      <input type="text" placeholder="ID del elemento" required />
      <input type="text" placeholder="Nuevo Nombre" required />
      <input type="text" placeholder="Nueva Descripción" required />
      <button type="submit">Actualizar</button>
    </form>
  );
  const DelForm = () => (
    <form>
      <h3>ELIMINAR</h3>
      <input type="text" placeholder="ID del elemento" required />
      <input type="text" placeholder="Nuevo Nombre" required />
      <input type="text" placeholder="Nueva Descripción" required />
      <button type="submit">Actualizar</button>
    </form>
  );

return (
  <div>
    <h2 className="title">Gestion de recetas</h2>
    <div>
      <div>
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "Agregar" ? "active" : ""}`}
            onClick={() => handleTabClick("Agregar")}
          >
            Agregar
          </button>
          <button
            className={`tab-button ${activeTab === "Editar" ? "active" : ""}`}
            onClick={() => handleTabClick("Editar")}
          >
            Editar
          </button>
          <button
            className={`tab-button ${activeTab === "Buscar" ? "active" : ""}`}
            onClick={() => handleTabClick("Eliminar")}
          >
            ELIMINAR
          </button>
        </div>
        <div className="tab-content">
          {activeTab === "Agregar" && <AddForm2 />}
          {activeTab === "Editar" && <EditForm />}
          {activeTab === "Eliminar" && <DelForm />}
        </div>
      </div>
    </div>
  </div>
);
};
export default FormReceta;