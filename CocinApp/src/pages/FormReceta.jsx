import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "../css/form.css";

const FormReceta = ({host}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  // Estados
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [activeTab, setActiveTab] = useState("Agregar");
  const handleTabClick = (label) => {
    setActiveTab(label);
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
  
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((category) => category !== value));
    } else {
      if (selectedCategories.length < 4) {
        setSelectedCategories([...selectedCategories, value]);
      }else{
        alert('SOLO 4 CATEGORIAS');
      }
    }
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
    // const formCategory1 = document.getElementById('recipeCategory1').value;
    // const formCategory2 = document.getElementById('recipeCategory2').value;
    // const formCategory3 = document.getElementById('recipeCategory3').value;
    // const formCategory4 = document.getElementById('recipeCategory4').value;
    // let arrayCategories;
    console.log(formRecipeName)
    console.log(formDifficulty)
    console.log(formIngredients)
    console.log(formDescription)
    console.log(formSteps)
    console.log(formTiempo)
    console.log(selectedCategories)
    // //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    // if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length !== 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory2, formCategory3, formCategory4]; 
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length === 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory2, formCategory3]; 
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length !== 0 && formCategory3.length === 0 && formCategory4.length === 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory2]; 
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length === 0 && formCategory3.length === 0 && formCategory4.length === 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1]; 
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length === 0 && formCategory3.length === 0 && formCategory4.length !== 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory4];
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length === 0 && formCategory3.length !== 0 && formCategory4.length !== 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory3, formCategory4];
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length !== 0 && formCategory3.length !== 0 && formCategory4.length === 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory2, formCategory3];
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // } else if (formCategory2.length !== 0 && formCategory3.length === 0 && formCategory4.length !== 0){
    //   //Falta verificar que de los datos que lleguen (Como categorias) no sean iguales entre si.
    //   arrayCategories = [formCategory1, formCategory2, formCategory4];
    //   console.log(nombreUsuario);
    //   console.log(formRecipeName);
    //   console.log(formDifficulty);
    //   console.log(formDescription);
    //   console.log(formIngredients);
    //   console.log(formSteps);
    //   console.log(formTiempo);
    //   console.log(arrayCategories);
    // }
    setSelectedCategories([])
  }

  const llamadaDB =  (e) => {
    e.preventDefault();
    
  };

  // ------------ (intentar usar useRef) --------------

  // FORMULARIOS 
  const AddForm = () => (
    <form onSubmit={llamadaDB}>
      <label htmlFor="nombreReceta">Nombre de la Receta:</label>
      <input
      className="inptFormRecipe"
        type="text"
        id="recipename"
        placeholder="Nombre de receta"
        name="nombreReceta"
        required
      />
      
      <label htmlFor="recipeDiff">Dificultad:</label>     
      <select
        name="recipeDiff"
        className="selectRecipe"
        id="difficulty"
        required
      >
        <option value="">Dificultad</option>
        <option value="Fácil">Fácil</option>
        <option value="Medio">Medio</option>
        <option value="Difícil">Difícil</option>
      </select>

      <label htmlFor="recipeDiff">Categoria (4 max ):</label>  
      <div className="categorias">
      <select
        id="categories"
        multiple
        value={selectedCategories}
        onChange={(e)=>handleCategoryChange()}
      >
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
      <div className="chips">
        <strong>Seleccionado</strong>
        {selectedCategories.map((category) => (
          <span key={category} className="chip">
            {category} <button type="button" onClick={() => handleCategoryChange({ target: { value: category } })}>✕</button>
          </span>
        ))}
      </div>
      </div>
      <label htmlFor="descripcion">Descripción de la Receta:</label>
      <textarea
      className="textAreaDesc"
      type="text"
      id="description"
      placeholder="Descripcion..."
      required
      ></textarea>

     
    <label htmlFor="ingredientes">Ingredientes de la Receta:</label>
    <input
    className="inptFormRecipe"
        type="text"
        id="ingredients"
        placeholder='Ingredientes separados por ","'
        required
    />
    
    <label htmlFor="pasos">Pasos para la elaboración:</label>
    <input
    className="inptFormRecipe"
        type="text"
        id="steps"
        placeholder="Pasos de la"
        required
      />
      
      <label htmlFor="tiempo">Tiempo de preparación:</label>
      <input
      className="inptFormRecipe"
        type="text"
        id="tiempo"
        placeholder="30 minutos / 1 hora"
        required
      />
      
      <button type="submit">Enviar</button>
    </form>
  );


  const EditForm = () => (
    <form>
      <h3>Editar</h3>
      <input
      className="inptFormRecipe" type="text" placeholder="ID del elemento" required />
      <input
      className="inptFormRecipe" type="text" placeholder="Nuevo Nombre" required />
      <input
      className="inptFormRecipe" type="text" placeholder="Nueva Descripción" required />
      <button type="submit">Actualizar</button>
    </form>
  );
  const DelForm = () => (
    <form>
      <h3>ELIMINAR</h3>
      <input
      className="inptFormRecipe" type="text" placeholder="ID del elemento" required />
      <input
      className="inptFormRecipe" type="text" placeholder="Nuevo Nombre" required />
      <input
      className="inptFormRecipe" type="text" placeholder="Nueva Descripción" required />
      <button type="submit">Actualizar</button>
    </form>
  );

return (
  <>
    <div>
    <h2 className="title">Gestion de recetas</h2>
      <div className="form-content">
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
          {activeTab === "Agregar"  && <AddForm/>}
          {activeTab === "Editar"   && <EditForm/>}
          {activeTab === "Eliminar" && <DelForm/>}
        </div>
      </div>
    </div>
  </>
);
};
export default FormReceta;