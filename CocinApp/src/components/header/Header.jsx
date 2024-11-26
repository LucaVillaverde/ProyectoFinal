import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./header.css";
import logoimg from "../../assets/logo1.png";
import logoPerfilM from "../../assets/LogoPerfilMovil.jpg";
import logoPerfilP from "../../assets/LogoPerfilPC.jpg";
import menuIcon from "../../assets/menuUser.svg";
import menuHamburguesa from "../../assets/btn_burgerIcon.png";
import { useAlert } from "../../context/messageContext";
import {useConfirm} from "../../context/confirmContext";

import audioSuccess from "/src/assets/SuccessSound.mp3";
import audioError from "/src/assets/DangerSound.mp3";
import audioWarning from '/src/assets/WarningSound.mp3';

const Header = ({ isLoggedIn, setIsLoggedIn, showForm, localUsername, dineroUser }) => {
    const [visible, setMenuVisible] = useState(false);
    const [movil, setMovil] = useState(true);
    const {showConfirm, showAlert} = useAlert();
    const {openConfirm} = useConfirm();
    

    const links = [
        { href: "/", label: "INICIO" },
        { href: "/Buscar", label: "BUSCAR" },
        { href: "/tienda", label: "TIENDA" },
    ];


    useEffect(() => {
        const determinarAncho = (ancho) => (ancho > 700 ? 1 : 0);

        const verificarAncho = () => {
            const anchoBoolean = determinarAncho(window.innerWidth);
            if (anchoBoolean === 1) {
                setMovil(false);
            } else {
                setMovil(true);
            }
        };
        verificarAncho();
        window.addEventListener("resize", verificarAncho);

        return () => {
            window.removeEventListener("resize", verificarAncho);
        };
    }, [movil]); 

    const logout = async (e) => {
        e.preventDefault();
        const referrer = document.referrer; //la url previa a la que estoy actualmente
        const miDominio = window.location.origin; //la parte "http://pruebita.webhop.me:5173" de la url.

        try {
            const response = await axios.post(`/api/logout`);
            if (response.status === 200) {
                const cookieDelete = await axios.post(`/api/cookie/delete`, 
                    {}
                );
                if (cookieDelete.status === 200){
                    if (referrer.startsWith(miDominio)){
                        if(referrer.includes("/Panel-de-Recetas/")){
                            window.location.replace(`/`);
                        } else {
                            window.location.replace(referrer);
                        }
                    }else{
                        window.location.replace(`/`);
                    }
                }
            }
        } catch (err){
            console.error(err);
            if (referrer.startsWith(miDominio)){
                window.location.replace(referrer);
            }else{
                window.location.replace(`/`);
            }
        }
    };

    const deleteUser = async (contraUser) => {
        // const contraUser = prompt("Confirme su contraseña");

        if (contraUser) {
            const confirmacion = await openConfirm('¿Estás seguro de borrar tu cuenta?');
            if (confirmacion) {
                const borrarRecetas = await openConfirm("Aceptar para borrar tus recetas del sistema o Cancelar para que se pongan a nombre de CocinApp.");
                try {
                    const deleteResponse = await axios.post(`/api/verifpassword`, {
                        contraUser,
                        borrarRecetas,
                    });
                    if (deleteResponse.status === 200) {
                        const audioOK = new Audio(audioSuccess);
                        audioOK.play();
                        showAlert("Cuenta eliminada", "successful")
                        setIsLoggedIn(false);
                    }
                } catch (err) {
                    const audioWar = new Audio(audioWarning);
                    audioWar.play();
                    const errorMessage = err.response?.data?.message || 'Error de conexión';
                    showAlert(errorMessage, 'warning');
                    console.error(err.response ? err.response.data.message : "Error al eliminar el usuario.");
                }
            }
        }
    };

    const showMenu = () => {
        if (navigator.vibrate) navigator.vibrate(100);
        setMenuVisible(!visible);
    };

    return movil ? (
        <header>
            <div className="nav-user">
                {dineroUser ? (
                    <div className="animate__animated animate__backInDown dineroUsuario">
                        <span>US${dineroUser}</span>
                    </div>
                ) : (
                    <div>
                    </div>
                )}
                <div className="seccion">
                    {isLoggedIn ? (
                            <UserMenu
                                username={localUsername}
                                logout={logout}
                                del_profile={deleteUser}
                                movil={movil}
                            />
                    ) : (
                        <button className="animate__animated animate__backInDown btn_user" onClick={() => showForm("login")}>
                            INGRESO / REGISTRO
                        </button>
                    )}
                </div>
            </div>
            <div className="header_content animate__animated animate__rubberBand">
                <div className="header-l">
                    <div className="eslogan">
                        <p>
                            <b>
                                Tus <br /> Recetas <br /> Simplificadas
                            </b>
                        </p>
                    </div>
                    <a href="/">
                        <img className="logo_img" src={logoimg} alt="LOGO" />
                    </a>
                    <div id="menu" className={`hamburger-menu ${visible ? "" : "rotate"}`} onClick={showMenu}>
                        <img src={menuHamburguesa} alt="Menu hamburguesa" />
                    </div>
                </div>
                <nav className={`links ${visible ? "" : "menuClose"}`}>
                    {links.map((link, index) => (
                        <a key={index} href={link.href} className="link ">
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    ) : (
        <header>
            <div className="header_content">
                <div className="header-l">
                    <a href="/" id="logoContainer">
                        <img className="logo_img animate__animated animate__backInLeft" src={logoimg} alt="LOGO" />
                    </a>
                    <div className="containerEslogan">
                        <p className="eslogan animate__animated animate__backInDown">Tus recetas simplificadas</p>
                    </div>
                    {isLoggedIn ? (
                        <UserMenu
                            username={localUsername}
                            logout={logout}
                            del_profile={()=>showConfirm(deleteUser)}
                            dineroUser={dineroUser}
                        />
                    ) : (
                        <div className="animate__animated animate__backInRight btn_user-move">
                            <button className="btn_user" onClick={() => showForm("login")}>
                                INGRESO
                            </button>
                            <button className="btn_user" onClick={() => showForm("registro")}>
                                REGISTRO
                            </button>
                        </div>
                    )}
                </div>
                <nav className={`links ${visible ? "" : "menuClose"}`}>
                    {links.map((link, index) => (
                        <a key={index} href={link.href} className="link">
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    );
};

export default Header;


const UserMenu = ({ logout, del_profile, username, movil, dineroUser }) => {
    const [isOpen, setIsOpen] = useState(false);
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

 
    return (
        <div id="contenedorUserMenu">
            {movil ? (
                <div className="menu-container-move">
                    <div className="menu-container" onClick={closeMenu}>
                        <div className="menu animate__animated animate__backInDown">
                            <button
                                className="menu-button"
                                onClick={toggleMenu}
                                id="menuButtonM"
                            >
                                <img
                                    className="btn_user-avatar"
                                    src={logoPerfilM}
                                    alt="avatar"
                                />
                                <img
                                    src={menuIcon}
                                    className={`menuIcon ${isOpen ? "menuIconRotate" : ""}`}
                                    alt="Desplegar menu usuario."
                                />
                            </button>
                        </div>
                            {isOpen && (
                                <div className="menu-content">
                                    <span className="menu-span">
                                        Hola {username}
                                    </span>
                                    <a
                                        href={`/Panel-de-Recetas/${username}`}
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
            ) : (
                <div className="animate__animated animate__backInRight menu-container-move">
                        <div className="animate__animated animate__backInDown dineroUsuario">
                            <span>US${dineroUser}</span>
                        </div>
                        <div className="menu-container" onClick={closeMenu}>
                            <div className="menu ">
                                <button
                                    className="menu-button"
                                    onClick={toggleMenu}
                                    id="menuButtonPC"
                                >
                                    <img
                                        className="btn_user-avatar"
                                        src={logoPerfilP}
                                        alt="avatar"
                                    />
                                    <img
                                        src={menuIcon}
                                        className={`menuIcon ${isOpen ? "menuIconRotate" : ""}`}
                                        alt="Desplegar menu usuario."
                                    />
                                </button>
                                {isOpen && (
                                    <div className="menu-content">
                                        <span className="menu-span">
                                            Hola {username}
                                        </span>
                                        <a
                                            href={`/Panel-de-Recetas/${username}`}
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
                </div>
            )}
        </div>
    );
};
