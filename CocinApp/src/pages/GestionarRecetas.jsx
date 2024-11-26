import React, { useEffect, useState, memo, useCallback } from "react";
import { useAlert } from '../context/messageContext';
import axios from "axios";
import imageCompression from "browser-image-compression";
// Componentes
import SimpleCard from "../components/card/SimpleCard";
// Imagenes
import img404 from '@assets/image_404.png';
import addIco from '@assets/add.svg';
import delIco from '@assets/del.svg';
import editIco from '@assets/edit.svg';
import delRecipeIco from '@assets/delRecipe.svg';
import imgUpload from '@assets/imgUpl.svg';
import delImage from '@assets/delImage.svg';
import sendIco from '@assets/send.svg';
// Otros
import "../css/form.css";

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
    removeImage,
    handleInputChange,
    handleCategoryChange,
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

        <div className="containerImgDiff">
            <h3 className="lbl-title-form imgDiff">Subir Imagen:</h3>
            <div className="uploadImage">

            {!formData.image?(
                <>
                    <label className='lbl-title-form' id="fileButton" htmlFor="fileInput"><img src={imgUpload} alt="Subir Imagen portada de la receta"/></label>
                    <input id="fileInput" style={{display: "none"}} type="file" name="recipeImage" onChange={handleFileChange} accept="image/*"></input>
                </>
            ):(
                <button className='lbl-title-form' id="fileButton" onClick={removeImage}><img src={delImage} alt="Eliminar imagen subida"/></button>
            )}
                <div className="imagePreview">
                {formData.image ? (
                    <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Previsualización"
                    />
                ):(
                    <img src="../src/assets/imagenDefault.webp" alt="Imagen Default"/>
                )}
                </div>
            </div>
            <label className='lbl-title-form imgDiff' htmlFor="difficulty">Dificultad:</label>
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
        </div>
        
        {/* <label className="lbl-title-form">Previsualizar imagen:</label>
        <div className="imagePreview">
        {formData.image ? (
            <img
                src={URL.createObjectURL(formData.image)}
                alt="Previsualización"
            />
        ) : (
            <h3>No has seleccionado imagen</h3>
        )}
        </div> */}
        

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
                    pattern="^[1-9][^,]*" 
                    placeholder={`Ingrediente ${index + 1} (sin "," porfavor.)`}
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
                    placeholder={`Paso ${index + 1} (sin "," porfavor.)`}
                    value={step}
                    pattern="[^\-]*" 
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

        <button className="btnSend" type="submit"><img src={sendIco}></img></button>
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

    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado
        if (file) {
            try {
                // Opciones de compresión
                const options = {
                    maxWidthOrHeight: 1280, // Ajusta el tamaño máximo
                    initialQuality: 0.8,    // Calidad inicial de la imagen
                    useWebWorker: true,     // Usa Web Workers para mejorar el rendimiento
                    maxSizeMB: 1,
                    fileType: "image/webp", // Cambiar formato a WebP
                    onProgress: (progress) => console.log(`Progreso: ${progress}%`),
                };
    
                // Comprime/redimensiona la imagen
                const compressedFile = await imageCompression(file, options);
                const archivoComprimidoPeso = `${(compressedFile.size / 1024)} KB`;
    
                console.log("Original file size:", file.size / 1024, "KB");
                console.log("Compressed file size:", compressedFile.size / 1024, "KB");
    
                // Actualiza el estado con la imagen comprimida
                setFormData({ ...formData, image: compressedFile });
            } catch (error) {
                console.error("Error al comprimir la imagen:", error);
            }
        }
    };
    const removeImage = ()=>{
        setFormData({ ...formData, image: '../assets/imagenDefault.webp' });
    }

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

    const addRecipe = useCallback(async (e) => {e.preventDefault(); e.stopPropagation();
    
            const tiempoRegex = /^(?:([1-9]|1[0-9]|2[0-4])\s?(hora|horas|h)|([1-9]|[1-5][0-9]|60)\s?(minuto|minutos|m|min|hs))$/i;
    
            if (!tiempoRegex.test(formData.tiempo)) {
                showAlert("Por favor, ingresa un tiempo válido, como '30 minutos', '30 Min', '1 hora' o '2 horas'.", 'warning');
                return;
            }
    
            const { recipeName, difficulty, categories, description, ingredients, steps, tiempo, image } = formData;
    
            if (categories.length < 1) {
                showAlert('Favor de seleccionar por lo menos una categoría.', 'warning');
                return;
            }
    
            if (ingredients.length < 1) {
                showAlert('Favor de indicar los ingredientes de la receta.', 'warning');
                return;
            }
    
            if (steps.length < 1) {
                showAlert('Favor de indicar pasos de la receta.', 'warning');
                return;
            }
            const stepsFormales = formData.steps.map((step) => step.replaceAll(",", "-"));
    
            // Crear un objeto FormData
            const formDataToSend = new FormData();
            formDataToSend.append('recipeName', recipeName);
            formDataToSend.append('difficulty', difficulty);
            formDataToSend.append('categories', categories); // Convertir array de categorías a string
            formDataToSend.append('description', description);
            formDataToSend.append('ingredients', ingredients); // Convertir array de ingredientes a string
            formDataToSend.append('steps', stepsFormales); // Convertir array de pasos a string
            formDataToSend.append('tiempo', tiempo);
            formDataToSend.append('username', nombreUsuario);
    
            // Si se seleccionó una imagen, agregarla al FormData
            if (image) {
                formDataToSend.append('image', image);
            }
    
    
            try {
                const response = await axios.post("/api/receta-nueva", formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                });
    
                if (response.status === 201) {
                    showAlert(`Se añadió ${recipeName}`, 'successful');
                    document.getElementById("fileInput").value = null;
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
                const errorMessage = err.response?.data?.message || 'Error de conexión';
                showAlert(errorMessage, 'danger');
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
                        removeImage={removeImage}
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
                                  image={ image || "https://placehold.co/400x250/000/fff/png"}  
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