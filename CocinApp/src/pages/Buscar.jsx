import React, { useEffect, useState, useRef } from "react";
import { resolvePath, useParams } from "react-router-dom";
import SimpleCard from "../components/card/SimpleCard.jsx";
import axios from "axios";
import "../css/search-page.css";
import image_404 from '../assets/image_404.png';

const Buscar = ({ host }) => {
    const [query, setQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const menuRef = useRef(null);
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [noRecetas, setNoRecetas] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (localStorage.getItem("errorRecetas")) {
            console.error(localStorage.getItem("errorRecetas"));
            localStorage.removeItem("errorRecetas");
        }
    }, []);

    useEffect(() => {
        const metaDescription = document.createElement("meta");
        document.title = `CocinApp : Buscar`;
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
        fetchRecetas(currentPage); // Cargar recetas iniciales
    }, [currentPage]); // Cambia la carga de recetas al cambiar la página

    const fetchRecetas = async (page = 1) => {
        const params = { page };

        if (query) {
            params.nombreReceta = query; // Agregar filtro por nombre
        }

        if (selectedCategories.length > 0) {
            params.arrayCategorias = selectedCategories; // Agregar filtro por categoría
        }

        try {
            const response = await axios.post(`${host}/api/recetas/filtradas`, params);
            if (response.status === 200) {
                if (response.data.recetas.length === 0) {
                    // No hay recetas, ir a la página 1
                    setRecetas([]);
                    setTotalPages(1);
                    setCurrentPage(1);
                } else {
                    setRecetas(response.data.recetas);
                    setTotalPages(response.data.totalPages || 1); // Establecer total de páginas
                }
                setLoading(false);
            } else {
                setRecetas([]);
                setTotalPages(1); // Si no hay recetas, establecer totalPages a 1
                setLoading(false);
                setCurrentPage(1); // Regresar a la página 1 en caso de error
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            setRecetas([]);
            setTotalPages(1); // Manejo de error, también establece totalPages a 1
            setCurrentPage(1); // Regresar a la página 1 en caso de error
        }
    };

    // Cargar recetas al cambiar la consulta o categorías
    useEffect(() => {
        fetchRecetas(currentPage); // Llamar a fetchRecetas con la página actual
        window.scrollTo(0, 0); // Desplazar a la parte superior de la página
    }, [query, selectedCategories, currentPage]); // Dependencias incluyen currentPage

    const handleCheckboxChange = (category) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(category)
                ? prevCategories.filter((cat) => cat !== category)
                : [...prevCategories, category]
        );
    };

    return (
        <>
            {/* BARRA PARA BUSCAR RECETAS */}
            <div className="search-cont">
                <h2 className="search-title">BUSCAR RECETAS</h2>
                <div className="search-filters">
                    <form className="search-bar-cont" onSubmit={(e) => e.preventDefault()}>
                        <div className="search-bar">
                            <input
                                className="search-inpt"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar..."
                            />
                            <button title="Botón para buscar recetas" className="search-btn" type="submit">
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
                        <h3>Categorías</h3>
                        <div className="filters">
                            <div className="filter-menu" ref={menuRef}>
                                {['Entrada', 'Sopa', 'Caldo', 'Ensalada', 'Plato Principal', 'Guarnición', 'Postre', 'Bebida', 'Vegetariana', 'Saludable'].map(category => (
                                    <label className="filter" key={category}>
                                        <input
                                            type="checkbox"
                                            className="filter-inpt"
                                            value={category}
                                            onChange={(e) => handleCheckboxChange(e.target.value)}
                                        />
                                        {category}
                                    </label>
                                ))}
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
                        {recetas.length > 0 ? recetas.map(
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
                                            image || "https://placehold.co/400x250/000/fff/png" // Usar imagen de la DB o una por defecto
                                        }
                                        title={recipe_name}
                                        author={username}
                                        dificulty={difficulty}
                                        category={categories} // Si tienes categorías como un array, deberías ajustarlo
                                    />
                                </a>
                            )
                        ) : (
                            <p>No hay recetas que mostrar.</p>
                        )}
                    </div>
                )}
                <div className="contenedorPaginacionBusqueda">
                <div className="paginacionBusqueda">
                    <button
                        className="btn-page"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || totalPages === 0}
                    >
                        Anterior
                    </button>
                    <span className="pageNum">{currentPage} / {totalPages}</span>
                    <button
                        className="btn-page"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Siguiente
                    </button>
                </div>
                </div>
            </div>
        </>
    );
};

export default Buscar;
