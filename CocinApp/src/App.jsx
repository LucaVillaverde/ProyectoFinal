// Importaciones de Librerias
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
// Contexto
import { useAlert } from './context/messageContext';

// Componentes
import Header from "./components/header/Header";
import LoginRegister from "./components/LoginRegister/LoginRegister";
import {Message, ConfirmPromp,Confirm} from "./components/Message/Message";
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
import 'animate.css/animate.min.css';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    // Variables "Globales"
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [form, setForm] = useState("login");
    const [localUsername, setLocalUsername] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const { confirm, alert} = useAlert();
    const [dineroUser, setDineroUser] = useState(0);
    import.meta.glob('../src/assets/**/*.*');
    


    useEffect(() => {
        const metaViewport = document.createElement('meta');
        metaViewport.name = "viewport";
        metaViewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
        document.getElementsByTagName('head')[0].appendChild(metaViewport);
        
        return () => {
            document.getElementsByTagName('head')[0].removeChild(metaViewport);
        };
    }, []);

    useEffect(() => {
        const fefoResponse = async () => {
            try{
                const response = await axios.post('/api/dinero-cantidad', {});
                if (response.status === 200){
                    setDineroUser(response.data.money);
                }
            }catch{
                console.log("Hola soy un error.");
            }
        }
        fefoResponse();
    },[])

    useEffect(() => {    
        const checkAuth = async () => {
          try {
            const response = await axios.get("/api/protection");
            if (response.status === 200) {
              setIsAuthenticated(true);
            }
          } catch {
            setIsAuthenticated(false);
          }
        };
    
        checkAuth();
      }, [isLoggedIn]);

    // Funciones para uso en componentes.
    const showForm = (tipo) => {
        if (navigator.vibrate) navigator.vibrate(100);
        setForm(tipo);
        const formulario = document.getElementById("form_login");
        formulario.className = formulario.className === "displayNone" ? "backgroundForm" : "displayNone";

    };
    return (
        <Router>
            {/* >-------------------- ALERTAS CUSTOM--------------------< */}
                <div className="cont-notificaciones">
                    <div className="notificaciones">
                        {alert && <Message message={alert.message} type={alert.type} />} 

                    </div>
                </div>
                {confirm &&<ConfirmPromp/>}
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
                    setDineroUser={setDineroUser}
                    dineroUser={dineroUser}
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
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <GestioRecetas nombreUsuario={localUsername} />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/tienda"
                        element={
                            <Tienda
                            dineroUser={dineroUser}
                            setDineroUser={setDineroUser}
                        />}
                    />
                    {/* Pagina 404 */}
                    <Route path="*" element={<Page404 />} />
                </Routes>                
                {/* >-------------------- FOOTER --------------------< */}
                <Footer />
            </>
        </Router>
)}

export default App;