import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./assets/tailwind.css";
import App from "./App";
import { UserProvider } from "./store/UserStore";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
  // <React.StrictMode>

  // </React.StrictMode>
);
