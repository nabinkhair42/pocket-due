import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Platform, ToastAndroid } from "react-native";
import { Toast, ToastVariant } from "../components/toast";

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

const isAndroid = Platform.OS === "android";

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<ToastVariant>("info");

  const showToast = useCallback(
    (toastMessage: string, toastVariant: ToastVariant) => {
      if (isAndroid) {
        ToastAndroid.showWithGravity(
          toastMessage,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
        return;
      }

      setMessage(toastMessage);
      setVariant(toastVariant);
      setVisible(true);
    },
    []
  );

  const hideToast = useCallback(() => {
    if (isAndroid) return;
    setVisible(false);
  }, []);

  const value = useMemo(
    () => ({ showToast, hideToast }),
    [showToast, hideToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {!isAndroid && (
        <Toast
          message={message}
          variant={variant}
          visible={visible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
