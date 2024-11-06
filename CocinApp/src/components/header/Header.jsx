import { React, useState} from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import "./header.css";
import logoimg from "../../assets/logo1.png";
import "../../assets/btn_burgerIcon.png"
import logoPerfilM from "../../assets/LogoPerfilMovil.jpg";
import logoPerfilP from "../../assets/LogoPerfilPC.jpg";

const Header = ({movil,isLoggedIn,setIsLoggedIn,showForm, localUsername}) => {
    const [visible, setMenuVisible] = useState(false);
    // PATH
    const links = [
        { href: "/", label: "INICIO" },
        { href: "/Buscar", label: "BUSCAR" },
        { href: "/tienda", label: "TIENDA" },
    ];
    // Funciones
    const logout = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/api/logout`, {});
            if (response.status === 200) {
                try {
                    const cookieTokenDelete = await axios.post(
                        `/api/cookie/delete`,
                        {},
                    );

                    if (cookieTokenDelete.status === 200) {
                        console.log("La cuenta se ha cerrado exitosamente.");
                        setIsLoggedIn(false);
                        location.reload();
                    } else if (cookieTokenDelete.status === 400){
                        location.reload();
                    }
                } catch {
                    setIsLoggedIn(false);   
                    location.reload();                 
                }
            } else {
                setIsLoggedIn(false);
                location.reload();
            }
        } catch {
            setIsLoggedIn(false);
            location.reload();
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
    const showMenu= ()=>{
        setMenuVisible(!visible);
    }


    return (
            movil ? (
                <>
                    <header>
                        <div className="nav-user">
                            <div className="seccion">
                                {isLoggedIn ? (
                                    <UserMenu
                                        username={localUsername}
                                        logout={(e) => logout(e)}
                                        del_profile={(e) => deleteUser(e)}
                                        movil={movil}
                                    />
                                ) : (
                                    <button className="btn_user" onClick={()=>showForm("login")}>
                                        INGRESO / REGISTRO
                                    </button>
                                )}
                            </div>
                        </div>
        
                        <div className="header_content">
                            <div className="header-l">
                                <div>
                                    <p className="eslogan">
                                        <b>
                                            Tus <br /> Recetas <br /> Simplificadas
                                        </b>
                                    </p>
                                </div>
                                <a href="/">
                                    <img className="logo_img" src={logoimg} alt="LOGO" />
                                </a>
                                <div id="menu" className={`hamburger-menu ${visible ? "" : "rotate"}`} onClick={showMenu}>
                                    <div className="line"></div>
                                    <div className="line"></div>
                                    <div className="line"></div>
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
                                    <UserMenu
                                        username={localUsername}
                                        logout={(e) => logout(e)}
                                        del_profile={deleteUser}
                                    />
                                ) : (
                                    <div className="btn_user-move">
                                        <button className="btn_user" onClick={()=>showForm("login")}>
                                            INGRESO
                                        </button>
                                        <button className="btn_user" onClick={()=>showForm("registro")}>
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
                </>
            )
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
                </>
            )}
        </div>
    );
};
