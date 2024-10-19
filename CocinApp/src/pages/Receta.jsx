import { React, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../recipe.css";

const Receta = ({ username}) => {
    const { id } = useParams();
    const [showMessage, setShowMessage] = useState(false); // Estado para controlar la visibilidad del mensaje
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
        favs: 200,
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
                        /* From Uiverse.io by TroyRandall */
                        <div className="comment-react">
                            <button
                                onClick={clickBtn}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                                        stroke="#707277"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        fill="#707277"
                                    ></path>
                                </svg>
                            </button>
                            <span>{recipe.favs}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Receta;
