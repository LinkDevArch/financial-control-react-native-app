import { createContext, useState, useContext } from "react";

export type AlertType = "error" | "success" | "info";

interface AlertState {
  visible: boolean;
  message: string;
  type: AlertType;
}

interface AlertContextProps {
  alert: AlertState;
  showAlert: (message: string, type?: AlertType) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    message: "",
    type: "info",
  });

  // Fuerza el cambio de estado aunque el mensaje sea igual
  const showAlert = (message: string, type: AlertType = "info") => {
    setAlert((prev) => {
      if (prev.visible && prev.message === message && prev.type === type) {
        // Si ya está visible y el mensaje es igual, lo oculta y vuelve a mostrar
        return { visible: false, message: "", type };
      }
      return { visible: true, message, type };
    });
    // Pequeño delay para asegurar el render si el mensaje es igual
    setTimeout(() => {
      setAlert({ visible: true, message, type });
    }, 10);
  };

  const hideAlert = () => setAlert({ ...alert, visible: false });

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
}
