import React, { useEffect, useState } from "react";
import "./message.css";
// ICONS
import imgOK from "../../assets/ok.svg";
import imgWarning from "../../assets/warning.svg";
import imgDanger from "../../assets/danger.svg";

const Message = ({ message, type }) => {

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
            : (
              <div id="alertContainer" className="cont-alert red">
                <img src={imgDanger} alt={message} />
                <p>{message}</p>
              </div>
            )}
        </>
    );
};

export default Message;
