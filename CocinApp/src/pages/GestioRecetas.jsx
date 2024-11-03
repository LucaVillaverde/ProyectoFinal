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

            <label>Categoria (4 max):</label>
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
            <div className="chipsContainer">
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
    const domain = import.meta.env.VITE_HOST_API2;
    const host = `${domain}:5000`;
    
    const [formData, setFormData] = useState({
        recipeName: "",
        difficulty: "",
        categories: [],
        description: "",
        ingredients: "",
        steps: "",
        tiempo: "",
    });

    useEffect(() => {
        const llamadoUsuario = async () => {
            try {
                const response = await axios.get("/api/info-usuario");
                if (response.status === 200) {
                    setNombreUsuario(response.data.username);
                    llamado(response.data.username);
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

    const llamado = (nombre) => {
        const llamadoPersonal = async () => {
            try {
                const response = await axios.post(`/api/recetas/personales`, {
                    usernameNH: nombre,
                });
                if (response.status === 200) {
                    setRecetas(response.data.recetas);
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
                
            </div>
        </>
    );
};

export default GestioRecetas;
