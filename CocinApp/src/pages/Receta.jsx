import { React, useEffect, useState } from "react";
import { Navigate, redirect, useParams } from "react-router-dom";
import axios from "axios";
import "../recipe.css";
import addIco from '../assets/add.svg';
import delIco from '../assets/del.svg';

const Receta = () => {
    const { id } = useParams();
    const [showMessage, setShowMessage] = useState(false);
    const [receta, setReceta] = useState(null);
    const [localUsername, setLocalUsername] = useState();
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: [],
        steps: [],
        tiempo: "",
    });
    const domain = import.meta.env.VITE_HOST_API2;
    const host = `${domain}:5000`;

    useEffect(() => {
        const metaDescription = document.createElement('meta');
        document.title = `CocinApp : Receta :${receta?.recipe_name || 'Cargando...'}`;
        metaDescription.name = "description";
        metaDescription.content = "Aquí tienes tu receta simplificada.";
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaDescription);
        };
    }, [receta]);

    useEffect(() => {
        const llamadoInfoUsuario = async () => {
          try {
            const llamado = await axios.get(`/api/info-usuario`);
            if (llamado.status === 200) {
              setLocalUsername(llamado.data.username);
            }
            if (llamado.status === 401) {
              console.log(`${llamado.status}, No estas logueado.`);
            }
          } catch (err) {
            console.log("Error en la solicitud.", err.message);
          }
        };
        llamadoInfoUsuario();
    }, []);

    useEffect(() => {
        const obtenerReceta = async () => {
            try {
                const response = await axios.post(`/api/receta-id`, {
                    id_recipe: id  // Asegúrate de que `id_recipe` coincida con el nombre esperado en el backend
                });
                setReceta(response.data.receta);
            } catch (err) {
                console.error("Error al obtener la receta:", err);
            }
        };
        
        obtenerReceta();
    }, []);

    const deleteRecipe = async () => {
        const contraseña = prompt("Confirme su contraseña");
        if(contraseña){
            const confirmacion = window.confirm('¿Esta seguro de borrar la receta? ésta es la última confirmación.');
            if (confirmacion){
                const eliminarReceta = await axios.post("/api/eliminarReceta", {
                    contraseña,
                    id_recipe: id,
                });
                if (eliminarReceta.status === 200){
                    window.alert(eliminarReceta.data.message);
                    window.history.back();
                }
            }else{
                window.alert("Esta bien, no te eliminamos la receta.");
            }
        }else{
            window.alert("No indicaste ninguna contraseña.");
        }
    }

    const editRecipe = async () => {
        if (show) {
            setShow(false);
        }
        else {
            setShow(true);
        }
    }

    // Condicional para evitar errores de renderizado si receta es null
    if (!receta) {
        return <p>Cargando receta...</p>;
    }

    return (
        <div>
            {show ? (
                <form id="formularioAgregarReceta">
                <label className='lbl-title-form' htmlFor="recipeName">Nombre de la Receta:</label>
                <input
                    className="inptFormRecipeName"
                    type="text"
                    id="recipeName"
                    value={formData.recipeName}
                    placeholder="Nombre de receta"
                    // onChange={handleInputChange}
                    required
                />
        
                <label className='lbl-title-form' htmlFor="difficulty">Dificultad:</label>
                <select
                    name="recipeDiff"
                    className="selectRecipe"
                    id="difficulty"
                    value={formData.difficulty}
                    // onChange={handleInputChange}
                    required
                >
                    <option value="">Dificultad</option>
                    <option value="Fácil">Fácil</option>
                    <option value="Medio">Medio</option>
                    <option value="Difícil">Difícil</option>
                </select>
        
                <label className='lbl-title-form'>Categoría (máx. 4):</label>
                <div className="categorias">
                    {["Entrada", "Sopa", "Caldo", "Ensalada", "Plato Principal", "Guarnición", "Postre", "Bebida", "Vegetariana", "Saludable"].map((category) => (
                        <label key={category} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.categories.includes(category)}
                                // onChange={() => handleCategoryChange(category)}
                            />
                            {category}
                        </label>
                    ))}
                </div>
        
                <label className='lbl-title-form' htmlFor="description">Descripción de la Receta:</label>
                <textarea
                    className="textAreaDesc"
                    id="description"
                    value={formData.description}
                    // onChange={handleInputChange}
                    placeholder="Descripción..."
                    required
                ></textarea>
        
                <label className="lbl-title-form">Ingredientes de la Receta:</label>
        
                {formData.ingredients.map((ingredient, index) => (
                    <div key={index}>
                        <div className="inpDel">
                        <button type="button" className="btn-del" onClick={() => handleRemoveIngredient(index)}>
                                <img src={delIco}/>
                        </button>
                        <input
                            className="inptFormRecipe"
                            type="text"
                            placeholder={`Ingrediente ${index + 1}`}
                            value={ingredient}
                            // onChange={(e) => handleIngredientChange(index, e)}
                            required
                        />
                        </div>
                    </div>
                ))}
                
                <button type="button" aria-label="Agregar Campo de Ingrediente" className="btn-add">
                <img alt="Boton de agregar campo ingrediente" src={addIco}/>
                </button>
        
                <label className="lbl-title-form">Pasos para la elaboración:</label>
                {formData.steps.map((step, index) => (
                    <div key={index}>
                        <div className="inpDel">
                        <button type="button"  className="btn-del">
                                <img src={delIco}/>
                        </button>
                        <input
                            className="inptFormRecipe"
                            type="text"
                            placeholder={`Paso ${index + 1}`}
                            value={step}
                            // onChange={(e) => handleStepChange(index, e)}
                            required
                        />
                        </div>
        
                    </div>
        
                ))}
                
                <button type="button" aria-label="Agregar Campo de Paso" className="btn-add">
                    <img alt="Boton de agregar campo paso" src={addIco}/>
                </button>
                
                <label className='lbl-title-form' htmlFor="tiempo">Tiempo de preparación:</label>
                <input
                    className="inptFormTiempo"
                    type="text"
                    id="tiempo"
                    placeholder="30 minutos / 30 min o 1 hora / 2 horas"
                    value={formData.tiempo}
                    // onChange={handleInputChange}
                    required
                />
        
                <button className="btnAdd" type="submit">
                    Enviar
                </button>
            </form>
            ) : (
                <div className="content">
            <div className="recipe">
                <h2 className="recipe-title">{receta.recipe_name}</h2>
                <section className="recipe-img-cont frame-content">
                    <img
                        src={receta.img || "https://placehold.co/600x400/000000/FFFFFF/png"}
                        alt={receta.recipe_name}
                        className="recipe-img"
                    />
                </section>
                <section className="recipe-ingredients-cont frame-content">
                    <h3 className="subtitle">Ingredientes:</h3>
                    <ul>
                        {receta.ingredients}
                        {/* {receta.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))} */}
                    </ul>
                </section>
                <section className="recipe-data-cont frame-content">
                    <h3 className="subtitle">Tiempo de preparacion:</h3>
                    <p>{receta.tiempo}</p>
                    <h3 className="subtitle">Dificultad:</h3>
                    <p>{receta.difficulty}</p>
                </section>
                <section className="recipe-steps-cont frame-content">
                    <h3 className="subtitle">Pasos:</h3>
                    <ul>
                        {receta.steps}
                        {/* {receta.steps.map((step, index) => (
                            <li className="recipe-step" key={index}>
                                {step}
                            </li>
                        ))} */}
                    </ul>
                    <h3 className="subtitle">Descripción:</h3>
                    <p className="pasos">{receta.description}</p>
                </section>
                {showMessage && <p>Regístrese para poder dar like</p>}
                <div className="btn_recipe">
                    {localUsername === receta.username ? (
                        <div className="buttons">
                        <button onClick={editRecipe}>EDITAR</button>
                        <button onClick={deleteRecipe}>ELIMINAR</button>
                        </div>
                    ) : (
                        <span>Aquí iría el botón de favoritos.</span>
                    )}
                </div>
            </div>
        </div>
            )}
        </div>
    );
};

export default Receta;
