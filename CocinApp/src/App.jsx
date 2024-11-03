// Importaciones de Librerias
import { BrowserRouter as Router, Routes, Route, Navigate,} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// LOGO
import logoimg from "./assets/logo1.png";
import logoPerfilM from "./assets/LogoPerfilMovil.jpg";
import logoPerfilP from "./assets/LogoPerfilPC.jpg";
// Componentes
import Footer from "./components/footer/Footer";
import LoginRegister from "./components/LoginRegister/LoginRegister";
// Pages
import Home from "./pages/Home";
import Buscar from "./pages/Buscar";
import Perfil from "./pages/Perfil";
import Receta from "./pages/Receta";
import Tienda from "./pages/Tienda";
import Page404 from "./pages/404";
import GestioRecetas from "./pages/GestioRecetas";
// Otros
import "./css/app.css";
import "./components/header/header.css";
// import "./components/LoginRegister/style.css";


function App() {
    // OTROS
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [message, setMessage] = useState("");
    const [movil, setMovil] = useState(false);
    const [tabletOrdenador, setTabletOrdenador] = useState(false);
    //LOGICA DE COMPONENTE
    const [visible, setMenuVisible] = useState(false);
    const [form, setForm] = useState("login");
    const [localUsername, setLocalUsername] = useState("");
    
    // PATH
    const links = [
        { href: "/", label: "INICIO" },
        { href: "/Buscar", label: "BUSCAR" },
        { href: "/tienda", label: "TIENDA" },
    ];
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

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const cookieTokenResponse = await axios.post(
                    `/api/checkeo`,
                    {},
                    { withCredentials: true }
                ); // Asegúrate de incluir withCredentials
                if (cookieTokenResponse.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    console.error(
                        "Error al verificar las credenciales:",
                        cookieTokenResponse.data.message
                    );
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error("Error al verificar credenciales:", err);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);



  const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/logout`, {});
            if (response.status === 200) {
                try {
                    const cookieTokenDelete = await axios.post(
                        `/api/cookie/delete`,
                        {}
                    );

                    if (cookieTokenDelete.status === 200) {
                        console.error(200);
                        console.log("La cuenta se ha cerrado exitosamente.");
                        setIsLoggedIn(false);
                        <Navigate to={"/"} />;
                    }
                } catch (err) {
                    console.error(err);
                    setIsLoggedIn(false);
                }
            } else {
                console.error(response.status);
                setIsLoggedIn(false);
            }
        } catch (err) {
            console.error(err);
            setIsLoggedIn(false);
        }
    };

    const deleteUser = async (e) => {
        e.preventDefault();
        const contraUser = prompt("Confirme su contraseña");

        if (contraUser) {
            const confirmacion = window.confirm(
                "¿Estas seguro de borrar tu cuenta?"
            );
            if (confirmacion) {
                try {
                    const deleteResponse = await axios.post(
                        `/api/verifpassword`,
                        {
                            contraUser,
                        }
                    );
                    if (deleteResponse.status === 200) {
                        setIsLoggedIn(false);
                        location.reload();
                    }
                } catch (err) {
                    console.error(
                        err.response
                            ? err.response.data.message
                            : "Error desconocido al eliminar el usuario."
                    );
                    setMessage(
                        err.response
                            ? err.response.data.message
                            : "Error desconocido al eliminar el usuario."
                    );
                }
            } else {
                location.reload();
            }
        }
    };
    const determinarTipoDispositivo = (ancho) => {
        if (ancho < 720) {
            return 1;
        } else {
            return 2;
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

        window.addEventListener("resize", verificarAncho);

        return () => {
            window.removeEventListener("resize", verificarAncho);
        };
    }, []);
    const showForm = (tipo) => {
        setForm(tipo);
        const formulario = document.getElementById("form_login");
        if (formulario.className === "displayNone") {
            formulario.className = "backgroundForm";
        } else {
            formulario.className = "displayNone";
        }
    };
    useEffect(() => {
        const llamadoInfoUsuario = async () => {
            try {
                const llamado = await axios.get(`/api/info-usuario`);
                if (llamado.status === 200) {
                    // console.log(llamado.data.username)
                    setLocalUsername(llamado.data.username);
                }
                if (llamado.status === 401) {
                    console.log(`${llamado.status}, No estas logueado.`);
                }
            } catch (err) {
                console.log("Error en la solicitud.", err.message); // Muestra el mensaje de error
            }
        };
        llamadoInfoUsuario();
    }, []);

    return (
        <Router>
            <>
                {/* >-------------------- Login-Register --------------------< */}
                <LoginRegister
                  form={form}
                  setForm={setForm}
                  setIsLoggedIn={setIsLoggedIn}
                />
                {/* >-------------------- HEADER --------------------< */}
                {movil ? (
                    <>
                        <header>
                            <div className="nav-user">
                                <div className="seccion">
                                    {isLoggedIn ? (
                                        <>
                                            <UserMenu
                                                username={localUsername}
                                                logout={(e) => logout(e)}
                                                del_profile={(e) =>
                                                    deleteUser(e)
                                                }
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn_user"
                                                onClick={() =>
                                                    showForm("login")
                                                }
                                            >
                                                INGRESO / REGISTRO
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="header_content">
                                <div className="header-l">
                                    <div>
                                        <p className="eslogan">
                                            <b>
                                                Tus <br></br> Recetas <br></br>{" "}
                                                Simplificadas
                                            </b>
                                        </p>
                                    </div>
                                    <a href="/">
                                        <img
                                            className="logo_img"
                                            src={logoimg}
                                            alt="LOGO"
                                        />
                                    </a>
                                    <div
                                        id="menu"
                                        className={`hamburger-menu ${
                                            visible ? "" : "rotate"
                                        }`}
                                        onClick={showMenu}
                                    >
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                    </div>
                                </div>
                                <nav
                                    className={`links ${
                                        visible ? "" : "menuClose"
                                    } `}
                                >
                                    {links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="link"
                                        >
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
                                        <img
                                            className="logo_img"
                                            src={logoimg}
                                            alt="LOGO"
                                        />
                                    </a>
                                    <div className="containerEslogan">
                                        <p className="eslogan">
                                            Tus recetas simplificadas
                                        </p>
                                    </div>
                                    {isLoggedIn ? (
                                        <>
                                            <UserMenu
                                                username={localUsername}
                                                logout={(e) => logout(e)}
                                                del_profile={deleteUser}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="btn_user-move">
                                                <button
                                                    className="btn_user"
                                                    onClick={() =>
                                                        showForm("login")
                                                    }
                                                >
                                                    INGRESO
                                                </button>
                                                <button
                                                    className="btn_user"
                                                    onClick={() =>
                                                        showForm("registro")
                                                    }
                                                >
                                                    REGISTRO
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <nav
                                    className={`links ${
                                        visible ? "" : "menuClose"
                                    } `}
                                >
                                    {links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="link"
                                        >
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
                    <Route path="/" element={<Home/>} />
                    <Route path="/receta/:id" element={<Receta />} />
                    <Route path="/Buscar" element={<Buscar />} />
                    <Route path="/perfil/:username" element={<Perfil />} />
                    <Route
                        path="/Panel de Recetas/:localUsername"
                        element={<GestioRecetas />}
                    />
                    <Route
                        path="/mis-recetas/:localUsername"
                        element={<Perfil />}
                    />
                    <Route path="/tienda" element={<Tienda />} />

                    {/* NO ESTA AUN */}
                    <Route path="/modificar-receta/:id" element={<Perfil />} />
                    <Route path="/eliminar-receta/:id:" element={<Perfil />} />
                    {/* Pagina 404 */}
                    <Route path="*" element={<Page404 />} />
                </Routes>
                {/* >-------------------- FOOTER --------------------< */}
                <Footer />
            </>
        </Router>
    );
}

export default App;

const UserMenu = ({ logout, del_profile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [movil, setMovil] = useState(false);
    const [localUsername, setLocalUsername] = useState("");
    useEffect(() => {
        const llamadoInfoUsuario = async () => {
            try {
                const llamado = await axios.get(`/api/info-usuario`);
                if (llamado.status === 200) {
                    // console.log(llamado.data.username)
                    setLocalUsername(llamado.data.username);
                }
            } catch (err) {
                console.error(err);
            }
        };
        llamadoInfoUsuario();
    }, []);

    const determinarTipoDispositivo = (ancho) => {
        if (ancho < 720) {
            return 1;
        } else {
            return 2;
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

        window.addEventListener("resize", verificarAncho);

        return () => {
            window.removeEventListener("resize", verificarAncho);
        };
    }, []);

    // Función para alternar la visibilidad del menú
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Cerrar el menú si se hace clic fuera de él
    const closeMenu = (e) => {
        if (!e.target.closest(".menu")) {
            setIsOpen(false);
        }
    };

    const userPerfil = () => {};

    return (
        <div>
            {movil ? (
                <>
                    <div className="menu-container" onClick={closeMenu}>
                        <div className="menu">
                            <button
                                className="menu-button"
                                onClick={toggleMenu}
                            >
                                <img
                                    className="btn_user-avatar"
                                    src={logoPerfilM}
                                    alt="avatar"
                                />
                            </button>
                            {isOpen && (
                                <div className="menu-content">
                                    <span className="menu-span">
                                        Hola {localUsername}
                                    </span>
                                    <a
                                        href={`/Panel de Recetas/${localUsername}`}
                                    >
                                        Gestionar recetas
                                    </a>
                                    <button
                                        className="btn_del btn_menu"
                                        onClick={del_profile}
                                    >
                                        Borrar cuenta
                                    </button>
                                    <button
                                        className="btn_close btn_menu"
                                        onClick={logout}
                                    >
                                        Cerrar sesión
                                    </button>
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
                                <button
                                    className="menu-button"
                                    onClick={toggleMenu}
                                >
                                    <img
                                        className="btn_user-avatar"
                                        src={logoPerfilP}
                                        alt="avatar"
                                    />
                                </button>
                                {isOpen && (
                                    <div className="menu-content">
                                        <span className="menu-span">
                                            Hola {localUsername}
                                        </span>
                                        <a
                                            href={`/Panel de Recetas/${localUsername}`}
                                        >
                                            Gestionar recetas
                                        </a>
                                        {/* <a href={`/mis-recetas/${localUsername}`}>Mis recetas</a> en gestionar recetas ya se muestra tambien las recetas del usuario*/}
                                        {/* <a href={`/mis-favoritos/${localUsername}`}>Favoritos</a>  aun no tiene uso alguno*/}
                                        <button
                                            className="btn_del btn_menu"
                                            onClick={del_profile}
                                        >
                                            Borrar cuenta
                                        </button>
                                        <button
                                            className="btn_close btn_menu"
                                            onClick={logout}
                                        >
                                            Cerrar sesión
                                        </button>
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
