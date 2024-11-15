import React, { createContext, useState, useContext } from "react";
import { Confirm } from "../components/Message/Message";

// Crear el contexto
const ConfirmContext = createContext();

// El componente provider
export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolvePromise, setResolvePromise] = useState(null);

  const openConfirm = (msg) => {
    console.log("openConfirm llamado con mensaje:", msg);
    setMessage(msg);
    setIsOpen(true); // Establece isOpen en true para mostrar el modal
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) resolvePromise(true);
    closeConfirm();
  };

  const handleCancel = () => {
    if (resolvePromise) resolvePromise(false);
    closeConfirm();
  };

  const closeConfirm = () => {
    setIsOpen(false);
    setMessage("");
    setResolvePromise(null);
  };

  return (
    <ConfirmContext.Provider value={{ openConfirm }}>
      {children}
      {isOpen && (
        <Confirm
          message={message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
      />
      )}
    </ConfirmContext.Provider>
  );
};

// Hook para consumir el contexto
export const useConfirm = () => {
  return useContext(ConfirmContext);
};