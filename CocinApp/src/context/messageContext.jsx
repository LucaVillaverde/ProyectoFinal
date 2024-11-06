import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = 'danger') => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000); // Oculta la alerta después de 3 segundos
    };

    return (
        <AlertContext.Provider value={{alert,showAlert}}>
            {children}
        </AlertContext.Provider>
    );
};
