import { React, useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
// Imagenes
import addIco from '../assets/add.svg';
import delIco from '../assets/del.svg';
import editIco from '../assets/edit.svg';
import delRecipeIco from '../assets/delRecipe.svg';
import imgUpload from '../assets/imgUpl.svg';
import sendIco from '../assets/send.svg';
//  Otros
import "../recipe.css";
import "../css/form.css";
import { useAlert } from '../context/messageContext';
import {useConfirm} from "../context/confirmContext";

const Receta = () => {
    const [localUsername, setLocalUsername] = useState(null);
    const { id } = useParams();
    const [receta, setReceta] = useState(null);
    const {showConfirm} = useAlert();
    const {openConfirm} = useConfirm();

    const [formData, setFormData] = useState({
        recipe_name: '',
        difficulty: '',
        categories: [],
        description: '',
        ingredients: [], // Define como array vacío
        steps: [],
        tiempo: '',
        image: null,
        author: null,
    });  
    const [show, setShow] = useState(false);
    const [imagenRecipe, setImagenRecipe] = useState(null);
    const [cargandoReceta, setCargandoReceta] = useState(true);
    const [testing, setTesting] = useState(true);

    useEffect(() => {
        const llamadoInfoUsuario = async () => {
          try {
            const llamado = await axios.get("/api/info-usuario"); // Agrega comillas alrededor de la URL
            if (llamado.status === 200) {
              setLocalUsername(llamado.data.username);
            }
            
            if (llamado.status === 401) {
              console.log(`${llamado.status}, No estás logueado.`); // Cambia a backticks
            }
          } catch (err) {
            console.log("Error en la solicitud.", err.message);
          }
        };
        llamadoInfoUsuario();
    }, []);  

    useEffect(() => {
        obtenerReceta();
    }, [id]);
    

    const editRecipe = async () => {
        if (show) {
            setShow(false);
        }
        else {
            setShow(true);
        }
    }

    const deleteRecipe = async (contraseña) => {
        const referrer = document.referrer;
        const miDominio = window.location.origin;



        if(contraseña || contraseña.length === 0){
            // const confirmacion = window.confirm('¿Esta seguro de borrar la receta? ésta es la última confirmación.');
            const confirmacion = await openConfirm('SI o NO');
            


            console.log(confirmacion);
            // if (confirmacion){
            //     try{
            //         const eliminarReceta = await axios.post("/api/eliminarReceta", {
            //             contraseña,
            //             id_recipe: id,
            //         });
            //         if (eliminarReceta.status === 200){
            //             if (referrer.startsWith(miDominio)){
            //                 window.location.replace(referrer);
            //             }else{
            //                 window.location.replace(`/`);
            //             }
            //         }
            //     } catch (err) {
            //         if (err.response.data.message === "Contraseña incorrecta."){
            //             showAlert(err.response.data.message, 'warning');
            //         } else {
            //             showAlert(err.response.data.message, 'danger');
            //         }
            //     }  
            // }
        }else{
            
        }
    }

    useEffect(() => {
        if (receta) {
            setFormData({
                recipe_name: receta.recipe_name || '',
                difficulty: receta.difficulty || '',
                categories: receta.categories || [],
                description: receta.description || '',
                ingredients: Array.isArray(receta.ingredients) ? receta.ingredients : [],
                steps: Array.isArray(receta.steps) ? receta.steps : [], // Verifica que sea array
                tiempo: receta.tiempo || '',
                image: receta.image,
                author: receta.username,
            });
        }
    }, [receta]);

    const obtenerReceta = async () => {
        try {
            const response = await axios.post('/api/receta-id', { id_recipe: id });
            const recetaData = response.data;
    
            // Convertimos los ingredientes, pasos y categorías
            if (response.status === 200) {
                // Se convierte en un array a steps (separado por "," cada elemento del array).
                const pasosFormato = recetaData.steps.join(',');
                
                // tomamos el array dividido por coma cada paso y en cada paso especifico remplazamos el guion por una coma con espacio.
                const pasosSeparados = pasosFormato.split(',').map((step) => step.trim().replace(/-/g, ", "));
                                
                setReceta({
                    ...recetaData,
                    ingredients: recetaData.ingredients || [],
                    steps: pasosSeparados || [],
                    categories: recetaData.categories || [],
                    author: recetaData.username,
                });
    
                setImagenRecipe(recetaData.image);
                return true;
            }
        } catch (err) {
            console.error("Error al obtener la receta:", err);
        }
    };
    
    


    useEffect(()=>{
        setCargandoReceta(false);
    },[imagenRecipe])
    
    
    const actualizarReceta = async (e) => {
        e.preventDefault();
        console.log(`Modo testeo: ${testing}`);
        const stepsFormales = formData.steps.map((step) => step.replaceAll(",", "-"));

        if (!testing){
            console.log("Testeando mi gente.");
        } else {
            try {
                const formDataToSend = new FormData();
                formDataToSend.append("username", localUsername);
                formDataToSend.append("id_recipe", id); // Enviar el id de la receta para actualizarla
                formDataToSend.append("recipeName", formData.recipe_name);
                formDataToSend.append("difficulty", formData.difficulty);
                formDataToSend.append("description", formData.description);
                formDataToSend.append("tiempo", formData.tiempo);
        
                // Convertir los arrays a cadenas separadas por comas para enviar al back end
                formDataToSend.append("ingredients", formData.ingredients);
                formDataToSend.append("steps", stepsFormales);
                formDataToSend.append("categories", formData.categories);
                
                // const stepsFormales = formData.steps.map((step) => step.replace(",", "-"));
                
                
                if (formData.image) {
                    formDataToSend.append("image", formData.image);
                }
        
                const response = await axios.put("/api/actualizarReceta", formDataToSend, { withCredentials: true });
                let mensajeOK = "Se obtuvo la info";
                let conseguido = 'successful';
                // let advertencia = "warning";
        
                if (response.status === 200) {
                    showAlert(`Se actualizó ${formData.recipe_name}`, 'successful');
                    let info = obtenerReceta();
    
                    if (info){
                        editRecipe();
                        setInterval(showAlert(mensajeOK, conseguido));
                    } else {
                        showAlert('no se obtuvo la info', 'warning');
                    }
                }
            } catch (err) {
                err.response?.data?.message
                ? showAlert(err.response.data.message, 'warning')
                : showAlert('Error de conexión', 'danger');
            }
        }
    };
    

    const addIngredient = () => {
        if (formData.ingredients.length < 12){
            setFormData((prevData) => ({
                ...prevData,
                ingredients: [...prevData.ingredients, '']
            }));
        } else {
            showAlert('Maximo 12 Ingredientes', 'warning');
        }
    };

    const addStep =() => {
        if (formData.steps.length < 12){
            setFormData((prevData) => ({
                ...prevData,
                steps: [...prevData.steps, '']
            }));
        } else {
            showAlert('Maximo 12 Pasos', 'warning');
        }
    };



    const handleRemoveIngredient = (index) => {
        const newIngredients = [...formData.ingredients];
        newIngredients.splice(index, 1);
        setFormData({ ...formData, ingredients: newIngredients });
    };
    
    const handleRemoveStep = (index) => {
        const newSteps = [...formData.steps];
        newSteps.splice(index, 1);
        setFormData({ ...formData, steps: newSteps });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleCheckboxChange = (category) => {
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
    };

    const handleFileChange = (event) => {
        setFormData({ ...formData, image: event.target.files[0]});
    };

    const handleIngredientChange = (index, event) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = event.target.value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handleStepChange = (index, e) => {
        const newSteps = [...formData.steps];
        newSteps[index] = e.target.value;
        setFormData({ ...formData, steps: newSteps });
      };

    return (
        <div>
            {cargandoReceta ? (
                <div>
                    <h1>Cargando Receta....</h1>
                </div>
            ) : show ? (
                <div>
                <h3 id="editarReceta">Formulario Editar Receta</h3>
                <div className="form-content">
                    <form id="formularioAgregarReceta" onSubmit={(e) => actualizarReceta(e)}>
                        <label className="lbl-title-form" htmlFor="recipeName">Nombre de la Receta:</label>
                        <input
                            type="text"
                            className="inptFormRecipeName"
                            id="recipe_name"
                            value={formData.recipe_name}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="containerImgDiff">
                        <h3 className="lbl-title-form imgDiff">Subir Imagen:</h3>
                        <label className='lbl-title-form' id="fileButton" htmlFor="fileInput"><img src={imgUpload} alt="Subir Imagen portada de la receta"/></label>
                        <input id="fileInput" style={{display: "none"}} type="file" name="recipeImage" onChange={handleFileChange} accept="image/*"></input>
    
                        <label className='lbl-title-form imgDiff' htmlFor="difficulty">Dificultad:</label>
                        <select
                            id="difficulty"
                            className="selectRecipe"
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

                        <label className='lbl-title-form'>Categoría (máx. 4):</label>
                        <div className="categorias">
                            {["Entrada", "Sopa", "Caldo", "Ensalada", "Plato Principal", "Guarnición", "Postre", "Bebida", "Vegetariana", "Saludable"].map((category) => (
                                <label key={category} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.categories.includes(category)}
                                        onChange={() => handleCheckboxChange(category)}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                       
                        <label className='lbl-title-form' htmlFor="description">Descripción de la Receta:</label>
                        <textarea
                            id="description"
                            className="textAreaDesc"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        ></textarea>
    
                        <label className='lbl-title-form'>Ingredientes:</label>
                        {formData.ingredients.map((ingredient, index) => (
                            <div key={index} className="inpDel">
                                <button type="button" className="btn-del" onClick={() => handleRemoveIngredient(index)}>
                                    <img src={delIco} alt="Eliminar"/>
                                </button>
                                <input
                                    className="inptFormRecipe"
                                    type="text"
                                    placeholder={`Ingrediente ${index + 1} (sin "," por favor.)`}
                                    value={ingredient}
                                    pattern="^[1-9][^,]*"
                                    onChange={(e) => handleIngredientChange(index, e)}
                                    required
                                />
                            </div>
                        ))}
                        <button type="button" aria-label="Agregar Campo de Ingrediente" className="btn-add" onClick={addIngredient}>
                            <img src={addIco} alt="Añadir Ingrediente" />
                        </button>
    
                        <label className='lbl-title-form'>Pasos para la elaboración:</label>
                        {formData.steps.map((step, index) => (
                            <div key={index} className="inpDel">
                                <button type="button" className="btn-del" onClick={() => handleRemoveStep(index)}>
                                <img src={delIco} alt="Eliminar"/>
                                </button>
                                <input
                                className="inptFormRecipe"
                                type="text"
                                placeholder={`Paso ${index + 1} (sin "-" por favor.)`}
                                value={step} // Muestra el paso con comas en lugar de guiones
                                onChange={(e) => handleStepChange(index, e)} // Maneja el cambio de texto
                                required
                                />
                            </div>
                        ))}
                        <button type="button" aria-label="Agregar Campo de Paso" className="btn-add" onClick={addStep}>
                            <img src={addIco} alt="Añadir Paso" />
                        </button>
    
                        <label className='lbl-title-form' htmlFor="tiempo">Tiempo de preparación:</label>
                        <input
                            type="text"
                            id="tiempo"
                            className="inptFormTiempo"
                            value={formData.tiempo}
                            onChange={handleInputChange}
                            required
                        />
    
                        <button className="btnSend" type="submit"><img src={sendIco}></img></button>
                    </form>
                </div>
                </div>
            ) : (
                <div className="content">
                    <div className="recipe">
                        <h2 className="recipe-title">{`${receta?.recipe_name} by ${receta?.author}`}</h2>
                        <section className="recipe-img-cont frame-content">
                            <img
                                src={imagenRecipe}
                                alt={receta?.recipe_name}
                                className="recipe-img"
                            />
                        </section>
                        <section className="recipe-steps-cont frame-content">
                    
                            <div className="contenedorDescripcion">
                                <h3 className="subtitle">Categoria/s:</h3>
                                <ul className="ingredientesReceta">
                                {receta?.categories?.map((category, index) => (
                                    <li className="recipe-ingredient" key={index}>
                                        {category}
                                    </li>
                                ))}
                            </ul>
                                <h3 className="subtitle">Descripción:</h3>
                                <p className="descripcion">{receta?.description}</p>
                            </div>
                        </section>
                        <section className="recipe-data-cont frame-content">
                            <h3 className="subtitle">Tiempo de preparación:</h3>
                            <p>{receta?.tiempo}</p>
                            <h3 className="subtitle">Dificultad:</h3>
                            <p>{receta?.difficulty}</p>
                        </section>

                        <section className="recipe-ingredients-cont frame-content">
                            <h3 className="subtitle">Ingredientes:</h3>
                            <ul className="ingredientesReceta">
                                {receta?.ingredients?.map((ingredient, index) => (
                                    <li className="recipe-ingredient" key={index}>
                                        {ingredient}
                                    </li>
                                ))}
                            </ul>
                            <h3 className="subtitle">Pasos:</h3>
                            <ol className="pasosReceta">
                                {receta?.steps?.map((step, index) => (
                                    <li className="recipe-step" key={index}>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </section>
                        
                        {localUsername === receta?.username && (
                            <div className="btn_recipe">
                                <div className="buttons">
                                    <button className="btn_author-recipe" onClick={editRecipe}>
                                        <img src={editIco} alt="Editar Receta" />
                                    </button>
                                    <button className="btn_author-recipe" onClick={()=>showConfirm(deleteRecipe)}>
                                        <img src={delRecipeIco} alt="Eliminar Receta"/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Receta;
