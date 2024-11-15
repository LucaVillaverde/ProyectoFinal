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
    
    // ------------------------------------- Confirmacion simple Si / No -----------------------------------
    const showConfirm2 = (mensaje) => {
        return new Promise((resolve) => {
            setCheck({
                mensaje,
                onConfirm: () => resolve(true),    
                onCancel: () => resolve(false),    
            });
        });
    };
 
    const closeConfirm = () => {
        setConfirm(null);        
    };
    const closeCheck = ()=>{
        setCheck(null);
    }

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm,showConfirm2, handleConfirm, closeConfirm,closeCheck,check,confirm,mensaje}}>
            {children}
        </AlertContext.Provider>
    );
};
