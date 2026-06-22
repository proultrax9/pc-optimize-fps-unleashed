import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "./i18n/I18nProvider";
import App from "./App";
import { TweakProvider } from "./context/TweakProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <TweakProvider>
          <App />
        </TweakProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
