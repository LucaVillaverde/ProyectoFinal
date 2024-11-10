import { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null); // Para mensajes de alerta
    const [confirm, setConfirm] = useState(); // Para confirmaciones

    const showAlert = (message, type) => {
        setTimeout(() => {
            setAlert({ message, type });
        }, 4000);
    };

    const showConfirm = (onConfirm) => {
        setConfirm(() => onConfirm);
    };

    const closeConfirm = () => {
        setConfirm(null);
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm, closeConfirm }}>
            {children}
        </AlertContext.Provider>
    );
};
