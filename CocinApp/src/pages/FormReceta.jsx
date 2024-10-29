import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "../css/form.css";

// Estados
const FormReceta = ({host}) => {
  // const [selectedCategories, setSelectedCategories] = useState([]);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [activeTab, setActiveTab] = useState("Agregar");
  const [formData, setFormData] = useState({
    recipe_name: "",
    difficulty: "",
    categories: [],
    description: "",
    ingredients: [],
    steps: [],
    tiempo: "",
  });
  const formDataCategories = formData.categories;
  const recipe_name = document.getElementById("recipename").value;
  const difficulty = document.getElementById("difficulty").value;
  const categories = document.getElementById("categories").value;
  const description = document.getElementById("description").value;
  const ingredients = document.getElementById("ingredients").value;
  const steps = document.getElementById("steps").value;
  const tiempo = document.getElementById("tiempo").value;

  const handleTabClick = (label) => {
    setActiveTab(label);
  };

  const handleChange = (e) => {
    const { value } = e.target;

    if (e.target.id === "categories"){
      if (selectedCategories.includes(value)) {
        setSelectedCategories(selectedCategories.filter((category) => category !== value));
      } else {
        if (selectedCategories.length < 4) {
          setSelectedCategories([...selectedCategories, value]);
        }else{
          alert('SOLO 4 CATEGORIAS');
        }
      } 
    } else {
      setFormData(value)
    }
  };

  const llamadaDB =  (e) => {
    e.preventDefault();
    
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

  // ------------ (intentar usar useRef) --------------

  // FORMULARIOS 
  const AddForm = () => (
    <form onSubmit={llamadaDB}>
      <label htmlFor="nombreReceta">Nombre de la Receta:</label>
      <input
      className="inptFormRecipe"
        type="text"
        id="recipename"
        onChange={setFormData.recipe_name(recipename)}
        placeholder="Nombre de receta"
        name="nombreReceta"
        required
      />
      
      <label htmlFor="recipeDiff">Dificultad:</label>     
      <select
        name="recipeDiff"
        className="selectRecipe"
        onChange={setFormData.difficulty(difficulty)}
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
        onChange={setFormData.categories(categories)}
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
        {formDataCategories.map((category) => (
          <span key={category} className="chip">
            {category} <button type="button" onClick={() => handleChange({ target: { value: category } })}>✕</button>
          </span>
        ))}
      </div>
      </div>
      <label htmlFor="descripcion">Descripción de la Receta:</label>
      <textarea
      className="textAreaDesc"
      type="text"
      id="description"
      onChange={setFormData.description(description)}
      placeholder="Descripcion..."
      required
      ></textarea>

     
    <label htmlFor="ingredientes">Ingredientes de la Receta:</label>
    <input
    className="inptFormRecipe"
        type="text"
        id="ingredients"
        onChange={setFormData.ingredients(ingredients)}
        placeholder='Ingredientes separados por ","'
        required
    />
    
    <label htmlFor="pasos">Pasos para la elaboración:</label>
    <input
    className="inptFormRecipe"
        type="text"
        id="steps"
        onChange={setFormData.steps(steps)}
        placeholder="Pasos de la"
        required
      />
      
      <label htmlFor="tiempo">Tiempo de preparación:</label>
      <input
      className="inptFormRecipe"
        type="text"
        id="tiempo"
        onChange={setFormData.tiempo(tiempo)}
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