import { React, useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import "../recipe.css";
import addIco from '../assets/add.svg';
import delIco from '../assets/del.svg';
import { useAlert } from '../context/messageContext';
import "../css/form.css";

const Receta = () => {
    const {showAlert} = useAlert();
    const [localUsername, setLocalUsername] = useState(null);
    const { id } = useParams();
    const [receta, setReceta] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [formData, setFormData] = useState({
        recipe_name: '',
        difficulty: '',
        categories: [],
        description: '',
        ingredients: [], // Define como array vacío
        steps: [],
        tiempo: '',
        image: null,
    });  
    const [show, setShow] = useState(false);

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

    const deleteRecipe = async () => {
        const contraseña = prompt("Confirme su contraseña");
        const referrer = document.referrer;
        const miDominio = window.location.origin;
        if(contraseña){
            const confirmacion = window.confirm('¿Esta seguro de borrar la receta? ésta es la última confirmación.');
            if (confirmacion){
                const eliminarReceta = await axios.post("/api/eliminarReceta", {
                    contraseña,
                    id_recipe: id,
                });
                if (eliminarReceta.status === 200){
                    window.alert(eliminarReceta.data.message);
                    if (referrer.startsWith(miDominio)){
                        window.location.replace(referrer);
                    }else{
                        window.location.replace(`/`);
                    }
                }
            }else{
                window.alert("Esta bien, no te eliminamos la receta.");
            }
        }else{
            window.alert("No indicaste ninguna contraseña.");
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
            });
        }
    }, [receta]);

    const obtenerReceta = async () => {
        try {
            const response = await axios.post('/api/receta-id', { id_recipe: id });
            const recetaData = response.data;
    
            // Convertimos los ingredientes, pasos y categorías
            setReceta({
                ...recetaData,
                ingredients: recetaData.ingredients || [],
                steps: recetaData.steps || [],
                categories: recetaData.categories || []
            });
        } catch (err) {
            console.error("Error al obtener la receta:", err);
        }
    };
    
    
    
    
    const actualizarReceta = async (e) => {
        e.preventDefault();
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
            formDataToSend.append("steps", formData.steps);
            formDataToSend.append("categories", formData.categories);
    
            if (formData.image) {
                formDataToSend.append("image", formData.image);
            }
    
            const response = await axios.put("/api/actualizarReceta", formDataToSend, { withCredentials: true });
    
            if (response.status === 200) {
                showAlert(`Se actualizó ${formData.recipe_name}`, 'successful');
            }
        } catch (err) {
            err.response?.data?.message
            ? showAlert(err.response.data.message, 'warning')
            : showAlert('Error de conexión', 'danger');
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
        setFormData({ ...formData, image: event.target.files[0] });
    };

    const handleIngredientChange = (index, event) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = event.target.value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const handleStepChange = (index, event) => {
        const newSteps = [...formData.steps];
        newSteps[index] = event.target.value;
        setFormData({ ...formData, steps: newSteps });
    };

    return (
        <div>
            {show ? (
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

                    <label className='lbl-title-form' htmlFor="recipeImage">Imagen de receta:</label>
                            <input
                                id="fileInput" 
                                type="file"
                                name="recipeImage"
                                onChange={handleFileChange}
                                accept="image/*"
                            />

                    <label className='lbl-title-form' htmlFor="difficulty">Dificultad:</label>
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
                        <div key={index}>
                            <div className="inpDel">
                            <button type="button" className="btn-del" onClick={() => handleRemoveIngredient(index)}>
                                    <img src={delIco}/>
                            </button>
                            <input
                                className="inptFormRecipe"
                                type="text"
                                placeholder={`Ingrediente ${index + 1} (sin "," porfavor.)`}
                                value={ingredient}
                                pattern="[^,]*"
                                onChange={(e) => handleIngredientChange(index, e)}
                                required
                            />
                            </div>
                        </div>
                    ))}
                    <button type="button" aria-label="Agregar Campo de Ingrediente" className="btn-add" onClick={addIngredient}>
                        <img src={addIco} alt="Añadir Ingrediente" />
                    </button>

                    <label className='lbl-title-form'>Pasos para la elaboración:</label>
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
                            pattern="[^,]*"
                            onChange={(e) => handleStepChange(index, e)}
                            required
                        />
                        </div>
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

                    <button className="btnAdd" type="submit">Enviar</button>
                </form>
                </div>
            ) : (
                <div className="content">
                <div className="recipe">
                <h2 className="recipe-title">{receta?.recipe_name}</h2>
                <section className="recipe-img-cont frame-content">
                    <img
                        src={receta?.image || "https://placehold.co/600x400/000000/FFFFFF/png"}
                        alt={receta?.recipe_name}
                        className="recipe-img"
                    />
                </section>
                <section className="recipe-ingredients-cont frame-content">
                    <h3 className="subtitle">Ingredientes:</h3>
                    <ul>
                        {receta?.ingredients?.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </section>
                <section className="recipe-data-cont frame-content">
                    <h3 className="subtitle">Tiempo de preparacion:</h3>
                    <p>{receta?.tiempo}</p>
                    <h3 className="subtitle">Dificultad:</h3>
                    <p>{receta?.difficulty}</p>
                </section>
                <section className="recipe-steps-cont frame-content">
                    <h3 className="subtitle">Pasos:</h3>
                    <ol>
                        {receta?.steps?.map((step, index) => (
                            <li className="recipe-step" key={index}>
                                {step}
                            </li>
                        ))}
                    </ol>
                    <h3 className="subtitle">Descripción:</h3>
                    <p className="pasos">{receta?.description}</p>
                </section>
                {showMessage && <p>Regístrese para poder dar like</p>}
                <div className="btn_recipe">
                    {localUsername === receta?.username ? (
                        <div className="buttons">
                        <button onClick={editRecipe}>EDITAR</button>
                        <button onClick={deleteRecipe}>ELIMINAR</button>
                        </div>
                    ) : (
                        <span>Aquí iría el botón de favoritos.</span>
                    )}
                </div>
            </div>
        </div>
            )}
        </div>
    );
};

export default Receta;
