import React, { useEffect, useState } from "react";
import "./message.css";
// ICONS
import imgOK from "../../assets/ok.svg";
import imgWarning from "../../assets/warning.svg";
import imgDanger from "../../assets/danger.svg";

const Message = ({ message, type, onClose }) => {
    // Control de visualizacion de notificación
    useEffect(()=>{
      const timer = setTimeout(() => {
        onClose;
      }, 3000);

      return ()=> clearTimeout(timer)

    }, [onClose])

    return (
        <>
            {type === 'successful' ?(
              <div id="alertContainer" className="cont-alert green">
                <img id="alertOk" src={imgOK} alt={message} />
                <p className="parrafoMensaje">{message}</p>
              </div>
            ):type === 'warning' ? (
              <div id="alertContainer" className="cont-alert yellow">
                <img id="alertWarning" src={imgWarning} alt={message} />
                <p className="parrafoMensaje">{message}</p>
              </div>
            )
            : (
              <div id="alertContainer" className="cont-alert red">
                <img id="alertDanger" src={imgDanger} alt={message} />
                <p className="parrafoMensaje">{message}</p>
              </div>
            )}
        </>
    );
};

export default Message;
