import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@/components/theme-provider";
import { ProfileProvider } from "@/components/auth/profile-provider";
import { Authenticator } from "@/components/auth/authenticator.component";
import { Toaster } from "@/components/ui/sonner";

import "./index.css";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="-ui-mode">
      <ProfileProvider>
        <Authenticator>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Authenticator>
      </ProfileProvider>
      <Toaster expand={false} richColors position="top-center" theme="dark" />
    </ThemeProvider>
  </React.StrictMode>,
);
