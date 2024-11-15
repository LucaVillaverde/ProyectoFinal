import { createRoot } from "react-dom/client";
import { AlertProvider } from "./context/messageContext";
import { ConfirmProvider } from "./context/confirmContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <AlertProvider>
        <ConfirmProvider>
            <App />
        </ConfirmProvider>
    </AlertProvider>
);
