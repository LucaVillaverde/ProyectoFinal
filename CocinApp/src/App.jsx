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
// import UserMenu from "./components/UserMenu/UserMenu";


// HOST intercambiables
// const host = 'http://localhost:5000';
const host = 'http://pruebita.webhop.me:5000';
// const host = "http://192.168.0.225:5000";

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
  const [userLocal, setUserLocal] = useState("");
  const User = localStorage.getItem('username'); //           <---------------------<USUARIO ACTUAL
  const [categorias, setCategorias] = useState([]);
  // const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [movil, setMovil] = useState(false);
  const [tabletOrdenador, setTabletOrdenador] = useState(false);
  // PATH
  const links = [
    { href: "/", label: "INICIO" },
    { href: "/buscar", label: "BUSCAR" },
    { href: "/receta", label: "CATEGORIAS" },
  ];
  const [path, setPath] = useState('');
  //LOGICA DE COMPONENTE
  const [visible, setMenuVisible] = useState(false);
  const [fav, setFav] = useState(false);
  const [estado, setEstado] = useState(false);

  const showMenu = () => {
    setMenuVisible(!visible);
  };

  const showPerfil = (User) => {
    alert(`[TU PERFIL]${User}`);
  };

  const favoritos = async () => {
    if (fav){
      setFav(false);
    } else {
      setFav(true);
      try {
        const responseSetFav = await axios.post(`${host}/api/AñadirFavoritos`, {
          fav: true,
          username: User,
        });

        if (responseSetFav.status === 200){
          console.log(`Se ha establecido la receta como favorita con total exito para el usuario: ${User}.`);
          setFav(false);
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

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

  const cat = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.get(`${host}/api/categorias`);
        if (response.status === 200) {
            setCategorias(response.data.categories);
            console.log(response.data.categories);
        }
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        setError(error.message); // Establecer el mensaje de error
    }
};

  const cerrar = () => {
    const form = document.getElementById("form_login");
    if (form) {
      if (estado) {
        // Ocultar el formulario y deshabilitar el scroll
        setEstado(false);
        form.style.display = "none";
      } else {
        // Mostrar el formulario y habilitar el scroll
        form.style.display = "block";
        setEstado(true);
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = Cookies.get("token");
      const storedUsername = localStorage.getItem("username");

      if (token && storedUsername) {
        try {
          const response = await axios.post(
            `${host}/api/checkeo`,
            {
              storedUsername
            }
          );
          
          if (response.status === 200) {
            setIsLoggedIn(true);
          }
          else {
            console.error("No se ha encontrado el usuario:", response.status);
            setIsLoggedIn(false);
            localStorage.removeItem("username");
            Cookies.remove("token");
          }
        } catch (error) {
          console.error("Error al verificar el estado de la sesión:", error);
          setIsLoggedIn(false);
          localStorage.removeItem("username");
          Cookies.remove("token");
        }
      } if (!token && storedUsername) {
        try{
            const response1 = await axios.post(
                `${host}/api/logout`,
                {
                    nombre: storedUsername,
                }
            )
            if (response1.status === 200) {
                console.error(200);
                console.log("La cuenta se ha cerrado debido a falta de credenciales.");
                localStorage.clear("username");
                setIsLoggedIn(false);
            }
        }catch (err){
            console.error(err);
        }
        setIsLoggedIn(false);
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
            const response1 = await axios.post(
                `${host}/api/login`,
                {
                    username: usernameR,
                    password: passwordR,
                }
            );

            if (response1.status === 200){
                console.error(response1.status);
                Cookies.set("token", response1.data.token, { expires: 1 }); //Expira la cookie en un dia, si queres probar si expira podes ponerle 1/1440 para que expire en un minuto.
                localStorage.setItem("username", usernameR);
                setIsLoggedIn(true);
                console.log("Entre correctamente.");
                location.reload();
            } else {
                setMessage(`Credeciales incorrectas.`);
                setTimeout(() => setMessage(""), 5000);
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
      const response = await axios.post(
        `${host}/api/login`, // Asegúrate de que la URL es correcta
        {
          username,
          password,
        }
      );
      if (response.status === 200) {
        console.log(response.status);
        Cookies.set("token", response.data.token, { expires: 1 }); //Expira la cookie en un dia, si queres probar si expira podes ponerle 1/1440 para que expire en un minuto.
        localStorage.setItem("username", username);
        setIsLoggedIn(true);
        setMessage(`Bienvenido/a ${username}!`);
        setTimeout(() => setMessage(""), 5000);
        location.reload();
      } else {
        setMessage(`Credenciales incorrectas.`);
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      setMessage(
        error.response ? error.response.data.message : "Error de conexión"
      );
      setTimeout(() => setMessage(""), 5000);
    }
  };
  

  const logout = async (e) => {
    e.preventDefault();
    let nombre = localStorage.getItem("username");
    try {
      const response = await axios.post(
        `${host}/api/logout`,
        {
          nombre,
        }
      );

      if (response.status === 200) {
        Cookies.remove("token");
        localStorage.removeItem("username");
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
    let nombre = localStorage.getItem('username');
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
                    localStorage.removeItem('username');
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

  // useEffect(() => {
  //   if (estado) {
  //     setEstado(true);
  //   } else {
  //     setEstado(false);
  //   }
  // }, []);


  return (
    <Router>
      <div>
        {/* >-------------------- Login-Register --------------------< */}
        <div
          className="backgroundForm "
          style={{ display: estado ? "block" : "none" }}
          id="form_login"
        >
          <div className="wrapper">
            <div className="card-switch">
              <label className="switch">
                <input type="checkbox" className="toggle" />
                <span className="slider" />
                <span className="card-side" />
                <div className="flip-card__inner">
                  <div className="flip-card__front">
                    <div className="btn_close_menu">
                      <button
                        className="formClose"
                        onClick={() => cerrar()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="black"
                            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                          />
                        </svg>
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
                          Iniciar sesión
                        </button>
                      </form>
                    <p className="message_form">{message}</p>
                  </div>
                  <div className="flip-card__back">
                  <div className="btn_close_menu">
                      <button
                        className="formClose"
                        onClick={() => cerrar()}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="black"
                            d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="title">REGISTRARSE</div>
                    <form onSubmit={signUp} className="flip-card__form" >
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
                        type="password"
                        autoComplete="new-password"
                        value={passwordR}
                        onChange={(e) => setPasswordR(e.target.value)}
                        required
                      />
                      <input
                        className="flip-card__input"
                        placeholder="Contraseña"
                        type="password"
                        autoComplete="new-password"
                        value={passwordRC}
                        onChange={(e) => setPasswordRC(e.target.value)}
                        required
                      />
                      <button className="flip-card__btn">Confirm!</button>
                    </form>
                    <p className="message_form">{message}</p>
                  </div>
                </div>
              </label>
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
                  {/* <button onClick={cat}>Categorias</button> */}
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
                  <UserMenu username={User} logout={(e)=>logout(e)} del_profile={(e)=>deleteUser(e)}/>
                </>
              ) : (
                <>
                  {/* <button onClick={cat}>Categorias</button> */}
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
          <Route path="/receta/:id" element={<Receta username={User}/>} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/perfil/:username" element={<Perfil/>} />

          {/* NO ESTA AUN */}
          <Route path={`/mis-recetas/:${User}`} element={<Perfil />}/>
          <Route path="/modificar-receta/:id" element={<Perfil />} />
          <Route path="/eliminar-receta/:id:" element={<Perfil />} />

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