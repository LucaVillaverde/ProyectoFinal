import React, { useEffect, useState } from "react";
import SimpleCard from "../components/card/SimpleCard.jsx";
import axios from "axios";
import "../css/search-page.css";

const Buscar = () => {
    const [query, setQuery] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchRecetas(currentPage);
    }, [currentPage, query, selectedCategories]);

    const fetchRecetas = async (page = 1) => {
        const params = {
            pageNumber: page,
            nombreReceta: query,
            arrayCategorias: selectedCategories,
        };

        try {
            const response = await axios.post(`/api/recetas/filtradas`, params);
            if (response.status === 200) {
                const { recetas, totalPages } = response.data;
                setRecetas(recetas);
                setTotalPages(totalPages);
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazamiento suave
            } else {
                handleNoRecetas();
            }
        } catch (error) {
            console.error(error);
            handleNoRecetas();
        }
    };

    const handleNoRecetas = () => {
        setRecetas([]);
        setTotalPages(1);
        setCurrentPage(1);
        setLoading(false);
    };

    const handleCheckboxChange = (category) => {
        setSelectedCategories((prevCategories) =>
            prevCategories.includes(category)
                ? prevCategories.filter((cat) => cat !== category)
                : [...prevCategories, category]
        );
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <>
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
                            <div className="filter-menu">
                                {['Entrada', 'Sopa', 'Caldo', 'Ensalada', 'Plato Principal', 'Guarnición', 'Postre', 'Bebida', 'Vegetariana', 'Saludable'].map(category => (
                                    <label className="filter" key={category}>
                                        <input
                                            type="checkbox"
                                            className="filter-inpt"
                                            value={category}
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCheckboxChange(category)}
                                        />
                                        {category}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="contenedorPaginacionBusqueda">
                <div className="paginacionBusqueda">
                    <button
                        className="btn-page"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || totalPages === 0}
                    >
                        Anterior
                    </button>
                    <span className="pageNum">{currentPage} / {totalPages}</span>
                    <button
                        className="btn-page"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Siguiente
                    </button>
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
                                            image || "https://placehold.co/400x250/000/fff/png"
                                        }
                                        title={recipe_name}
                                        author={username}
                                        dificulty={difficulty}
                                        category={categories}
                                    />
                                </a>
                            )
                        ) : (
                            <p>No hay recetas que mostrar.</p>
                        )}
                    </div>
                )}
            </div>
            <div className="contenedorPaginacionBusqueda">
                <div className="paginacionBusqueda">
                    <button
                        className="btn-page"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1 || totalPages === 0}
                    >
                        Anterior
                    </button>
                    <span className="pageNum">{currentPage} / {totalPages}</span>
                    <button
                        className="btn-page"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </>
    );
};

export default Buscar;
