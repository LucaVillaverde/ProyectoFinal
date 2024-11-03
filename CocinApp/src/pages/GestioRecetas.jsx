import React, { useEffect, useState, memo, useCallback } from "react";
import axios from "axios";
import "../css/form.css";
import "../components/card/card.css";
import SimpleCard from "../components/card/SimpleCard";

const AddForm = memo(
    ({
        formData,
        handleInputChange,
        handleCategoryChange,
        handleRemoveCategory,
        llamadaDB,
    }) => (
        <form id="formularioAgregarReceta" onSubmit={llamadaDB}>
            <label className='lbl-title-form' htmlFor="recipeName">Nombre de la Receta:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="recipeName"
                value={formData.recipeName}
                placeholder="Nombre de receta"
                onChange={handleInputChange}
                required
            />

            <label className='lbl-title-form' htmlFor="difficulty">Dificultad:</label>
            <select
                name="recipeDiff"
                className="selectRecipe"
                id="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
            >
                <option value="">Dificultad</option>
                <option value="Fácil">Fácil</option>
                <option value="Medio">Medio</option>
                <option value="Difícil">Difícil</option>
            </select>

            <label className='lbl-title-form'>Categoria (4 max):</label>
            <div className="categorias">
                {["Entrada", "Sopa", "Caldo", "Ensalada", "Plato Principal", "Guarnición", "Postre", "Bebida", "Vegetariana", "Saludable"].map((category) => (
                    <label key={category} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.categories.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                        />
                        {category}
                    </label>
                ))}
            </div>

            <label className='lbl-title-form' htmlFor="description">Descripción de la Receta:</label>
            <textarea
                className="textAreaDesc"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripcion..."
                required
            ></textarea>

            <label className='lbl-title-form' htmlFor="ingredients">Ingredientes de la Receta:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="ingredients"
                placeholder='Ingredientes separados por ","'
                value={formData.ingredients.primero}
                onChange={handleInputChange}
                required
            />

            <label className='lbl-title-form' htmlFor="steps">Pasos para la elaboración:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="steps"
                placeholder="Pasos de la receta"
                value={formData.steps.primero}
                onChange={handleInputChange}
                required
            />

            <label className='lbl-title-form' htmlFor="tiempo">Tiempo de preparación:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="tiempo"
                placeholder="30 minutos / 30 min o 1 hora / 2 horas"
                value={formData.tiempo}
                onChange={handleInputChange}
                required
            />

            <button className="btnAdd" type="submit">
                Enviar
            </button>
        </form>
    )
);

const GestioRecetas = () => {
    useEffect(() => {
        const metaDescription = document.createElement('meta');
        document.title = "CocinApp: Gestionar Recetas";
        metaDescription.name = "description";
        metaDescription.content = "Apartado de gestion de recetas y muestreo de tus recetas."
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaDescription);
        };
    }, []);

    const [nombreUsuario, setNombreUsuario] = useState("");
    const [info, setInfo] = useState(false);
    const [recetas, setRecetas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tipoDispositivo, setTipoDispositivo] = useState();

    const domain = import.meta.env.VITE_HOST_API2;
    const host = `${domain}:5000`;
    
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: {primero: "Primer ingrediente"},
        steps: {primero: "Primer paso"},
        tiempo: "",
    });

    const determinarAncho = (ancho) => (1230 <= ancho && ancho <= 1552) ? 1 : 0;
    
    const verificarAncho = () => {
        const ancho = window.innerWidth;
        
        const anchoBoolean = determinarAncho(ancho);

        if (tipoDispositivo === undefined) {
            setTipoDispositivo(anchoBoolean);
            llamado(nombreUsuario, currentPage, tipoDispositivo);
        } else if (tipoDispositivo !== anchoBoolean) {
            setTipoDispositivo(anchoBoolean);
            llamado(nombreUsuario, currentPage, tipoDispositivo);
        }
    };

    useEffect(()=>{

        verificarAncho();

        window.addEventListener('resize', verificarAncho);
    
        return () => {
            window.removeEventListener('resize', verificarAncho);
        };
    },[tipoDispositivo])

    useEffect(() => {
        llamado(nombreUsuario, currentPage, tipoDispositivo);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 130); // 100 ms de retraso
    }, [currentPage, tipoDispositivo]);

    useEffect(() => {
        const llamadoUsuario = async () => {
            try {
                const response = await axios.get("/api/info-usuario");
                if (response.status === 200) {
                    setNombreUsuario(response.data.username);
                    const anchoBoolean = determinarAncho(window.innerWidth);
                    setTipoDispositivo(anchoBoolean);
                    llamado(response.data.username, currentPage, anchoBoolean);
                }
            } catch (err) {
                console.log(err);
            }
        };
        llamadoUsuario();
    }, []);

    const handleInputChange = useCallback((e) => {
        const { id, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    }, []);

    const handleRemoveCategory = useCallback((categoryToRemove) => {
        setFormData((prevData) => ({
            ...prevData,
            categories: prevData.categories.filter(category => category !== categoryToRemove),
        }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setFormData((prevData) => {
            const isSelected = prevData.categories.includes(category);
            const updatedCategories = isSelected
                ? prevData.categories.filter((c) => c !== category)
                : [...prevData.categories, category];

            if (updatedCategories.length <= 4) {
                return { ...prevData, categories: updatedCategories };
            } else {
                alert("Solo puedes seleccionar hasta 4 categorías.");
                return prevData;
            }
        });
    }, []);

    const addRecipe = useCallback(
        async (e) => {
            e.preventDefault();
            const tiempoRegex = /^(?:1\s?(minuto|hora)|[2-9]\d*\s?(minutos|min|horas|hs))$/i;
            if (!tiempoRegex.test(formData.tiempo)){
                console.log("Por favor, ingresa un tiempo válido, como '30 minutos', '30 Min', '1 hora' o '2 horas'.");
                return;
            }
            try {
                const response = await axios.post("/api/receta-nueva", {
                    username: nombreUsuario,
                    receta: formData,
                });
                if (response.status === 201) {
                    llamado(nombreUsuario); 
                    alert("Receta añadida exitosamente.");
                }
            } catch (err) {
                console.log("Error al agregar receta:", err);
            }
        },
        [formData, nombreUsuario]
    );

    const llamado = (nombre, page, ancho) => {
        const llamadoPersonal = async () => {
            try {
                const response = await axios.post(`/api/recetas/personales`, {
                    usernameNH: nombre,
                    page: page, // Cambiado de pageNumber a page
                    ancho: ancho, // Cambiado de anchoboolean a ancho
                });
                if (response.status === 200) {
                    setRecetas(response.data.recetas);
                    setTotalPages(response.data.totalPages); // Agregado para manejar las páginas
                    setInfo(true);
                } else if (response.status === 404) {
                    setInfo(false);
                    alert("No tienes recetas para mostrar.");
                }
            } catch (error) {
                console.log(error);
            }
        };
        llamadoPersonal();
    };
    

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div>
            <div>
                <h2 className="title">Agregar recetas</h2>
                <div className="form-content">
                    <AddForm
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleCategoryChange={handleCategoryChange}
                        handleRemoveCategory={handleRemoveCategory}
                        llamadaDB={addRecipe}
                    />
                </div>
                
            </div>
    {!info ?(
        <>
        <span>No tienes recetas para mostrar</span>
        </>
      ) : (
        <div className="contenedorRecetas">
        <h2 className="title">Mis Recetas</h2>
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
        </div>
      )}
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
        </div>
    );
};

export default GestioRecetas;
