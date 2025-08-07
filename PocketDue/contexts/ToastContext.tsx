import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastVariant } from "../components/Toast";

interface ToastContextType {
  showToast: (message: string, variant: ToastVariant) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<ToastVariant>("info");

  const showToast = useCallback((toastMessage: string, toastVariant: ToastVariant) => {
    setMessage(toastMessage);
    setVariant(toastVariant);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={message}
        variant={variant}
        visible={visible}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};
