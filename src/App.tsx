import { BrowserRouter } from "react-router-dom";
import { Navigator } from "./navigator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n/config";
import { AuthProvider } from "./contexts/AuthContex";
import { ToastViewport } from "./components/ui/toast/ToastView";
import { ToastProvider } from "./contexts/toast/ToastProvider";

const queryCient = new QueryClient();
const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastViewport />
        <QueryClientProvider client={queryCient}>
          <BrowserRouter>
            <Navigator />
          </BrowserRouter>
        </QueryClientProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
