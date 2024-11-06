import React, { useEffect, useState, memo, useCallback } from "react";
import axios from "axios";
import "../css/form.css";
import "../components/card/card.css";
import SimpleCard from "../components/card/SimpleCard";

const useDebounce = (callback, delay) => {
    const timerRef = React.useRef();

    const debouncedCallback = (...args) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    };

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
        };
    }, []);

    return debouncedCallback;
};

const AddForm = memo(({     
    formData,
    handleInputChange,
    handleCategoryChange,
    handleRemoveCategory,
    handleAddIngredient,
    handleRemoveIngredient,
    handleAddStep,
    handleRemoveStep,
    llamadaDB,
    handleIngredientChange,
    handleStepChange,
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

        <label className='lbl-title-form'>Categoría (máx. 4):</label>
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
            placeholder="Descripción..."
            required
        ></textarea>

        <label className="lbl-title-form">Ingredientes de la Receta:</label>
        {formData.ingredients.map((ingredient, index) => (
            <div key={index}>
                <input
                    className="inptFormRecipe"
                    type="text"
                    placeholder={`Ingrediente ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e)}
                    required
                />
                <button type="button" onClick={() => handleRemoveIngredient(index)}>Eliminar</button>
            </div>
        ))}
        <button type="button" onClick={handleAddIngredient}>
            Agregar ingrediente
        </button>

        <label className="lbl-title-form">Pasos para la elaboración:</label>
        {formData.steps.map((step, index) => (
            <div key={index}>
                <input
                    className="inptFormRecipe"
                    type="text"
                    placeholder={`Paso ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e)}
                    required
                />
                <button type="button" onClick={()=> handleRemoveStep(index)}>Eliminar</button>
            </div>
        ))}
        <button type="button" onClick={handleAddStep}>
            Agregar paso
        </button>

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
));

