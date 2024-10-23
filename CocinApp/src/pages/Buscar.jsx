import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./css/search-page.css";
import SimpleCard from "../components/card/SimpleCard.jsx";
import axios from "axios";

const Buscar = ({ host }) => {
    const [query, setQuery] = useState("");
    const [cat, setCat] = useState("");
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const menuRef = useRef(null);

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
        console.log(query);
        console.log(cat);
    }, [query, cat]);

    const { find } = useParams();
    useEffect(() => {
        document.title = `CocinApp : Buscando ${find}`;
    });

    const search = (e) => {
        e.preventDefault();
        console.log("BUSCAR:" + query);
    };

    // Filtros
    useEffect(() => {
        const menu = menuRef.current;

        const handleScroll = (e) => {
            e.preventDefault();
            menu.scrollLeft += e.deltaY; // Desplazamiento horizontal
        };

        if (menu) {
            menu.addEventListener("wheel", handleScroll);
        }

        return () => {
            if (menu) {
                menu.removeEventListener("wheel", handleScroll);
            }
        };
    }, []);

    // RECETAS
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
    useEffect(() => {
        fetchRecetas();
        console.log(recetas);
    }, []);

    return (
        <>
            {/* BARRA PARA BUSCAR RECETAS*/}
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
                    <div className="filters">
                        <div className="filter-menu" ref={menuRef}>
                            <button
                                onClick={() => setCat("")}
                                className="filter"
                            >
                                TODO
                            </button>
                            <button
                                onClick={() => setCat("cat2")}
                                className="filter"
                            >
                                Carnes
                            </button>
                            <button
                                onClick={() => setCat("cat3")}
                                className="filter"
                            >
                                Vegetariana
                            </button>
                            <button
                                onClick={() => setCat("cat4")}
                                className="filter"
                            >
                                Postre
                            </button>
                            <button
                                onClick={() => setCat("cat5")}
                                className="filter"
                            >
                                BTN
                            </button>
                            <button
                                onClick={() => setCat("cat6")}
                                className="filter"
                            >
                                BTN
                            </button>
                            <button
                                onClick={() => setCat("cat7")}
                                className="filter"
                            >
                                BTN
                            </button>
                            <button
                                onClick={() => setCat("cat8")}
                                className="filter"
                            >
                                BTN
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* SECCION PARA MOSTRAR RECETAS (POR DEFECTO TODAS) */}
            <div className="recipe-content">
                {/* {loading ? (
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
                )} */}
            </div>
        </>
    );
};

export default Buscar;
