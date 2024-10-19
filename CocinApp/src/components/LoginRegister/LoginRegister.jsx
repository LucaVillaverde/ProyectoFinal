import { React, useState, useEffect } from "react";
import "./style.css";
import Cookies from "js-cookie";
import axios  from 'axios';

const LoginRegister = ({estado, setEstado, texto}) => {
// VARIABLES
    // login
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    //Register
    const [usernameR, setUsernameR] = useState('');
    const [passwordR, setPasswordR] = useState('');
    const [passwordRC, setPasswordRC] = useState('');
    // OTROS
    // const [message, setMessage] = useState('');
    const [isLoggedIn , setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState('');


    useEffect(() => {
        const form = document.getElementById('form_login');
        if (form) {
          if (estado) {
            // Ocultar el formulario y deshabilitar el scroll
            form.style.display = 'none';
            document.body.style.overflow = 'hidden';  // Deshabilitar scroll
          } else {
            // Mostrar el formulario y habilitar el scroll
            form.style.display = 'block';
            document.body.style.overflow = 'auto';  // Volver a habilitar scroll
          }
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
        }, [!estado]);  


    function isLoggedInApp(token, storedUsername){
        const checkLoginStatus = async () => {            
            if (token && storedUsername) {
                try {
                    const response = await axios.post('http://pruebita.webhop.me:5000/api/checkeo', {
                        storedUsername,
                        dato1: 0,
                        dato2: 1,
                    });
    
                    if (response.status === 200) {
                        setIsLoggedIn(true);
                        setUsername(storedUsername);
                    } else {
                        setIsLoggedIn(false);
                        localStorage.removeItem('username');
                        Cookies.remove('token');
                    }
                } catch (error) {
                    console.error('Error al verificar el estado de la sesión:', error);
                    setIsLoggedIn(false);
                    localStorage.removeItem('username');
                    Cookies.remove('token');
                }
            } else {
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }

    const signUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://pruebita.webhop.me:5000/api/register', {
                usernameR,
                passwordR,
                passwordRC,
            });

            if (response.status === 201) {
                setMessage(`Usuario creado ID: ${response.data.userId}`);
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (err) {
            setMessage(err.response ? err.response.data.message : 'Error al crear la cuenta.');
            setTimeout(() => setMessage(''), 5000);
        }
    }

    const login = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://pruebita.webhop.me:5000/api/login',{
                username,
                password,
            });

            if (response.status === 200) {
                console.log(response.status)
                Cookies.set('token', response.data.token, {expires : 1});
                localStorage.setItem('username', username);
                setIsLoggedIn(true);
                setMessage(`Bienvenido/a ${username}!`);
                setTimeout(() => setMessage(''), 5000);
            }else{
                setMessage(`Credeciales incorrectas.`);
                setTimeout(() => setMessage(''), 5000);
            }
        } catch (error) {
            setMessage(error.response ? error.response.data.message : 'Error de conexion');
            setTimeout(() => setMessage(''), 5000);
        }
    }



    return (
        <div className="backgroundForm " style={{ display: estado ? 'block' : 'none'}} id="form_login">
            <div className="wrapper">
                <div className="card-switch">
                    <label className="switch">
                        <input type="checkbox" className="toggle" />
                        <span className="slider" />
                        <span className="card-side" />
                        <div className="flip-card__inner">
                            <div className="flip-card__front">
                                <div className="btn_close_menu">
                                <button className="formClose" onClick={() => setEstado(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="black" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
                                </button>
                                </div>
                                <div className="title">LOGIN</div>
                                <form className="flip-card__form" onSubmit={login}>
                                <input
                                    className="flip-card__input"
                                    placeholder="Usuario"
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <input
                                        className="flip-card__input"
                                        placeholder="Contraseña"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                />
                                    <button className="flip-card__btn" type="submit">
                                        Iniciar sesion
                                    </button>
                                </form>
                                <p className="message_form">{texto}</p>
                            </div>
                            <div className="flip-card__back" onSubmit={signUp}>
                                <div className="title">REGISTRARSE</div>
                                <form className="flip-card__form" action="">
                                    <input
                                    className="flip-card__input"
                                    placeholder="Usuario"
                                    type="text"
                                    autoComplete="username"
                                    value={usernameR}
                                    onChange={(e) => setUsernameR(e.target.value)}
                                    required
                                    />
                                    <input
                                        className="flip-card__input"
                                        placeholder="Contraseña"
                                        type="current-password"
                                        value={passwordR}
                                        onChange={(e) => setPasswordR(e.target.value)}
                                        required
                                    />
                                    <input
                                        className="flip-card__input"
                                        placeholder="Contraseña"
                                        type="current-password"
                                        value={passwordRC}
                                        onChange={(e) => setPasswordRC(e.target.value)}
                                        required
                                    />
                                    <button className="flip-card__btn">
                                        Confirm!
                                    </button>
                                </form>
                                <p className="message_form">{message}</p>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};
export default LoginRegister;
