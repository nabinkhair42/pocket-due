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

/**
 * Android uses the OS toast: it renders in a system-owned window, so it always
 * sits above the keyboard, survives navigation, and matches what users expect
 * from every other app on the device.
 *
 * iOS has no system toast (Apple ships no ToastIOS and no public equivalent),
 * so it falls back to the in-app snackbar, which tracks the keyboard manually.
 */
const isAndroid = Platform.OS === "android";

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<ToastVariant>("info");

  const showToast = useCallback(
    (toastMessage: string, toastVariant: ToastVariant) => {
      if (isAndroid) {
        // The platform toast carries no variant styling; the message text has
        // to communicate success vs failure on its own.
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
    // Android's toast is owned by the OS and can't be dismissed early.
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
