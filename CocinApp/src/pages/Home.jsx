import { React, useEffect, useState } from "react";
import axios from "axios";
import "../index.css";
import SimpleCard from "../components/card/SimpleCard.jsx";
import { Navigate, useHref, useNavigate } from "react-router-dom";
// Image
import imageDefault from'@assets/imagenDefault.webp';
const Home = () => {
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tipoDispositivo, setTipoDispositivo] = useState(undefined);
    const navigate = useNavigate();


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

    const interactivo = (id_recipe) => {
        const miDominio = window.location.origin;
        console.log(miDominio);
        console.log(id_recipe);
        const urlReceta = `/receta/${id_recipe}`; // No necesitas el dominio completo para rutas internas
    
        if (navigator.vibrate) navigator.vibrate(100);
    
        navigate(urlReceta);
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
                                  <div className="card" onClick={() => interactivo(id_recipe)} key={id_recipe}>
                                    {  }
                                      <SimpleCard
                                          tiempo={tiempo}
                                          image={image ? image : imageDefault}  
                                          title={recipe_name}
                                          author={username}
                                          dificulty={difficulty}
                                          category={categories}  // Si tienes categorías como un array, deberías ajustarlo
                                      />
                                  </div>
                              ))}
                </div>
            )}
            </div>
        </>
    );
};

export default Home;
