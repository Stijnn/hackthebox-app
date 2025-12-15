import ReactDOM from "react-dom/client";
import App from "./App";

import { ThemeProvider } from "@/components/theme-provider";
import { ProfileProvider } from "@/components/auth/profile-provider";
import { Authenticator } from "@/components/auth/authenticator.component";
import { Toaster } from "@/components/ui/sonner";

import "./index.css";
import { BrowserRouter } from "react-router";
import { ActiveMachineProvider } from "./components/machines/active-machine.provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider defaultTheme="dark" storageKey="-ui-mode">
    <ProfileProvider>
      <Authenticator>
        <ActiveMachineProvider
          polling={{
            interval: 10000,
          }}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ActiveMachineProvider>
      </Authenticator>
    </ProfileProvider>
    <Toaster expand={false} richColors position="top-center" theme="dark" />
  </ThemeProvider>
);
