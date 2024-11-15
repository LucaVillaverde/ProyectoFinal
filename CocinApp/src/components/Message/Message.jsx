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
      <div id="alertContainer" className={`cont-alert animate__slideInDown animate__animated ${className}`}>
          <img id="icon" src={imgSrc} alt={message} />
          <p className="parrafoMensaje">{message}</p>

      </div>
  );
};


export const ConfirmPromp = () => {
    const [input,setInput] =useState();
    const {closeConfirm, handleConfirm } = useAlert();


    const handlePasswordChange = (e) => {
        setInput(e.target.value); 
    };
    
    const handleClick = ()=>{
        handleConfirm(input);
    }


    return (
        <div className='promp-alert '>
            <div className="promp-alert-header">
                <button className='promp-alert-header-close' onClick={closeConfirm}>X</button>
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
            <div className="promp-alert-confirmCont">
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

export const Confirm = ({ message, onConfirm, onCancel }) => {

    return (
        <div className='promp-alert'>
            {/* <div className="promp-alert-header">
                <button className='promp-alert-header-close' onClick={() => handleClick(false)}>X</button>
            </div> */}
            <h2 className="promp-alert-confirm-msg  animate__animated">{message}</h2>
            <div className="promp-alert-confirmBTN">
                <button 
                className='promp-alert-confirmBTN-confirm animate__animated animate__bounceIn' 
                onClick={() => onConfirm(true)}
                >Aceptar
                </button>
                <button 
                className='promp-alert-confirmBTN-cancel animate__animated animate__bounceIn' 
                onClick={() => onCancel(false)}
                >Cancelar
                </button>
            </div>
        </div>
    );
};





