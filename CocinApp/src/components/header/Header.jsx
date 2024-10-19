import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./header.css";
import logoPerfil from "../../assets/LogoPerfil.png";
// REGISTRO
import LoginRegister from '../LoginRegister/LoginRegister'

const Header = ({ links, logo, estado, setEstado }) => {
    //LOGICA DE COMPONENTE
    const [visible, setMenuVisible] = useState(false);
    // const [estado, setEstado] = useState(null);

    const showMenu = () => {
        setMenuVisible(!visible);
    };
    useEffect(()=>{
        const handleResize = ()=>{
            setMenuVisible(false);
        };
        //Listen para verificar cambio de pantalla (Resize)
        window.addEventListener('resize', handleResize); 
        return ()=>{
            window.removeEventListener('resize', handleResize); //Quitar el evento
        };

    },[]);

    // Login / Register
        useEffect(() => {
            const form = document.getElementById('form_login'); // Usa el ID correcto
            if (estado) {
              form.style.display = 'block';
            } else {
              form.style.display = 'none';
            }
          }, [estado]);

    const showPerfil = (username)=>{
        alert("[TU PERFIL]");
    }
// ---------------------------------
    return (
        <>  
            <header>
            <div className="nav-user">
                <div className="seccion">
                <button  className="btn_user" onClick={() => setEstado(true)}>Ingreso / Registro</button>
                <button 
                onClick={showPerfil} 
                className="btn_user">
                    <img  className='btn_user-avatar'
                    src="./src/assets/LogoPerfil.png" 
                    alt="avatar"
                    />
                </button>
                </div>
            </div>
            <div className="header_content">
                <div className="header-l">
                    <a href="/">
                        <img className="logo_img" src="./src/assets/LogoPerfil.png" alt="LOGO" />
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
                <nav className={`links ${visible ? '' : 'menuClose'} `}>
                    {links.map((link, index) => (
                        <a key={index} href={link.href} className="link">
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
        
        </>
    );
};
export default Header;
