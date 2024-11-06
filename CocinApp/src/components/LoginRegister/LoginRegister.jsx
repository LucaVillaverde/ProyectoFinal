import {React, useState} from "react";
import { useAlert } from '../../context/messageContext';
import "./style.css";
// import Cookies from "js-cookie";
import axios from "axios";

const LoginRegister = ({form,setForm,setIsLoggedIn}) => {
    // Variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [usernameR, setUsernameR] = useState("");
    const [passwordR, setPasswordR] = useState("");
    const [passwordRC, setPasswordRC] = useState("");
    const [message, setMessage] = useState("");

    // Alerta
    const {showAlert} = useAlert();

    // Funciones para registro y login
    const signUp = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`/api/register`, {
                usernameR,
                passwordR,
                passwordRC,
            });

            if (response.status === 201) {
                setMessage(`Usuario creado ID: ${response.data.userId}`);
                setTimeout(() => setMessage(""), 5000);
                try {
                    const cookieTokenResponse = await axios.post(
                        `/api/token-register`,
                        {
                            usernameNH: usernameR,
                        }
                    );
                    if (cookieTokenResponse.status === 201) {
                        setIsLoggedIn(true);
                        location.reload();
                    } else {
                        console.error(
                            "Error al generar el token:",
                            cookieTokenResponse.data.message
                        );
                    }
                } catch (err) {
                    console.error(err);
                    console.error("Error al obtener el token:", err);
                }
            }
        } catch (error) {
            console.error("Error en el Re:", error);
            error.response.data.message ? showAlert(error.response.data.message,'warning'):showAlert('Error de conexion','danger');       
        }
    };

    const login = async (e) => {
        e.preventDefault();
        try {
            // Intentar iniciar sesión
            const response = await axios.post(`/api/login`, {
                username,
                password,
            });
            if (response.status === 200) {
                // Si el login fue exitoso, intenta generar el token
                try {
                    const cookieTokenResponse = await axios.post(
                        `/api/token-login`,
                        {
                            usernameNH: username,
                        }
                    );
                    if (cookieTokenResponse.status === 201) {
                        setIsLoggedIn(true);
                        location.reload();
                    } else if (cookieTokenResponse.status === 403) {
                        setIsLoggedIn(false);
                    }
                } catch (err) {
                    setIsLoggedIn(false);
                }
            }
        } catch (error) {
            console.error("Error en el login:", error);
            error.response.data.message ? showAlert(error.response.data.message,'warning'):showAlert('Error de conexion','danger');

           
        }
    };

    // Funciones del menu
    const closeForm = () => {
        const formulario = document.getElementById("form_login");
        formulario.className = "displayNone";
    };

    const changeForm = () => {
        if (form === "login") {
            console.log('cambio a registro')
            setForm("register");
        } else {
            console.log('cambio a login')
            setForm("login");
        }
    };



    return (
        <div className="displayNone" id="form_login">
            <div className="form-user">
                <div className="form-head">
                    <div className="form-change bts">
                        <button className="form-btnChange" onClick={changeForm}>
                            {form === "login" ? "Registro" : "Login"}
                        </button>
                    </div>
                    <div className="form-close bts">
                        <button className="form-btnClose" onClick={closeForm}>
                            X
                        </button>
                    </div>
                </div>
                <div className="form-user-content">
                    <div className="form">
                        <h2 className="form-title">
                            {form === "login" ? "Login" : "Registro"}
                        </h2>
                        <form onSubmit={form === "login" ? login : signUp}>
                            {form === "login" ? (
                                <>
                                    <input
                                        className="form-input"
                                        placeholder="Usuario"
                                        type="text"
                                        autoComplete="username"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        required
                                    />
                                    <input
                                        className="form-input"
                                        placeholder="Contraseña"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        className="form-input"
                                        placeholder="Usuario"
                                        type="text"
                                        autoComplete="username"
                                        value={usernameR}
                                        onChange={(e) =>
                                            setUsernameR(e.target.value)
                                        }
                                        required
                                    />
                                    <input
                                        className="form-input"
                                        placeholder="Contraseña"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordR}
                                        onChange={(e) =>
                                            setPasswordR(e.target.value)
                                        }
                                        required
                                    />
                                    <input
                                        className="form-input"
                                        placeholder="Confirmar Contraseña"
                                        type="password"
                                        autoComplete="new-password"
                                        value={passwordRC}
                                        onChange={(e) =>
                                            setPasswordRC(e.target.value)
                                        }
                                        required
                                    />
                                </>
                            )}
                            <div className="btn_submit">
                                <button className="btn-form" type="submit">
                                    {form === "login"
                                        ? "Iniciar sesión"
                                        : "Registrarse"}
                                </button>
                            </div>
                        </form>
                        <span>{message}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginRegister;
