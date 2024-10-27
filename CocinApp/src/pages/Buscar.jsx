import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import SimpleCard from "../components/card/SimpleCard.jsx";
import axios from "axios";
import "../css/search-page.css";

const Buscar = ({ host }) => {
    const [query, setQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]); 
    const menuRef = useRef(null);
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        metaDescription.content =
            "Pagina buscar de CocinApp, donde puedes encontrar recetas.";
        document.getElementsByTagName("head")[0].appendChild(metaDescription);

        return () => {
            document
                .getElementsByTagName("head")[0]
                .removeChild(metaDescription);
        };
    }, []);

    useEffect(() => {
        // Al montar, asegurarte de que las categorías están deseleccionadas
        setSelectedCategories([]);
        return () => {
            // Opcionalmente puedes limpiar el estado aquí si es necesario
            setSelectedCategories([]);
        };
    }, []);
    
    // actualizar busqueda
    useEffect(() => {
        console.log(query);
    }, [query]);

    // Titulo dinamico si se busca algo, si no queda "bur"
    useEffect(() => {
        if (query === ''){
            document.title = `CocinApp : ${query}`;
        }
        document.title = `CocinApp : Buscar`;
    });


    // Monitorear el cambio de selectedCategories
    useEffect(() => {
        if (selectedCategories.length === 0) {
            console.log(`No hay categorias seleccionadas`);
            fetchRecetas();
            return;
        }else{
            const fetchRecetasCategorizadas = async () => {
                try {
                    const response = await axios.post(`${host}/api/recetas/filtradas`, {
                        arrayCategorias: selectedCategories, // Se envía en el cuerpo
                    });
                    if (response.status === 200) {
                        setRecetas(response.data.recetas);
                        setLoading(false);
                        console.log(response.data.recetas);
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            fetchRecetasCategorizadas();
        }
    }, [selectedCategories]);

    // BUSQUEDA
    const search = (e) => {
        e.preventDefault();
        console.log("BUSCAR:" + query);
        document.title = `CocinApp : ${query}`;
    };

    const handleCheckboxChange = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };
    

    // RECETAS (desde DB)
    const fetchRecetas = async () => {
        try {
            const response = await axios.get(`${host}/api/recetas`);
            setRecetas(response.data.recetas);
            setLoading(false);
            console.log(response.data.recetas);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };
    // Traer Recetas (actualizando)
    useEffect(() => {
        fetchRecetas();
    }, []);

    return (
        <>
            {/* BARRA PARA BUSCAR RECETAS */}
            <div className="search-cont">
                <h2 className="search-title">BUSCAR RECETAS</h2>
                <div className="search-filters">
                    <form onSubmit={search} className="search-bar-cont">
                        <div className="search-bar">
                            <input
                                className="search-inpt"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar..."
                            />
                            <button className="search-btn" type="submit">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="1em"
                                    height="1em"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="#1F1F1F"
                                        d="M10 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12m-8 6a8 8 0 1 1 14.32 4.906l5.387 5.387a1 1 0 0 1-1.414 1.414l-5.387-5.387A8 8 0 0 1 2 10"
                                    />
                                </svg>
                            </button>
                        </div>
                    </form>
                    <div>
                        <h3>Categorias</h3>
                        <div className="filters" >
                            <div className="filter-menu" ref={menuRef}>
                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Entrada"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Entrada
                                </label>

                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Vegetariana"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Vegetariana
                                </label>

                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Guarnición"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Guarnición
                                </label>

                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Postre"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Postre
                                </label>

                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Sopa"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Sopa
                                </label>

                                <label className="filter">
                                    <input
                                        type="checkbox"
                                        className="filter-inpt"
                                        value="Saludable"
                                        onChange={(e) => handleCheckboxChange(e.target.value)}
                                    />
                                    Saludable
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="recipe-content">
                {loading ? (
                    <p>Cargando recetas...</p>
                ) : (
                    <div className="contenedor-tarjetas">
                        {recetas.map(
                            ({
                                id_recipe,
                                tiempo,
                                image,
                                recipe_name,
                                username,
                                difficulty,
                                categories,
                            }) => (
                                <a
                                    className="card"
                                    href={`/receta/${id_recipe}`}
                                    key={id_recipe}
                                >
                                    <SimpleCard
                                        tiempo={tiempo}
                                        image={
                                            "https://placehold.co/400x250/000/fff/png"
                                        } // Si no tienes imágenes en la DB, puedes usar una imagen por defecto
                                        title={recipe_name}
                                        author={id_recipe}
                                        dificulty={difficulty}
                                        category={categories} // Si tienes categorías como un array, deberías ajustarlo
                                    />
                                </a>
                            )
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Buscar;