const GestioRecetas = ({ nombreUsuario }) => {
    useEffect(() => {
        const metaDescription = document.createElement('meta');
        document.title = "CocinApp: Gestionar Recetas";
        metaDescription.name = "description";
        metaDescription.content = "Apartado de gestión de recetas y muestreo de tus recetas."
        document.getElementsByTagName('head')[0].appendChild(metaDescription);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaDescription);
        };
    }, []);

    const [info, setInfo] = useState(false);
    const [recetas, setRecetas] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tipoDispositivo, setTipoDispositivo] = useState();
    const [primeraCarga, setPrimeraCarga] = useState(true);

    const domain = import.meta.env.VITE_HOST_API2;
    const host = `${domain}:5000`;
    
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: [],
        steps: [],
        tiempo: "",
    });

    const handleIngredientChange = useCallback((index, event) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = event.target.value;
        setFormData(prevData => ({
            ...prevData,
            ingredients: newIngredients,
        }));
    }, [formData.ingredients]);

    const handleAddIngredient = useCallback(() => {
        if (formData.ingredients.length < 12) {
            setFormData(prevData => {
                const updatedIngredients = [...prevData.ingredients, ""];
                console.log("Ingredientes actualizados:", updatedIngredients);
                return {
                    ...prevData,
                    ingredients: updatedIngredients,
                };
            });
        } else {
            alert("Puedes agregar hasta 12 ingredientes.");
        }
    }, [formData.ingredients]);

    const handleRemoveIngredient = (index) => {
        setFormData((prevState) => ({
            ...prevState,
            ingredients: prevState.ingredients.filter((_, i) => i !== index),
        }));
    };

    const handleStepChange = useCallback((index, event) => {
        const newSteps = [...formData.steps];
        newSteps[index] = event.target.value;
        setFormData(prevData => ({
            ...prevData,
            steps: newSteps,
        }));
    }, [formData.steps]);

    const handleAddStep = useCallback(() => {
        if (formData.steps.length < 12) {
            setFormData(prevData => {
                const updatedSteps = [...prevData.steps, ""];
                console.log("Pasos actualizados:", updatedSteps);
                return {
                    ...prevData,
                    steps: updatedSteps,
                };
            });
        } else {
            alert("Puedes agregar hasta 12 pasos.");
        }
    }, [formData.steps]);

    const handleRemoveStep = (index) => {
        setFormData((prevState) => ({
            ...prevState,
            steps: prevState.steps.filter((_, i) => i !== index),
        }));
    };

    const determinarAncho = (ancho) => (1230 <= ancho && ancho <= 1552) ? 1 : 0;

    const verificarAncho = useDebounce(() => {
        const ancho = window.innerWidth;
        const nuevoAncho = determinarAncho(ancho);
        console.log("Ancho verificado:", ancho);

        if (nuevoAncho !== tipoDispositivo) {
            setTipoDispositivo(nuevoAncho);
        }
    }, 200);

    useEffect(() => {
        window.addEventListener('resize', verificarAncho);

        verificarAncho();

        return () => {
            window.removeEventListener('resize', verificarAncho);
        };
    }, [verificarAncho]);

    useEffect(() => {
        if (!primeraCarga) {
            setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                window.scrollTo({
                    top: scrollHeight - clientHeight,
                    behavior: 'smooth',
                });
            }, 500);
        }
    }, [recetas]);

    useEffect(() => {
        if (nombreUsuario) {
            llamado(nombreUsuario, currentPage, tipoDispositivo);
            if (!primeraCarga) {
                setPrimeraCarga(false);
            }       
        }
    }, [currentPage, tipoDispositivo, nombreUsuario]);

    const handleInputChange = useCallback((e) => {
        const { id, value } = e.target;

        setFormData(prevData => ({
            ...prevData,
            [id]: value,
        }));
    }, []);

    const handleRemoveCategory = useCallback((categoryToRemove) => {
        setFormData(prevData => ({
            ...prevData,
            categories: prevData.categories.filter(category => category !== categoryToRemove),
        }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setFormData(prevData => {
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
            const tiempoRegex = /^(?:([1-9]|1[0-9]|2[0-4])\s?(hora|horas|h)|([1-9]|[1-5][0-9]|60)\s?(minuto|minutos|m|min|hs))$/i;
            if (!tiempoRegex.test(formData.tiempo)){
                console.log("Por favor, ingresa un tiempo válido, como '30 minutos', '30 Min', '1 hora' o '2 horas'.");
                return;
            }
            if (formData.categories.length < 1){
                console.log("Favor de seleccionar por lo menos una categoria, pedazo de basura.");
                return;
            }
            if (formData.ingredients.length < 1){
                console.log("Favor de indicar los ingredientes de la receta.");
                return;
            }
            if (formData.steps.length < 1){
                console.log("Favor de indicar pasos de la receta.");
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
                    // Reset the form
                    setFormData({
                        recipeName: "",
                        difficulty: "",
                        categories: [],
                        description: "",
                        ingredients: [],
                        steps: [],
                        tiempo: "",
                    });
                }
            } catch (err) {
                console.log("Error al agregar receta:", err);
            }
        },
        [formData]
    );

    const llamado = useCallback((nombre, page, ancho) => { 
        const llamadoPersonal = async () => {
            try {
                const response = await axios.post(`/api/recetas/personales`, {
                    usernameNH: nombre,
                    page: page,
                    ancho: ancho,
                });
                if (response.status === 200) {
                    setRecetas(response.data.recetas);
                    setTotalPages(response.data.totalPages);
                    setInfo(true);
                } else if (response.status === 404) {
                    setInfo(false);
                    alert("No tienes recetas para mostrar.");
                }
            } catch (error) {
                console.log("Error en la llamada a la API:", error);
            }
        };
        llamadoPersonal();
    }, []);
    

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
                        setFormData={setFormData}
                        handleInputChange={handleInputChange}
                        handleCategoryChange={handleCategoryChange}
                        handleRemoveCategory={handleRemoveCategory}
                        handleAddIngredient={handleAddIngredient}
                        handleRemoveIngredient={handleRemoveIngredient}
                        handleAddStep={handleAddStep}
                        handleRemoveStep={handleRemoveStep}
                        handleStepChange={handleStepChange}
                        handleIngredientChange={handleIngredientChange}
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
