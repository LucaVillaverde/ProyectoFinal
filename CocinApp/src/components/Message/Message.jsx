import React, { useEffect, useState } from "react";
import { useAlert } from "../../context/messageContext";
import "./message.css";
// ICONS
import imgOK from "../../assets/ok.svg";
import imgWarning from "../../assets/warning.svg";
import imgDanger from "../../assets/danger.svg";

export const Message = ({ message, type, onClose }) => {
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


export const ConfirmPromp = ({ close}) => {
    const [password, setPassword] = useState('');
    const { confirm } = useAlert(); // confirm ejecutará deleteUser()

    const handleConfirm = () => {
        if (password === 'laContraseñaCorrecta') { // Reemplaza con la lógica de verificación real
            if (confirm) confirm(); // Llama a deleteUser si la contraseña es correcta
            close(); // Cierra el prompt
        } else {
            alert("Contraseña incorrecta");
        }
    };

    return (
        <div className='promp-alert'>
            <div className="promp-alert-header">
                <button className='promp-alert-header-close' onClick={close}>X</button>
            </div>
            <h3 className="promp-alert-title">Confirme contraseña para borrar</h3>
            <div className='promp-alert-inputCont'>
                <input
                    type="password"
                    className='promp-alert-input'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="promp-alert-confirmCont">
                <button className='promp-alert-confirm' onClick={handleConfirm}>
                    Borrar
                </button>
            </div>
        </div>
    );
};




 