import { createContext, useState, useContext } from 'react';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null); 
    const [confirm, setConfirm] = useState(null); 
    const [check, setCheck] = useState({ mensaje: "", onConfirm: null, onCancel: null });
    const mensaje = '';

    const showAlert = (message, type) => {
        setAlert({ message, type });
        setTimeout(() => {
            setAlert(null);
        }, 4000);
    };
    
    const showConfirm = (onConfirm) => {
        console.log('Se muestra form');
        setConfirm(() => onConfirm);
    };
    
    const handleConfirm = (passwd) => {
        if (passwd) {
            confirm(passwd); 
            closeConfirm(); 
        } else {
            console.log(passwd)
        }
    };

    const closeConfirm = () => {
        setConfirm(null);        
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm, handleConfirm, closeConfirm}}>
            {children}
        </AlertContext.Provider>
    );
};
