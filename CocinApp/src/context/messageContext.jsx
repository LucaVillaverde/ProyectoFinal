import { createContext, useState, useContext } from 'react';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null); // Para mensajes de alerta
    const [confirm, setConfirm] = useState(null); // Para confirmaciones
    const [password, setPassword] = useState(''); // Para manejar la contraseña

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert(null);
        }, 4000);
    };

    const showConfirm = (onConfirm) => {
        setConfirm(() => onConfirm); // Guarda la función `onConfirm` en `confirm` sin ejecutarla aún
    };

    const handleConfirm = () => {
        if (confirm) {
            confirm(password); // Ejecuta la función `confirm` usando `password`
            console.log
            closeConfirm(); // Limpia el estado después de confirmar
        }
    };

    const closeConfirm = () => {
        setConfirm(null);
        setPassword('');
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm, handleConfirm, closeConfirm, password, setPassword }}>
            {children}
        </AlertContext.Provider>
    );
};
