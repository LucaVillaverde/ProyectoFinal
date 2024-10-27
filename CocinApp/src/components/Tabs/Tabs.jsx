import React, { useEffect, useState, useRef } from "react";
import "./tabs.css";
import axios from "axios";
import Cookies from "js-cookie";
const Tabs = ({ tabs, host }) => {
    // Variables
    const [formData, setFormData] = useState({
        recipeName: '',
        recipeDiff: '',
        description: '',
        ingredients: '',
        steps: '',
        tiempo: '',
        category1: '',
        category2: '',
        category3: '',
        category4: '',
      });
    const [tabUsername, setTabUsername] = useState("");
    
    const [activeTab, setActiveTab] = useState("Agregar");
    const handleTabClick = (label) => {
        setActiveTab(label);
    };    

    // useEffect(()=>{
    //     const llamadoNombreUsuario = async () =>{
    //         const id_user = Cookies.get('id_user');
    //         try{
    //             const nombreUser = await axios.post(`${host}/api/info-usuario`,{
    //                 id_user
    //             })
    //             if (nombreUser.status === 200){
    //                 console.log(nombreUser.data.username);
    //                 setTabUsername(nombreUser.data.username);
    //             }
    //         }catch(err){
    //             console.error(err);
    //         }
    //     }
    //     llamadoNombreUsuario();
    // },[])

    const llamadaDB = async (e) => {
        e.preventDefault();
        try{
          const postForm = await axios.post(`${host}/api/receta-nueva`,{
            username: tabUsername,
            recipe_name: formData.recipeName,
            difficulty: formData.recipeDiff,
            description: formData.description,
            ingredients: formData.ingredients,
            steps: formData.steps,
            categories: [`${formData.category1}, ${formData.category2}, ${formData.category3}, ${formData.category4}`],
            tiempo: formData.tiempo,
          })
          if(postForm === 201){
            window.alert("Se ha creado la receta");
          }
        }catch(err){
          console.error(err);
        }
      }

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      };

    // Componente para los formularios
    const AddForm = () => (
<form id="formReceta" onSubmit={llamadaDB}>
  <label htmlFor="nombreReceta">Nombre de la Receta:</label>
  <input
    type="text"
    placeholder="Nombre de la receta"
    name="recipeName"
    value={formData.recipeName}
    onInput={handleInputChange}  // Cambiar a onInput
    required
  />
  <br />

  <label htmlFor="dificultad">Dificultad de la Receta:</label>
  <select
    name="recipeDiff"
    value={formData.recipeDiff}
    onChange={handleInputChange}
    required
  >
    <option value="fácil">Fácil</option>
    <option value="medio">Medio</option>
    <option value="dificil">Difícil</option>
  </select>
  <br />

  <label htmlFor="descripcion">Descripción de la Receta:</label>
  <input
    type="text"
    name="description"
    placeholder="Un postre muy saludable sin mucha porquería"
    value={formData.description}
    onInput={handleInputChange}  // Cambiar a onInput
    required
  />
  <br />

  <label htmlFor="ingredientes">Ingredientes de la Receta:</label>
  <input
    type="text"
    name="ingredients"
    placeholder="1/2cda de azúcar, 1kg de NO PAPA"
    value={formData.ingredients}
    onInput={handleInputChange}  // Cambiar a onInput
    required
  />
  <br />

  <label htmlFor="pasos">Pasos para la elaboración:</label>
  <input
    type="text"
    name="steps"
    placeholder="1ro Pelamos la papa"
    value={formData.steps}
    onInput={handleInputChange}  // Cambiar a onInput
    required
  />
  <br />

  <label htmlFor="tiempo">Tiempo de preparación:</label>
  <input
    type="text"
    name="tiempo"
    placeholder="30 minutos / 1 hora"
    value={formData.tiempo}
    onInput={handleInputChange}  // Cambiar a onInput
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

    // useEffect(()=>{
    //     console.log(tabUsername);
    // },[tabUsername])

    return (
        <div>
            <div>
                <div className="tabs">
                    <button
                        className={`tab-button ${
                            activeTab === "Agregar" ? "active" : ""
                        }`}
                        onClick={() => handleTabClick("Agregar")}
                    >
                        Agregar
                    </button>
                    <button
                        className={`tab-button ${
                            activeTab === "Editar" ? "active" : ""
                        }`}
                        onClick={() => handleTabClick("Editar")}
                    >
                        Editar
                    </button>
                    <button
                        className={`tab-button ${
                            activeTab === "Buscar" ? "active" : ""
                        }`}
                        onClick={() => handleTabClick("Eliminar")}
                    >
                        ELIMINAR
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === "Agregar" && <AddForm />}
                    {activeTab === "Editar" && <EditForm />}
                    {activeTab === "Eliminar" && <DelForm />}
                </div>
            </div>
        </div>
    );
};

export default Tabs;
