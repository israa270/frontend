import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthSessionProvider } from "./context/AuthSessionProvider.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthSessionProvider>
        <App />
      </AuthSessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
