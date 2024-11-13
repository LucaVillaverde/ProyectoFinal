import { React, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./header.css";
import logoimg from "../../assets/logo1.png";
import logoPerfilM from "../../assets/LogoPerfilMovil.jpg";
import logoPerfilP from "../../assets/LogoPerfilPC.jpg";
import menuHamburguesa from "../../assets/btn_burgerIcon.png";

const Header = ({ isLoggedIn, setIsLoggedIn, showForm, localUsername }) => {
    const [visible, setMenuVisible] = useState(false);
    const [movil, setMovil] = useState(null);

    const links = [
        { href: "/", label: "INICIO" },
        { href: "/Buscar", label: "BUSCAR" },
        { href: "/tienda", label: "TIENDA" },
    ];

    useEffect(() => {
        const determinarAncho = (ancho) => (ancho > 720 ? 1 : 0);

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
    }, []); // Evitar agregar `movil` aquí

    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/logout`);
            if (response.status === 200) {
                const cookieDelete = await axios.post(`/api/cookie/delete`, 
                    {}
                );
                if (cookieDelete.status === 200){
                    location.reload();
                }
            }
        } catch (err){
            console.error(err);
            location.reload();
        }
    };

    const deleteUser = async (e) => {
        e.preventDefault();
        const contraUser = prompt("Confirme su contraseña");

        if (contraUser) {
            const confirmacion = window.confirm("¿Estás seguro de borrar tu cuenta?");
            const borrarRecetas = window.confirm(
                "Aceptar para borrar tus recetas del sistema o Cancelar para que se pongan a nombre de CocinApp."
            );

            if (confirmacion) {
                try {
                    const deleteResponse = await axios.post(`/api/verifpassword`, {
                        contraUser,
                        borrarRecetas,
                    });
                    if (deleteResponse.status === 200) {
                        setIsLoggedIn(false);
                    }
                } catch (err) {
                    console.error(err.response ? err.response.data.message : "Error al eliminar el usuario.");
                }
            }
        }
    };

    const showMenu = () => {
        setMenuVisible(!visible);
    };

    return movil ? (
        <header>
            <div className="nav-user">
                <div className="seccion">
                    {isLoggedIn ? (
                        <UserMenu
                            username={localUsername}
                            logout={logout}
                            del_profile={deleteUser}
                            movil={movil}
                        />
                    ) : (
                        <button className="btn_user" onClick={() => showForm("login")}>
                            INGRESO / REGISTRO
                        </button>
                    )}
                </div>
            </div>
            <div className="header_content">
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
                        <a key={index} href={link.href} className="link">
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
                        <img className="logo_img" src={logoimg} alt="LOGO" />
                    </a>
                    <div className="containerEslogan">
                        <p className="eslogan">Tus recetas simplificadas</p>
                    </div>
                    {isLoggedIn ? (
                        <UserMenu
                            username={localUsername}
                            logout={logout}
                            del_profile={deleteUser}
                        />
                    ) : (
                        <div className="btn_user-move">
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


const UserMenu = ({ logout, del_profile, username,movil }) => {
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
                </>
            ) : (
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
