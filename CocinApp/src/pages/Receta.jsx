import { React, useEffect, useState } from "react";
import { Navigate, redirect, useParams } from "react-router-dom";
import axios from "axios";
import "../recipe.css";

const Receta = () => {
    const { id } = useParams();
    const [showMessage, setShowMessage] = useState(false);
    const [receta, setReceta] = useState(null);
    const [localUsername, setLocalUsername] = useState();
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

    // Condicional para evitar errores de renderizado si receta es null
    if (!receta) {
        return <p>Cargando receta...</p>;
    }

    return (
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
                        <button>EDITAR</button>
                        <button onClick={deleteRecipe}>ELIMINAR</button>
                        </div>
                    ) : (
                        <span>Aquí iría el botón de favoritos.</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Receta;
