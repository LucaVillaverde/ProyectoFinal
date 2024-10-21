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
            const response = await axios.get(`${host}/api/recetas/`);  
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


    const dataSet = [
        {
            id: "123",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "124",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "125",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "126",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "127",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "128",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "129",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "130",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "131",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "132",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        },
        {
            id: "133",
            image: "https://placehold.co/400x250/000/fff/png",
            title: "[NOMBRE-RECETA]",
            author: "[AUTOR-RECETA]",
            category: "[RECETA-CATEGORIA]",
            dificulty: "[DIFICULTAD-RECETA]",
        }
    ];
    return (
        <>
            <h2 className="title">RECIENTES</h2>
            <div className="content">
            {loading ? (
                <p>Cargando recetas...</p>
            ) : (
                <div className="card-grid">
                    {dataSet.map(({ id, image, title, author, dificulty, category }) => (
                        <a className="card" href={`/receta/${id}`} key={id}>
                            <SimpleCard
                                id={id}
                                image={image || 'default_image_url.jpg'}  // Si no tienes imágenes en la DB, puedes usar una imagen por defecto
                                nombre={title}
                                author={author}
                                dificulty={dificulty}
                                category={category}  // Si tienes categorías como un array, deberías ajustarlo
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