import React, { useState } from "react";
import "./tabs.css";
const Tabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState("Agregar");
    const handleTabClick = (label) => {
        setActiveTab(label);
    };


    const llamadaDB = async () => {
        try{
          const postForm = await axios.post(`${host}/api/receta-nueva`,{
            
          })
        }catch(err){
          console.error(err);
        }
      }

    // Componente para los formularios
    const AddForm = () => (
        <form id="formReceta" onSubmit={llamadaDB}>
            <label for="nombreReceta">Nombre de la Receta:</label>
            <input
                type="text"
                placeholder="Nombre de la receta"
                name="nombreReceta"
            />
            <br></br>

            <label for="dificultad">Dificultad de la Receta:</label>
            <select name="dificultad">
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
            </select>
            <br></br>

            <label for="descripcion">Descripción de la Receta:</label>
            <input
                type="text"
                name="descripcion"
                placeholder="Un postre muy saludable sin mucha porquería"
            />
            <br></br>

            <label for="ingredientes">Ingredientes de la Receta:</label>
            <input
                type="text"
                name="ingredientes"
                placeholder="1/2cda de azúcar, 1kg de NO PAPA"
            />
            <br></br>

            <label for="pasos">Pasos para la elaboración</label>
            <input type="text" name="pasos" placeholder="1ro Pelamos la papa" />
            <br></br>

            <label for="categoria">
                Favor de indicar categoría/s de la receta:
            </label>
            <input
                type="text"
                id="categoria"
                placeholder="Postre, Entrada, Saludable"
            />
            <br></br>

            <label for="tiempo">Tiempo de preparación</label>
            <input
                type="text"
                name="tiempo"
                placeholder="30 minutos / 1 horas"
            ></input>
            <br></br>

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
