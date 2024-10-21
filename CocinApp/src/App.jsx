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
const host = 'http://localhost:5000';
// const host = 'http://pruebita.webhop.me:5000';

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
  // PATH
  const links = [
    { href: "/", label: "INICIO" },
    { href: "/buscar", label: "BUSCAR" },
    { href: "/receta", label: "CATEGORIAS" },
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



  useEffect(() => {
    const checkLoginStatus = async () => {
      const tokenNav = Cookies.get("token");
      const storedUsername = Cookies.get("username");

      if (tokenNav && storedUsername) {
        try {
          const cookieTokenResponse = await axios.post(`${host}/api/checkeo`, {
            cookieToken: tokenNav,
            username: storedUsername,
          });
          console.error(cookieTokenResponse.status);
          if (cookieTokenResponse.status === 200) {
              setIsLoggedIn(true);
          } else {
              console.error('Error al verificar las credenciales:', cookieTokenResponse.data.message);
              console.error(cookieTokenResponse.status);
          }
      } catch (err) {
          console.error('Error, algo ha salido mal al verificar credenciales:', err);
      }
      } if (!tokenNav && storedUsername) {
        try{
            const response1 = await axios.post(
                `${host}/api/logout`,
                {
                    nombre: storedUsername,
                }
            )
            if (response1.status === 200) {
              try {
                const cookieTokenDelete = await axios.post(`${host}/api/cookie/delete`, {
                  nombre: storedUsername,
                });

                if (cookieTokenDelete.status === 200) {
                  console.error(200);
                  console.log("La cuenta se ha cerrado debido a falta de credenciales.");
                  Cookies.remove("username");
                  setIsLoggedIn(false);
                }
              } catch (err) {
                console.error(err);
                Cookies.remove("username");
                setIsLoggedIn(false);
                Cookies.remove('token');
              }
            } else {
              console.error(response1.status, response1.data.message);
              Cookies.remove("username");
              setIsLoggedIn(false);
            }
        }catch (err){
            console.error(err);
        }
      }
    };

    checkLoginStatus();
  }, []);

  const signUp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${host}/api/register`,
        {
          usernameR,
          passwordR,
          passwordRC,
        }
      );

      if (response.status === 201) {
        setMessage(`Usuario creado ID: ${response.data.userId}`);
        setTimeout(() => setMessage(""), 5000);
        try {
              try {
                    const cookieTokenResponse = await axios.post(`${host}/token-generator`,{
                      username: usernameR,
                    });
                    if (cookieTokenResponse.status === 201) {
                      const { token, nombre, id_user } = cookieTokenResponse.data; // Declarar esta variable para obtener el token creado.
                  
                      if (token && nombre && id_user) { // Uso de operador && para mayor claridad
                          try {
                              const response2 = await axios.post(`${host}/api/agregar-token`, {
                                  cookieToken: token,
                                  username: nombre,
                                  id_user,
                              });
                  
                              if (response2.status === 201) {
                                  Cookies.set("token", token, { expires: 1 }); // Configurar la cookie con el token
                                  Cookies.set("username", nombre);
                                  setIsLoggedIn(true);
                                  setEstado(false);
                              }
                          } catch (err) {
                              console.error('Error al agregar el token:', err);
                          }
                      } else {
                          console.error('Token o nombre no encontrados en la respuesta.');
                      }
                  } else {
                      console.error('Error al generar el token:', cookieTokenResponse.data.message);
                  }
                  
                } catch (err) {
                    console.error('Error al obtener el token:', err);
                    setMessage("Error al obtener el token.");
                }
        } catch (err){
            console.error(err);
        }
      }
    } catch (err) {
      setMessage(
        err.response ? err.response.data.message : "Error al crear la cuenta."
      );
      setTimeout(() => setMessage(""), 5000);
    }
  };
  const login = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(`${host}/api/login`, { username, password });
        if (response.status === 200) {
            try {
                const cookieTokenResponse = await axios.post(`${host}/token-generator`,{username : username});
                if (cookieTokenResponse.status === 201) {
                    const { token, nombre } = cookieTokenResponse.data; // Asegúrate de obtener el token
                    Cookies.set("token", token, { expires: 1 }); // Configurar la cookie con el token
                    Cookies.set("username", nombre);
                    setIsLoggedIn(true);
                    setMessage(`Bienvenido/a ${username}!`);
                    setTimeout(() => setMessage(""), 5000);
                    setEstado(false);
                } else {
                    console.error('Error al generar el token:', cookieTokenResponse.data.message);
                    setMessage("Error al generar el token.");
                }
            } catch (err) {
                console.error('Error al obtener el token:', err);
                setMessage("Error al obtener el token.");
            }
        } else {
            setMessage("Credenciales incorrectas.");
        }
    } catch (error) {
        console.error('Error en el login:', error);
        setMessage(error.response ? error.response.data.message : "Error de conexión");
    }
    setTimeout(() => setMessage(""), 5000);
};
const logout = async (e) => {
    e.preventDefault();
    let nombre = Cookies.get("username");
    try {
      const response = await axios.post(
        `${host}/api/logout`,
        {
          nombre,
        }
      );

      if (response.status === 200) {
        Cookies.remove("token");
        Cookies.remove("username");
        setIsLoggedIn(false);
        console.error(response.status);
        location.reload();
      } else {
        console.error(response.status);
      }
    } catch (err) {
      console.error(err);
    }
  };
const deleteUser = async (e) => {
    e.preventDefault();
    let nombre = Cookies.get("username");
    if (nombre) {
        try {
                const deleteResponse = await axios.delete(`${host}/api/delete`, {
                    data: { nombre }
                });
                if (deleteResponse.status === 200) {
                    console.log(`Usuario ${nombre} eliminado correctamente.`);
                    setMessage(`Usuario ${nombre} eliminado correctamente.`);
                    setIsLoggedIn(false);
                    Cookies.remove('token');
                    Cookies.remove("username");
                    location.reload();
                }
            } catch (err) {
            console.error(err.response ? err.response.data.message : 'Error desconocido al eliminar el usuario.');
            setMessage(err.response ? err.response.data.message : 'Error desconocido al eliminar el usuario.');
        }
    } else {
        console.error('Tienes que estar logueado para eliminar tu cuenta.');
        setMessage('Tienes que estar logueado para eliminar tu cuenta.');
    }
};
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
    console.log(estado);
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
                  <UserMenu username={User} logout={(e)=>logout(e)} del_profile={(e)=>deleteUser(e)}/>
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
                  <UserMenu username={Cookies.get("username")} logout={(e)=>logout(e)} del_profile={(e)=>deleteUser(e)}/>
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
          <Route path="/receta/:id" element={<Receta username={Cookies.get("username")}/>} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/perfil/:username" element={<Perfil/>} />

          {/* NO ESTA AUN */}
          <Route path={`/mis-recetas/:${Cookies.get("username")}`} element={<Perfil />}/>
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


const UserMenu = ({username,add_recipe ,logout, del_profile}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [movil, setMovil] = useState(false);


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
            <span className="menu-span" >Hola {username}</span>
            <a href={`/mis-recetas/:${username}`}>Mis recetas</a>
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
            <span className="menu-span" >Hola {username}</span>
            <a href={`/mis-recetas/:${username}`}>Mis recetas</a>
            <a href={`/mis-favoritos/:${username}`}>Favoritos</a>
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