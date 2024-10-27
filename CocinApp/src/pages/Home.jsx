import { React, useEffect, useState } from "react";
import axios from "axios";
import "../index.css";
import SimpleCard from "../components/card/SimpleCard.jsx";

const Home = ({host}) => {
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const metaDescription = document.createElement('meta');
        document.title = "CocinApp: Home";
        metaDescription.name = "description";
        metaDescription.content = "Pagina inicio de CocinApp, donde tienes tus recetas simplificadas mas recientes."
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaDescription);
        };
    }, []);


    const fetchRecetas = async () => {
        try {
            const response = await axios.get(`${host}/api/recetas`);  
            setRecetas(response.data.recetas);
            setLoading(false);
            console.log(response.data.recetas);
            
        } catch (error) {
            //console.error('Error fetching the recetas:', error);
            console.log(error);
            setLoading(false);
        }
    };
    

    // useEffect para ejecutar la función una vez al cargar el componente
    useEffect(() => {
        fetchRecetas();
        console.log(recetas)
    }, []);


    
    return (
        <>
            <h2 className="title">RECIENTES</h2>
            <div className="content">
            {loading ? (
                <p>Cargando recetas...</p>
            ) : (
                <div className='contenedor-tarjetas'>
                {recetas.map(({ id_recipe, tiempo, image, recipe_name, username, difficulty, categories }) => (
                                  <a className="card" href={`/receta/${id_recipe}`} key={id_recipe}>
                                      <SimpleCard
                                          tiempo={tiempo}
                                          image={"https://placehold.co/400x250/000/fff/webp"}  // Si no tienes imágenes en la DB, puedes usar una imagen por defecto
                                          title={recipe_name}
                                          author={id_recipe}
                                          dificulty={difficulty}
                                          category={categories}  // Si tienes categorías como un array, deberías ajustarlo
                                      />
                                  </a>
                              ))}
                </div>
            )}
            </div>
        </>
    );
};

export default Home;
