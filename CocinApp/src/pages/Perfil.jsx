import { React, useEffect, useState } from 'react';
import axios from "axios";
import { useParams } from "react-router-dom";
import SimpleCard from '../components/card/SimpleCard';
import "../components/card/card.css";
import Cookies from 'js-cookie';


const Perfil = () => {
  const host = import.meta.env.VITE_HOST_API;
  const [recetas, setRecetas] = useState([]);
  const [info, setInfo] = useState(false);
  const [nombreUsuario, setNombreUsuario]= useState('');

  useEffect(() => {
    const id_user = Cookies.get('id_user');
    const obtenerNombre = async () => {
      try{
        const response = await axios.post(`${host}:5000/api/info-usuario`, {
          id_user,
        });
        if(response.status === 200){
          setNombreUsuario(response.data.username);
          llamado(response.data.username);
        }
      }catch(err){
        console.error(err);
      }
    }
    
    obtenerNombre();
  }, []);

const llamado = (nombre) =>{
    const llamadoPersonal = async () => {
      try {
        const response = await axios.post(`${host}:5000/api/recetas/personales`, {
          usernameNH: nombre,
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

    }
      llamadoPersonal();
}

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
      const response = await axios.post(`${host}:5000/api/recetas/personales`, {
        usernameNH: nombreUsuario,
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
      const response = await axios.post(`${host}:5000/api/receta-nueva`, {
        username: nombreUsuario,
        recipe_name: "Ensalada Sana version Helado",
        difficulty: "Hardcore",
        description: "Una ensalada sana version helado",
        ingredients: "50 papas, 1kg de helado",
        steps: "Servir las Papas fritas caseras, para despues comerlas.",
        categories: "Saludable, Ensalada",
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


  return (
    <>
    <span>USUARIO ID:{nombreUsuario}</span>
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

