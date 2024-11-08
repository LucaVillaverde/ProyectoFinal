import React, { useEffect, useState, memo, useCallback } from "react";
import { useAlert } from '../context/messageContext';
import axios from "axios";
// Componentes
import SimpleCard from "../components/card/SimpleCard";
import "../css/form.css";
import img404 from '../assets/image_404.png';
import addIco from '../assets/add.svg';
import delIco from '../assets/del.svg';
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
    handleFileChange,
    }) => (
    <form id="formularioAgregarReceta" onSubmit={llamadaDB} method="post" encType="multipart/form-data">
        <label className='lbl-title-form' htmlFor="recipeName">Nombre de la Receta:</label>
        <input
            className="inptFormRecipeName"
            type="text"
            id="recipeName"
            value={formData.recipeName}
            placeholder="Nombre de receta"
            onChange={handleInputChange}
            required
        />
        <label className='lbl-title-form' htmlFor="recipeImage">Imagen de receta:</label>
        <input 
            type="file"
            name="recipeImage"
            onChange={handleFileChange}
            accept="image/*"
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
                <div className="inpDel">
                <button type="button" className="btn-del" onClick={() => handleRemoveIngredient(index)}>
                        <img src={delIco}/>
                </button>
                <input
                    className="inptFormRecipe"
                    type="text"
                    placeholder={`Ingrediente ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e)}
                    required
                />
                </div>
            </div>
        ))}
        
        <button type="button" aria-label="Agregar Campo de Ingrediente" className="btn-add" onClick={handleAddIngredient}>
            <img alt="Boton de agregar campo ingrediente" src={addIco}/>
        </button>

        <label className="lbl-title-form">Pasos para la elaboración:</label>
        {formData.steps.map((step, index) => (
            <div key={index}>
                <div className="inpDel">
                <button type="button"  className="btn-del" onClick={()=> handleRemoveStep(index)}>
                        <img src={delIco}/>
                </button>
                <input
                    className="inptFormRecipe"
                    type="text"
                    placeholder={`Paso ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e)}
                    required
                />
                </div>
            </div>
        ))}
        
        <button type="button" aria-label="Agregar Campo de Paso" className="btn-add" onClick={handleAddStep}>
            <img alt="Boton de agregar campo paso" src={addIco}/>
        </button>
        
        <label className='lbl-title-form' htmlFor="tiempo">Tiempo de preparación:</label>
        <input
            className="inptFormTiempo"
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
    const {showAlert} = useAlert();
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

   
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: [],
        steps: [],
        tiempo: "",
        image: null,
    });

    const handleFileChange = (event) => {
        setFormData({ ...formData, image: event.target.files[0] });
    };

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
                return {
                    ...prevData,
                    ingredients: updatedIngredients,
                };
            });
        } else {
            showAlert('Maximo 12 Ingredientes', 'warning');
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
            showAlert('Maximo 12 pasos', 'warning');
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

        if (nuevoAncho !== tipoDispositivo) {
            setTipoDispositivo(nuevoAncho);
        }
    });

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
                showAlert('Maximo 4 categorias', 'warning');
                return prevData;
            }
        });
    }, []);

    const addRecipe = useCallback(
        async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tiempoRegex = /^(?:([1-9]|1[0-9]|2[0-4])\s?(hora|horas|h)|([1-9]|[1-5][0-9]|60)\s?(minuto|minutos|m|min|hs))$/i;
            
            if (!tiempoRegex.test(formData.tiempo)) {
                showAlert("Por favor, ingresa un tiempo válido, como '30 minutos', '30 Min', '1 hora' o '2 horas'.", 'warning');
                return;
            }
            
            if (formData.categories.length < 1) {
                showAlert('Favor de seleccionar por lo menos una categoria.', 'warning');
                return;
            }
            
            if (formData.ingredients.length < 1) {
                showAlert('Favor de indicar los ingredientes de la receta.', 'warning');
                return;
            }
            
            if (formData.steps.length < 1) {
                showAlert('Favor de indicar pasos de la receta.', 'warning');
                return;
            }
    
            // Convertir los ingredientes, pasos y categorías a cadenas separadas por comas
            const ingredientesString = formData.ingredients.join(', ');
            const pasosString = formData.steps.join(', ');
            const categoriasString = formData.categories.join(', ');
    
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("username", nombreUsuario);
                formDataToSend.append("recipeName", formData.recipeName);
                formDataToSend.append("difficulty", formData.difficulty);
                formDataToSend.append("description", formData.description);
                formDataToSend.append("ingredients", ingredientesString);
                formDataToSend.append("steps", pasosString);
                formDataToSend.append("categories", categoriasString);
                formDataToSend.append("tiempo", formData.tiempo);
    
                // Si se tiene una imagen
                if (formData.image) {
                    formDataToSend.append("image", formData.image);
                }
    
                const response = await axios.post("/api/receta-nueva", formDataToSend, { withCredentials: true });
    
                if (response.status === 201) {
                    showAlert(`Se añadió ${formData.recipeName}`, 'successful');
                    setFormData({
                        recipeName: "",
                        difficulty: "",
                        categories: [],
                        description: "",
                        ingredients: [],
                        steps: [],
                        tiempo: "",
                        image: null,
                    });
                    llamado(nombreUsuario, currentPage, tipoDispositivo);
                }
            } catch (err) {
                err.response?.data?.message
                    ? showAlert(err.response.data.message, 'warning')
                    : showAlert('Error de conexión', 'danger');
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
                    if(response.data.recetas.length === 0){
                        console.log("No tenes recetas flaco.");
                    } else {
                        setRecetas(response.data.recetas);
                        setTotalPages(response.data.totalPages);
                        setInfo(true);
                    }
                } else if (response.status === 404) {
                    setInfo(false);
                    console.log("No tienes recetas");
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
                        handleFileChange={handleFileChange}
                    />
                </div>
                
            </div>
    {!info ?(
        <>
            <div className="recipe-cont-404">
                <h2>NO HAY RECETAS</h2>
                <img src={img404} alt="No hay recetas" className='recipe-image-404'/>
            </div>
        </>
      ) : (
        <div className="contenedorRecetas">
        <h2 className="title">Mis Recetas</h2>
        <div className='contenedor-tarjetas'>
        {recetas.map(({ id_recipe, tiempo, image, recipe_name, username, difficulty, categories }) => (
                          <a className="card" href={`/receta/${id_recipe}`} key={id_recipe}>
                              <SimpleCard
                                  tiempo={tiempo}
                                  image={"https://placehold.co/400x250/000/fff/png"}  
                                  title={recipe_name}
                                  author={username}
                                  dificulty={difficulty}
                                  category={categories}  
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