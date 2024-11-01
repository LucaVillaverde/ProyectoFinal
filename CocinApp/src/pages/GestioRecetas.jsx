import React, { useEffect, useState, memo, useCallback } from "react";
import Cookies from "js-cookie";
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
            <label htmlFor="recipeName">Nombre de la Receta:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="recipeName"
                value={formData.recipeName}
                placeholder="Nombre de receta"
                onChange={handleInputChange}
                required
            />

            <label htmlFor="difficulty">Dificultad:</label>
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

            <label htmlFor="categories">Categoria (4 max):</label>
            <div className="categorias">
                <select
                    id="categories"
                    className="categories"
                    multiple
                    onChange={handleCategoryChange}
                >
                    <option value="Entrada">Entrada</option>
                    <option value="Sopa">Sopa</option>
                    <option value="Caldo">Caldo</option>
                    <option value="Ensalada">Ensalada</option>
                    <option value="Plato Principal">Plato Principal</option>
                    <option value="Guarnición">Guarnición</option>
                    <option value="Postre">Postre</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Vegetariana">Vegetariana</option>
                    <option value="Saludable">Saludable</option>
                </select>
                <div className="chips">
                    <strong>Seleccionado</strong>
                    {formData.categories.map((category) => (
                        <span key={category} className="chip">
                            {category}{" "}
                            <button
                                type="button"
                                onClick={() => handleRemoveCategory(category)}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <label htmlFor="description">Descripción de la Receta:</label>
            <textarea
                className="textAreaDesc"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripcion..."
                required
            ></textarea>

            <label htmlFor="ingredients">Ingredientes de la Receta:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="ingredients"
                placeholder='Ingredientes separados por ","'
                value={formData.ingredients}
                onChange={handleInputChange}
                required
            />

            <label htmlFor="steps">Pasos para la elaboración:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="steps"
                placeholder="Pasos de la receta"
                value={formData.steps}
                onChange={handleInputChange}
                required
            />

            <label htmlFor="tiempo">Tiempo de preparación:</label>
            <input
                className="inptFormRecipe"
                type="text"
                id="tiempo"
                placeholder="30 minutos / 1 hora"
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
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [info, setInfo] = useState(false);
    const [recetas, setRecetas] = useState([]);
    // const [info, setInfo] = useState(false);
    const domain = import.meta.env.VITE_HOST_API2;
    const host = `${domain}:5000`;
    // VARIABLES DE FORMULARIO
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: "",
        steps: "",
        tiempo: "",
    });

    // Effect para obtener información del usuario
    useEffect(() => {
        const llamadoUsuario = async () => {
            try {
                const response = await axios.post("/api/info-usuario", {
                    id_user: Cookies.get("id_user"),
                });
                if (response.status === 200) {
                    setNombreUsuario(response.data.username);
                    llamado(response.data.username);
                }
            } catch (err) {
                console.log(err, "hola");
            }
        };
        llamadoUsuario();
    }, []);

    // Effect para imprimir el nombre del usuario
    useEffect(() => {
        console.log(nombreUsuario);
    }, [nombreUsuario]);

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
            categories: prevData.categories.filter(
                (category) => category !== categoryToRemove
            ),
        }));
    }, []);

    const handleCategoryChange = useCallback(
        (e) => {
            const selectedValues = Array.from(
                e.target.selectedOptions,
                (option) => option.value
            );

            // Comprobar si el número total de categorías seleccionadas no excede 4
            if (selectedValues.length + formData.categories.length <= 4) {
                // Actualizar las categorías
                setFormData((prevData) => ({
                    ...prevData,
                    categories: [
                        ...new Set([...prevData.categories, ...selectedValues]),
                    ], // Unir y eliminar duplicados
                }));
            } else {
                alert("Solo puedes seleccionar hasta 4 categorías.");
            }
        },
        [formData.categories.length]
    );

    // FUNCIONES
    const addRecipe = useCallback(
        (e) => {
            e.preventDefault();
            const agregarReceta = async () => {
                try {
                    const response = await axios.post("/api/receta-nueva", {
                        username: nombreUsuario,
                        receta: formData,
                    });
                    if (response.status === 201){
                        agregarReceta();
                        llamado();
                    }
                } catch (err) {
                    console.log(err, "Hola, ha habido un error xd.");
                }
            };
        },
        [formData]
    );

    const llamado = (nombre) => {
        const llamadoPersonal = async () => {
            try {
                const response = await axios.post(`/api/recetas/personales`, {
                    usernameNH: nombre,
                });
                if (response.status === 200) {
                    setRecetas(response.data.recetas);
                    console.log(response.data.recetas);
                    setInfo(true);
                } else if (response.status === 404) {
                    setInfo(false);
                    window.alert("No tienes recetas para mostrar.");
                    console.log("No tienes recetas para mostrar.");
                }
            } catch (error) {
                console.log(error);
            }
        };
        llamadoPersonal();
    };

    return (
        <>
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
                <h2 className="title">Mis recetas</h2>

                {!info ? (
                    <>
                        <span>No tienes recetas para mostrar</span>
                    </>
                ) : (
                    <>
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
                                            }
                                            title={recipe_name}
                                            author={username}
                                            dificulty={difficulty}
                                            category={categories}
                                        />
                                    </a>
                                )
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default GestioRecetas;
