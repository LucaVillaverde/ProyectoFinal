import { React, useEffect, useState } from 'react';
import axios from "axios";
import { useParams } from "react-router-dom";
import SimpleCard from '../components/card/SimpleCard';
import "../components/card/card.css";


const Perfil = () => {
  const { localUsername } = useParams();
  // const host = 'http://pruebita.webhop.me:5000';
  // const host = 'http://localhost:5000';
  const host = "http://192.168.0.168:5000";

  const [recetas, setRecetas] = useState([]);
  const [info, setInfo] = useState(false);


  useEffect(() => {
    llamarRecetas();
  }, []);

  useEffect(() => {
    const llamadoBD = async () => {
        try {
            const response = await axios.post(`${host}/api/recetas/personales`, {
              usernameNH: localUsername,
            });
            if (response.status === 200) {
                setRecetas(response.data.recetas);
                console.log(response.data.recetas);
                setInfo(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const intervalId = setInterval(() => {
        llamadoBD();
    }, 5000); // 60000 milisegundos = 1 minuto

    // Limpiar el intervalo cuando el componente se desmonta
    return () => clearInterval(intervalId);
}, []);

 

  useEffect(() => {
    const metaDescription = document.createElement('meta');
    document.title = "CocinApp: Perfil";
    metaDescription.name = "description";
    metaDescription.content = "Pagina perfil de CocinApp, donde tienes tu perfil."
    document.getElementsByTagName('head')[0].appendChild(metaDescription);

    return () => {
        document.getElementsByTagName('head')[0].removeChild(metaDescription);
    };
}, []);

const llamarRecetas = async () => {
  try {
      const response = await axios.post(`${host}/api/recetas/personales`, {
        usernameNH: localUsername,
      });
      if (response.status === 200) {
          setRecetas(response.data.recetas);
          console.log(response.data.recetas);
          setInfo(true);
      } else if (response.status === 404) {
        setInfo(false);
        window.alert("No tienes recetas para mostrar.");
        console.log("No tienes recetas para mostrar.");
      }

  } catch (error) {
      console.log(error);
  }
};

  const agregarRecipe = async () => {
    try {
      const response = await axios.post(`${host}/api/receta-nueva`, {
        username: localUsername,
        recipe_name: "Tarta de Espinacas y Queso Ricotta con Masa Integral Hecha en Casa",
        difficulty: "GORE",
        description: "Una milanesa napolitana exquisita",
        ingredients: "Milanesa napolitana",
        steps: "Servir la milanesa napolitana",
        categories: "Entrada, Bebida, Vegetariana, Saludable",
        tiempo: "2 segundos en servir",
      });
  
      if (response.status === 201) {
        console.log("Se ha creado exitosamente la receta.");
        llamarRecetas();
      } else {
        console.error(response.status)
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (localUsername !== '') {
    const Perfil = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`${host}/api/mis-recetas/${localUsername}`); // Aquí usas el valor real de username
            if (response.status === 200) {
            }
        } catch (error) {
            console.error('Error al obtener la receta:', error);
            setError(error.message); 
        }
    };
}


  return (
    <>
    <span>USUARIO ID{localUsername}</span>
    <br></br>
    <button onClick={llamarRecetas}>Traer tus recetas</button>
    <br></br>
    <button onClick={agregarRecipe}>Agregar Receta</button>
    <br></br>
      {!info ?(
        <>
        <span>No tienes recetas para mostrar</span>
        </>
      ) : (
        <>
        <div className='contenedor-tarjetas'>
        {recetas.map(({ id_recipe, tiempo, image, recipe_name, username, difficulty, categories }) => (
                          <a className="card" href={`/receta/${id_recipe}`} key={id_recipe}>
                              <SimpleCard
                                  tiempo={tiempo}
                                  image={"https://placehold.co/400x250/000/fff/png"}  // Si no tienes imágenes en la DB, puedes usar una imagen por defecto
                                  title={recipe_name}
                                  author={username}
                                  dificulty={difficulty}
                                  category={categories}  // Si tienes categorías como un array, deberías ajustarlo
                              />
                          </a>
                      ))}
        </div>
        </>
      )}
    </>
    )
}

export default Perfil

