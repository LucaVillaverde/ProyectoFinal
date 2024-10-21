import { BrowserRouter as Router, Routes, Route, Await } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./components/LoginRegister/style.css";
import "./components/header/header.css";
import Footer from "./components/footer/Footer";
// import "./components/footer/footer.css";
import "./App.css";
// LOGO
import logoimg from "./assets/logo1.png";
import logoPerfilM from "./assets/LogoPerfilMovil.jpg";
import logoPerfilP from "./assets/LogoPerfilPC.jpg";
// Pages
import Home from "./pages/Home";
import Buscar from "./pages/Buscar";
import Perfil from "./pages/Perfil";
import Receta from "./pages/Receta";
import Page404 from "./pages/404";
import { FormReceta } from "./pages/formReceta";
// import UserMenu from "./components/UserMenu/UserMenu";


// HOST intercambiables
// const host = 'http://localhost:5000';
const host = 'http://pruebita.webhop.me:5000';

function App() {
  // VARIABLES
  // login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  //Register
  const [usernameR, setUsernameR] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [passwordRC, setPasswordRC] = useState("");
  // OTROS
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [movil, setMovil] = useState(false);
  const [tabletOrdenador, setTabletOrdenador] = useState(false);
  const [localUsername, setLocalUsername] = useState('');
  // PATH
  const links = [
    { href: "/", label: "INICIO" },
    { href: "/buscar", label: "BUSCAR" },
    { href: "/receta", label: "TIPOS DE CATEGORIAS" },
  ];
  //LOGICA DE COMPONENTE
  const [visible, setMenuVisible] = useState(false);
  const [form, setForm] = useState(false);
  const [estado, setEstado] = useState(false);


  const showMenu = () => {
    setMenuVisible(!visible);
  };

  useEffect(() => {
    const handleResize = () => {
      setMenuVisible(false);
    };
    //Listen para verificar cambio de pantalla (Resize)
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize); //Quitar el evento
    };
  }, []);
  
  // Login / Register
  useEffect(() => {
    // Esperar hasta que el componente esté montado
    if (!document.getElementById("form_login")) return;
  
    const form = document.getElementById("form_login");
    if (form) {
      if (estado) {
        form.style.display = "block";
      } else {
        form.style.display = "none";
      }
    }
  }, [estado]);

    const clearCookiesAndLogout = () => {
      Cookies.remove("token");
      Cookies.remove("username");
      Cookies.remove("id_user");
      setIsLoggedIn(false);
  };

  const logoutAndClearSession = async (data) => {
    try {
        const logoutResponse = await axios.post(`${host}/api/logout`, data);
        if (logoutResponse.status === 200) {
            const deleteCookieResponse = await axios.post(`${host}/api/cookie/delete`, data);
            if (deleteCookieResponse.status === 200) {
                clearCookiesAndLogout();
            } else {
                console.error('Error al eliminar la cookie:', deleteCookieResponse.data.message);
            }
        } else {
            console.error('Error al cerrar sesión:', logoutResponse.data.message);
            clearCookiesAndLogout();
        }
    } catch (err) {
        console.error('Error en el proceso de cierre de sesión:', err);
        clearCookiesAndLogout();
    }
};

  useEffect(() => {
    const checkLoginStatus = async () => {
        const tokenNav = Cookies.get("token");
        const usernameNav = Cookies.get("username");
        const idUserNav = Cookies.get("id_user");

        // Si todas las cookies están presentes
        if (tokenNav && usernameNav && idUserNav) {
            try {
                const cookieTokenResponse = await axios.post(`${host}/api/checkeo`, { tokenNav, usernameNav, idUserNav });
                if (cookieTokenResponse.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    console.error('Error al verificar las credenciales:', cookieTokenResponse.data.message);
                    clearCookiesAndLogout();
                }
            } catch (err) {
                console.error('Error al verificar credenciales:', err);
                clearCookiesAndLogout();
            }
        }
        // Si falta el token pero el id_user está presente
        else if (!tokenNav && idUserNav) {
            await logoutAndClearSession({ id_user: idUserNav });
        }
        // Si el id_user falta, pero el username y token están presentes
        else if (!idUserNav && usernameNav && tokenNav) {
            console.log("Falta id_user, eliminando cookies.");
            await logoutAndClearSession({ usernameNav });
        }
        // Si el id_user falta pero el username está presente
        else if (!idUserNav && usernameNav) {
            await logoutAndClearSession({ usernameNav });
        }
        // Si el id_user y username faltan pero token está presente
        else if (!idUserNav && !usernameNav && tokenNav) {
            await logoutAndClearSession({ tokenNav });
        }
        // Si el id_user está presente pero falta usernameNav
        else if (idUserNav && tokenNav && !usernameNav) {
            await logoutAndClearSession({ id_user: idUserNav });
        }
    };

    checkLoginStatus();
}, []);




  const signUp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${host}/api/register`, {
        usernameR,
        passwordR,
        passwordRC,
      });

      if (response.status === 201) {
        setMessage(`Usuario creado ID: ${response.data.userId}`);
        setTimeout(() => setMessage(""), 5000);
        try {
          const cookieTokenResponse = await axios.post(
            `${host}/token-register`,
            {
              usernameNH: usernameR,
            }
          );
          if (cookieTokenResponse.status === 201) {
            const { tokenH, usernameH, id_user } = cookieTokenResponse.data; // Declarar esta variable para obtener el token creado.

            if (tokenH && usernameH && id_user) {
              // Uso de operador && para mayor claridad
              Cookies.set("token", tokenH, { expires: 1 }); // Configurar la cookie con el token
              Cookies.set("username", usernameH), { expires: 1 };
              Cookies.set("id_user", id_user);
              setIsLoggedIn(true);
            } else {
              console.error("Token o nombre no encontrados en la respuesta.");

            }
          } else {
            console.error("Error al generar el token:", cookieTokenResponse.data.message);
          }
        } catch (err) {
          console.error(err);
          console.error("Error al obtener el token:", err);
        }
      }
    } catch (err) {
      setMessage(
        err.response ? err.response.data.message : "Error al crear la cuenta."
      );
      setTimeout(() => setMessage(""), 5000);
      console.log(err);
      console.error(err);
    }
  };


  const login = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${host}/api/login`, { username, password });
        if (response.status === 200) {
            try {
                const cookieTokenResponse = await axios.post(`${host}/token-login`, {
                  usernameNH: username,
                });
                if (cookieTokenResponse.status === 201) {
                    const { tokenH, usernameH, id_user } = cookieTokenResponse.data; // Asegúrate de obtener el token
                    // console.log(`El nombre de usuario es: ${nombre}`);
                    // console.log(`El token del usuario es: ${token}`);
                    // console.log(`El id del usuario es: ${id_user}`)
                    if (tokenH && usernameH && id_user) {
                            Cookies.set("token", tokenH, { expires: 1}); // Configurar la cookie con el token
                            Cookies.set("username", usernameH, { expires: 1});
                            Cookies.set("id_user", id_user);
                            setIsLoggedIn(true);
                            setMessage(`Bienvenido/a ${username}!`);
                        } else {
                          console.error('Error no hay datos', 404);
                        }
                    } else {
                      console.error('Error al generar el token:', cookieTokenResponse.data.message);
                      setMessage("Error al generar el token.");
                  }
                } catch (err) {
                  console.error(err);
                }
            }
        }
     catch (error) {
        console.error('Error en el login:', error);
        setMessage(error.response ? error.response.data.message : "Error de conexión");
        setTimeout(() => setMessage(""), 5000);
    }
};
const logout = async (e) => {
    e.preventDefault();
    const idUserNav = Cookies.get("id_user");
    try {
      const response = await axios.post(
        `${host}/api/logout`,
        {
          id_user: idUserNav,
        }
      );

      if (response.status === 200) {
        try {
          const cookieTokenDelete = await axios.post(`${host}/api/cookie/delete`, {
            id_user: idUserNav,
          });

          if (cookieTokenDelete.status === 200) {
            console.error(200);
            console.log("La cuenta se ha cerrado exitosamente.");
            Cookies.remove("username");
            Cookies.remove('token');
            Cookies.remove('id_user');
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.error(err);
          Cookies.remove("username");
          Cookies.remove('token');
          Cookies.remove('id_user');
          setIsLoggedIn(false);
        }

      } else {
        console.error(response.status);
        Cookies.remove("username");
        Cookies.remove('token');
        Cookies.remove('id_user');
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
      Cookies.remove("username");
      Cookies.remove('token');
      Cookies.remove('id_user');
      setIsLoggedIn(false);
    }
  };


  const deleteUser = async (e) => {
    e.preventDefault();
    const user = Cookies.get("id_user");
    console.log(user);
    
    try {
        const deleteResponse = await axios.delete(`${host}/api/delete`, {
            data: { user } // Asegúrate de pasar 'user' dentro de 'data'
        });
        if (deleteResponse.status === 200) {
            setIsLoggedIn(false);
            Cookies.remove('token');
            Cookies.remove("username");
            Cookies.remove("id_user");
            location.reload();
        }
    } catch (err) {
        console.error(err.response ? err.response.data.message : 'Error desconocido al eliminar el usuario.');
        setMessage(err.response ? err.response.data.message : 'Error desconocido al eliminar el usuario.');
        // Asegúrate de eliminar las cookies incluso si hay un error
    }
};

  const llamadoInfoUsuario = async () => {
    const user = Cookies.get("id_user");
    try{
      const llamado = await axios.post(`${host}/api/info-usuario`, {
        id_user: user,
      });
      if (llamado.status === 200){
        setLocalUsername(llamado.data.username);
      }
    }catch(err){
      console.error(err);
    }
  }

const determinarTipoDispositivo = (ancho) => {
  if (ancho < 720) {
      return (1);
  } else {
      return (2);
  } 
};
useEffect(() => {
  const verificarAncho = () => {
      const ancho = window.innerWidth;
      const tipo = determinarTipoDispositivo(ancho);
  
      if (tipo === 1) {
          setMovil(true);
          setTabletOrdenador(false);
      } else {
          setMovil(false);
          setTabletOrdenador(true);
      }
  };

  verificarAncho();

  window.addEventListener('resize', verificarAncho);

  return () => {
      window.removeEventListener('resize', verificarAncho);
  };
}, []);

// NEW LOGIN (FUNCIONES)
const closeForm = () => {
    setEstado(false);
};
const changeForm =() => {
    if (form === "login") {
        setForm("register");
    } else {
        setForm("login");
    }
};
useEffect(() => {
    if (form === "login") {
      setForm("register");
    } else {
      setForm("login");
    }
  }, []);


  return (
    <Router>
      <div>
        {/* >-------------------- Login-Register --------------------< */}
        <div
            className="backgroundForm "
            style={{ display: estado ? "none" : "flex" }}
            id="form_login"
        >
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
                <div className="form-content">
                    <div className="form">
                        <h2 className="form-title">
                            {form === "login" ? "Login" : "Registro"}
                        </h2>
                        <form onSubmit={form === 'login' ? login : signUp}>
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
                                    {form === "login" ? "Iniciar sesión": "Registrarse"}
                                </button>
                            </div>
                        </form>
                        <span>{message}</span>
                    </div>
                </div>
            </div>
        </div>
        {/* >-------------------- HEADER --------------------< */}
        {movil ? (
          <>
          <header>
          <div className="nav-user">
            <div className="seccion">
              {isLoggedIn ? (
                <>
                  <UserMenu username={localUsername} logout={(e)=>logout(e)} del_profile={(e)=>deleteUser(e)}/>
                </>
              ) : (
                <>
                  <button className="btn_user" onClick={() => setEstado(true)}>Ingreso / Registro</button>
                </>
              )}
            </div>
          </div>

          <div className="header_content">
            <div className="header-l">                  
                  <div>
                    <p className="eslogan"><b>Tus <br></br> Recetas <br></br> Simplificadas</b></p>
                  </div>
                  <a href="/">
                    <img className="logo_img" src={logoimg} alt="LOGO" />
                  </a>
              <div
                id="menu"
                className={`hamburger-menu ${visible ? "" : "rotate"}`}
                onClick={showMenu}
              >
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>
            <nav className={`links ${visible ? "" : "menuClose"} `}>
              {links.map((link, index) => (
                <a key={index} href={link.href} className="link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
          </>
        ) : (
          <>
          <header>
          <div className="header_content">
            <div className="header-l">
                <a href="/">
                  <img className="logo_img" src={logoimg} alt="LOGO" />
                </a>
                <div className="containerEslogan">
                  <p className="eslogan">Tus recetas simplificadas</p>
                </div>
                {isLoggedIn ? (
                <>
                  <UserMenu username={localUsername} logout={(e)=>logout(e)} del_profile={deleteUser}/>
                </>
              ) : (
                <>
                  <div className="btn_user-move">
                  <button className="btn_user" onClick={() => setEstado(true)}>Ingreso</button>
                  <button className="btn_user" onClick={() => setEstado(true)}>Registro</button>
                  </div>
                </>
              )}
            </div>
            <nav className={`links ${visible ? "" : "menuClose"} `}>
              {links.map((link, index) => (
                <a key={index} href={link.href} className="link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
          </>
        )}
        {/* >-------------------- MAIN PAGE --------------------< */}
        <Routes>
          <Route path="/" element={<Home host={host}/>} />
          <Route path="/receta/:id" element={<Receta username={localUsername}/>} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/perfil/:username" element={<Perfil/>} />

          {/* NO ESTA AUN */}
          <Route path={`/mis-recetas/:localUsername`} element={<Perfil />}/>
          <Route path="/modificar-receta/:id" element={<Perfil />} />
          <Route path="/eliminar-receta/:id:" element={<Perfil />} />
          <Route path="/nueva-receta/" element={<FormReceta />} />
          {/* Pagina 404 */}
          <Route path="*" element={<Page404/>} />
        </Routes>
        {/* >-------------------- FOOTER --------------------< */}
        <Footer/>
      </div>
    </Router>
  );
};

export default App;


const UserMenu = ({add_recipe, logout, del_profile}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [movil, setMovil] = useState(false);
  const [localUsername, setLocalStorage] = useState('');
  useEffect(() => {
    const llamadoInfoUsuario = async () => {
      const user = Cookies.get("id_user");
      try{
        const llamado = await axios.post(`${host}/api/info-usuario`, {
          id_user: user,
        });
        if (llamado.status === 200){
          setLocalStorage(llamado.data.username);
        }
      }catch(err){
        console.error(err);
      }
    }
    llamadoInfoUsuario();
  }, [])

  const determinarTipoDispositivo = (ancho) => {
    if (ancho < 720) {
        return (1);
    } else {
        return (2);
    } 
  };

  useEffect(() => {
    const verificarAncho = () => {
        const ancho = window.innerWidth;
        const tipo = determinarTipoDispositivo(ancho);
    
        if (tipo === 1) {
            setMovil(true);
        } else {
            setMovil(false);
        }
    };
  
    verificarAncho();
  
    window.addEventListener('resize', verificarAncho);
  
    return () => {
        window.removeEventListener('resize', verificarAncho);
    };
  }, []);

  // Función para alternar la visibilidad del menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar el menú si se hace clic fuera de él
  const closeMenu = (e) => {
    if (!e.target.closest('.menu')) {
      setIsOpen(false);
    }
  };

  const userPerfil = () => {

  }

  return (
    <div>
    {movil ? (
      <>
      <div className="menu-container" onClick={closeMenu}>
      <div className="menu">
              <button className="menu-button" onClick={toggleMenu}>
                 <img className="btn_user-avatar" src={logoPerfilM} alt="avatar"/>
                </button>
        {isOpen && (
          <div className="menu-content">
            <span className="menu-span" >Hola {localUsername}</span>
            <a href={`/mis-recetas/:${localUsername}`}>Mis recetas</a>
            <button className="btn_del btn_menu" onClick={add_recipe}>Añadir Receta</button>
            <button className="btn_del btn_menu" onClick={del_profile}>Borrar cuenta</button>
            <button className="btn_close btn_menu" onClick={logout}>Cerrar sesión</button>
          </div>
        )}
      </div>
    </div>
      </>
    ) : (
      <>
      <div className="menu-container-move">
        <div className="menu-container" onClick={closeMenu}>
          <div className="menu">
              <button className="menu-button" onClick={toggleMenu}>
                 <img className="btn_user-avatar" src={logoPerfilP} alt="avatar"/>
                </button>
        {isOpen && (
          <div className="menu-content">
            <span className="menu-span" >Hola {localUsername}</span>
            <a href={`/mis-recetas/:${localUsername}`}>Mis recetas</a>
            <a href={`/mis-favoritos/:${localUsername}`}>Favoritos</a>
            <button className="btn_del btn_menu" onClick={del_profile}>Borrar cuenta</button>
            <button className="btn_close btn_menu" onClick={logout}>Cerrar sesión</button>
          </div>
        )}
          </div>
        </div>
    </div>
    </>
    )}
  </div>
  );
};