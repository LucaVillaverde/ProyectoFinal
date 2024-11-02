import { React, useEffect, useState } from "react";
import axios from "axios";
import "../index.css";
import SimpleCard from "../components/card/SimpleCard.jsx";

const Home = () => {
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tipoDispositivo, setTipoDispositivo] = useState(undefined);

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

    
    useEffect(() => {
        const determinarAncho = (ancho) => (1230 <= ancho && ancho <= 1552) ? 1 : 0;
    
        const verificarAncho = () => {
            const ancho = window.innerWidth;
            
            const anchoBoolean = determinarAncho(ancho);
    
            if (tipoDispositivo === undefined) {
                setTipoDispositivo(anchoBoolean);
                fetchRecetas(anchoBoolean);
            } else if (tipoDispositivo !== anchoBoolean) {
                setTipoDispositivo(anchoBoolean);
                fetchRecetas(anchoBoolean);
            }
        };
    
        verificarAncho();
        window.addEventListener('resize', verificarAncho);
    
        return () => {
            window.removeEventListener('resize', verificarAncho);
        };
    }, [tipoDispositivo]); // Asegúrate de que tipoDispositivo esté en las dependencias
    
    
    


    const fetchRecetas = async (anchoBoolean) => {
        try {
            const response = await axios.post(`/api/recetas`, 
                {
                    anchoBoolean,
                }
            );  
            setRecetas(response.data.recetas);
            setLoading(false);
            
        } catch (error) {
            //console.error('Error fetching the recetas:', error);
            console.log(error);
            setLoading(false);
        }
    };
    



    
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
