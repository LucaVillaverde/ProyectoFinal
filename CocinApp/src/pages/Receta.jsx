import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../recipe.css";

const Receta = ({ username }) => {
    const { id } = useParams();
    const [showMessage, setShowMessage] = useState(false); // Estado para controlar la visibilidad del mensaje

    useEffect( async () => {
        try{
            const llamadaInfo = await axios.post('/api')
        }catch(err){
            console.error(err);
        }
    }, [])

    useEffect(() => {
        const metaDescription = document.createElement('meta');
        document.title = `CocinApp : Receta :${recipe.recipe_name}`;
        metaDescription.name = "description";
        metaDescription.content = "Pagina recetas de CocinApp, donde tienes tu receta simplificada."
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaDescription);
        };
    }, []);

    if (id !== '') {
        const recipe = async (e) => {
            e.preventDefault();
            try {
                const response = await axios.get(`${host}/api/receta/${id}`); // Aquí usas el valor real de id
                if (response.status === 200) {
                    const receta = response.data.receta;
                    console.log(receta);
                }
            } catch (error) {
                console.error('Error al obtener la receta:', error);
                setError(error.message); 
            }
        };
    }
    





    // ACA VA LA CONSULTA DE DB PARA OBTENER LOS DATOS Y RELLENAR EL COMPONENTE
    const recipe = {
        id_recipe: "123",
        author: "Luca",
        recipe_name: "Torta de papa",
        img: "https://placehold.co/600x400/000000/FFFFFF/png",
        preparation_time: "120min",
        dificulty: "FACIL",
        steps: [
            "1- pelar papas",
            "2- Hervir papas",
            "3- Hacer masa",
            "3-Unir todo2",
            "4-Distrutar :)",
        ],
        ingredients: [
            "50x papa",
            "1kg harina",
            "200ml agua",
            "queso",
            "500g sal",
        ],
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
        // favs: 200,
    };
    // variables
    const ingredients = recipe.ingredients;
    const steps = recipe.steps;


    const clickBtn = () => {
      if (username === null) {
        setShowMessage(true); // Muestra el párrafo
        setTimeout(() => {
          setShowMessage(false); // Borra el mensaje después de 5 segundos
        }, 2000);
      } else {
        favorite(); // Añade a favoritos si está logueado
      }
    };




    return (
        <div className="content">
            <div className="recipe">
                <h2 className="recipe-title">{recipe.recipe_name}</h2>
                <section className="recipe-img-cont frame-content">
                    <img
                        src={recipe.img}
                        alt={recipe.recipe_name}
                        className="recipe-img"
                    />
                </section>
                <section className="recipe-ingredients-cont frame-content">
                    <h3 className="subtitle">Ingredientes:</h3>
                    <ul>
                        {ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </section>
                <section className="recipe-data-cont frame-content">
                    <h3 className="subtitle">Tiempo de preparacion:</h3>
                    <p>{recipe.preparation_time}</p>
                    <h3 className="subtitle">Dificultad:</h3>
                    <p>{recipe.dificulty}</p>
                </section>
                <section className="recipe-steps-cont frame-content">
                    <h3 className="subtitle">Pasos:</h3>
                    <ul>
                        {steps.map((step, index) => (
                            <li className="recipe-step" key={index}>
                                {step}
                            </li>
                        ))}
                    </ul>
                    <h3 className="subtitle">Proceso:</h3>
                    <p className="pasos">{recipe.description}</p>
                </section>
                {showMessage && <p>Registrese para poder dar like</p>}
                <div className="btn_recipe">
                    {username === recipe.author ? (
                        <button>EDITAR</button>
                    ) : (
                        <>
                        <span>Aquí iria el boton de favoritos.</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Receta;
