import { React, useEffect, useState } from 'react';
import axios from "axios";
import SimpleCard from '../components/card/SimpleCard';


const Perfil = () => {
  const host = 'http://pruebita.webhop.me:5000';
  // const host = 'http://localhost:5000';
  // const host = "http://192.168.0.225:5000";

  const [recetas, setRecetas] = useState([]);
  const [info, setInfo] = useState(false);

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
  const user = localStorage.getItem("username");

  const llamadoBD = async () => {
    try {
      const response = await axios.get(`${host}/api/recetas`);
      
      if (response.status === 200) {
        setRecetas(response.data.recetas);;
        console.log(response.data.recetas);
        setInfo(true);
      }
      
  } catch (error) {
      //console.error('Error fetching the recetas:', error);
      console.log(error);
  }
  }

  const agregarRecipe = async () => {
    try {
      const response = await axios.post(`${host}/api/receta/nueva`, {
        username: user,
        recipe_name: "Torta",
        difficulty: "Medio",
        description: "Una torta rica",
        ingredients: "Torta XD",
        steps: "Servir la Torta",
        categories: "Vegetariana, Postre",
        tiempo: "1 minuto",
      });
  
      if (response.status === 201) {
        console.log("Se ha creado exitosamente la receta.");
        llamadoBD();
      } else {
        console.error(response.status)
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
    <span>USUARIO ID:{user}</span>
    <br></br>
    <button onClick={llamadoBD}>Traer Recetas</button>
    <br></br>
    <button onClick={agregarRecipe}>Agregar Receta</button>
    <br></br>
    {!info ?(
      <>
      <span>No hay info</span>
      </>
    ) : (
      <>
      <div className='contenedor-tarjetas'>
      {recetas.map(({ id_recipe, image, recipe_name, username, difficulty, categories }) => (
                        <a className="card" href={`/receta/${id_recipe}`} key={id_recipe}>
                            <SimpleCard
                                id={id_recipe}
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
