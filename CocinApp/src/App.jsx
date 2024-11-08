// Importaciones de Librerias
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAlert } from './context/messageContext';

// Componentes
import Header from "./components/header/Header";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import Message from "./components/Message/Message";
import Footer from "./components/footer/Footer";
// Pages
import Home from "./pages/Home";
import Buscar from "./pages/Buscar";
import Receta from "./pages/Receta";
import Tienda from "./pages/Tienda";
import Page404 from "./pages/404";
import GestioRecetas from "./pages/GestionarRecetas";
// Otros
import "./css/app.css";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    // Variables "Globales"
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [movil, setMovil] = useState(false);
    const [tabletOrdenador, setTabletOrdenador] = useState(false); 
    const [form, setForm] = useState("login");
    const [localUsername, setLocalUsername] = useState("");
    const { alert } = useAlert();


    // Funciones para uso en componentes.
    const showForm = (tipo) => {
        setForm(tipo);
        const formulario = document.getElementById("form_login");
        formulario.className = formulario.className === "displayNone" ? "backgroundForm" : "displayNone";

    };


    return (
        <Router>
            {/* >-------------------- ALERTAS CUSTOM--------------------< */}
            <div className="cont-notificaciones">
                <div className="noficaciones">
                    {alert && <Message message={alert.message} type={alert.type} />}
                </div>
            </div>
            <>
                {/* >-------------------- Login-Register --------------------< */}
                <LoginRegister
                    form={form}
                    setForm={setForm}
                    setIsLoggedIn={setIsLoggedIn}
                    setLocalUsername={setLocalUsername}
                />
                {/* >-------------------- HEADER --------------------< */}
                <Header
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                    showForm={showForm}
                    localUsername={localUsername}
                />
                {/* >-------------------- MAIN PAGE --------------------< */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/receta/:id" element={<Receta />} />
                    <Route path="/Buscar" element={<Buscar />}
                    />
                    <Route
                        path="/Panel-de-Recetas/:LocalUsername"
                        element={
                            <ProtectedRoute>
                                <GestioRecetas nombreUsuario={localUsername} />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/tienda" element={<Tienda />} />
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