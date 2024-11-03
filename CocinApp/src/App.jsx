// Importaciones de Librerias
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
// LOGO
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
import Header from "./components/header/Header";
// import "./components/LoginRegister/style.css";

function App() {
    // OTROS
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [movil, setMovil] = useState(false);
    const [tabletOrdenador, setTabletOrdenador] = useState(false);
    //LOGICA DE COMPONENTE
    const [visible, setMenuVisible] = useState(false);
    const [form, setForm] = useState("login");
    const [localUsername, setLocalUsername] = useState("");

    const showForm = (tipo) => {
        setForm(tipo);
        const formulario = document.getElementById("form_login");
        if (formulario.className === "displayNone") {
            formulario.className = "backgroundForm";
        } else {
            formulario.className = "displayNone";
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
    localUsername;

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
    useEffect(() => {
        const llamadoInfoUsuario = async () => {
            try {
                const llamado = await axios.get(`/api/info-usuario`);
                if (llamado.status === 200) {
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
                    visible={visible}
                />
                {/* >-------------------- HEADER --------------------< */}
                <Header
                    movil={movil}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    showForm={showForm}
                    localUsername={localUsername}
                />
                {/* >-------------------- MAIN PAGE --------------------< */}
                <Routes>
                    <Route
                      path="/" 
                      element={<Home />} />
                    <Route 
                      path="/receta/:id" 
                      element={<Receta />} />
                    <Route 
                      path="/Buscar" 
                      element={<Buscar />} />
                    <Route 
                      path="/perfil/:username" 
                      element={<Perfil />} />
                    <Route
                        path="/Panel de Recetas/:localUsername"
                        element={<GestioRecetas />}
                    />
                    <Route
                        path="/mis-recetas/:localUsername"
                        element={<Perfil />}
                    />
                    <Route path="/tienda" element={<Tienda />} />

                    {/* Pagina 404 */}
                    <Route path="*" element={<Page404 />}/>
                </Routes>
                {/* >-------------------- FOOTER --------------------< */}
                <Footer />
            </>
        </Router>
    );
}
export default App;
