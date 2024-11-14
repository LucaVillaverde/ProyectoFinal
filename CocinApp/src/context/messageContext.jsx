import { createContext, useState, useContext } from 'react';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null); 
    const [confirm, setConfirm] = useState(null); 
    const [password, setPassword] = useState(''); 

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

    const handleConfirm = () => {
        if (confirm) {
            if (password) {
                confirm(password); 
                closeConfirm(); 
                console.log("Llego passwd");
            } else {
                console.log(password)
                console.log("no llego passwd");
            }
        }
    };
 
    const closeConfirm = () => {
        setConfirm(null);
        
    };

    return (
        <AlertContext.Provider value={{ alert, showAlert, confirm, showConfirm, handleConfirm, closeConfirm, password, setPassword }}>
            {children}
        </AlertContext.Provider>
    );
};
