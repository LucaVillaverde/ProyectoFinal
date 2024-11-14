import { createContext, useState, useContext } from 'react';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null); 
    const [confirm, setConfirm] = useState(null); 
    const [check, setCheck] = useState(null);

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
    const showConfirm2= (mensaje) => {
        setConfirm({mensaje});
    };
    const Confirm = (check) => {
        if (check) {
            // confirm(check); 
            console.log("valor", check);
            closeConfirm(); 
        } else {
            console.log(passwd)
            console.log("valor", check);
        }
};
 
    const closeConfirm = () => {
        setConfirm(null);
        
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm,showConfirm2, handleConfirm, closeConfirm,Confirm}}>
            {children}
        </AlertContext.Provider>
    );
};
