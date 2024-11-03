import React, { useEffect, useState } from "react";
import "./message.css";
// ICONS
import imgOK from "../../assets/ok.svg";
import imgWarning from "../../assets/warning.svg";
import imgDanger from "../../assets/danger.svg";

const Message = ({ message, type }) => {
    // Variables

    // console.log(contenedorAlerta.className)
    // if(type === 'successful'){
    //   // contenedorAlerta.className += ' green';
    //   // setIcoSeleccionado(imgOK);
    // }else if(type === 'warning'){
    //   contenedorAlerta.className += ' yellow';
    //   setIcoSeleccionado(imgWarning);
    // }else{
    //   contenedorAlerta.className += ' red';
    //   setIcoSeleccionado(imgDanger);
    // }

    return (
        <>
            {type === 'successful' ?(
              <div id="alertContainer" className="cont-alert green">
              <img src={imgOK} alt={message} />
              <p>{message}</p>
          </div>
            ):type === 'warning' ? (
              <div id="alertContainer" className="cont-alert yellow">
                <img src={imgWarning} alt={message} />
                <p>{message}</p>
            </div>
            )
            : type === 'danger'?(
              <div id="alertContainer" className="cont-alert red">
                <img src={imgDanger} alt={message} />
                <p>{message}</p>
              </div>
            ):(
              'HOLA'
            )}
        </>
    );
};

export default Message;
