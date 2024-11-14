import React, {useState } from "react";
import { useAlert } from "../../context/messageContext";
import "./message.css";
// ICONS
import imgOK from "../../assets/ok.svg";
import imgWarning from "../../assets/warning.svg";
import imgDanger from "../../assets/danger.svg";

export const Message = ({ message, type}) => {
  // Mapeo para las clases y las imágenes basadas en el tipo de alerta
  const alertConfig = {
      successful: { className: 'green', imgSrc: imgOK },
      warning: { className: 'yellow', imgSrc: imgWarning },
      danger: { className: 'red', imgSrc: imgDanger },
  };

  // Definimos las configuraciones actuales en función del tipo
  const { className, imgSrc } = alertConfig[type] || alertConfig['danger'];

  return (
      <div id="alertContainer" className={`cont-alert ${className}`}>
          <img id="icon" src={imgSrc} alt={message} />
          <p className="parrafoMensaje">{message}</p>

      </div>
  );
};


export const ConfirmPromp = () => {
    const [input,setInput] =useState();
    const { setPassword,closeConfirm, handleConfirm } = useAlert();


    const handlePasswordChange = (e) => {
        setInput(e.target.value); // Actualiza directamente el contexto con el valor del input
    };
    
    const handleClick = ()=>{
        setPassword(input);
        handleConfirm();
    }


    return (
        <div className='promp-alert'>
            <div className="promp-alert-header">
                <button className='header-close' onClick={closeConfirm}>X</button>
            </div>
            <h3>Confirme contraseña para borrar.</h3>
            <div className='promp-alert-inputCont'>
                <input
                    type="password"
                    className='promp-alert-input'
                    onChange={handlePasswordChange}
                    placeholder="Ingrese su contraseña"
                />
            </div>
            <div className="promp-alert-confirm">
                <button
                    className='promp-alert-confirm'
                    onClick={handleClick}
                >
                    Borrar
                </button>
            </div>
        </div>
    );
};





