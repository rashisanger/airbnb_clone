"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType
  ) => void;
}

const ToastContext =
  createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    // Return a no-op implementation when used outside the provider
    // (e.g., during server rendering) to avoid hard crashes.
    return {
      showToast: (message: string) => {
        // eslint-disable-next-line no-console
        console.warn("Toast used outside provider:", message);
      },
    };
  }

  return context;
}

export default function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info"
    ) => {
      const id = Date.now() + Math.random();

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      // Automatically remove after 3 seconds.
      setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (toast) => toast.id !== id
          )
        );
      }, 3000);
    },
    []
  );

  function removeToast(id: number) {
    setToasts((current) =>
      current.filter(
        (toast) => toast.id !== id
      )
    );
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
          >
            {/* Icon */}
            {toast.type === "success" && (
              <CheckCircle2
                className="shrink-0 text-green-600"
                size={22}
              />
            )}

            {toast.type === "error" && (
              <XCircle
                className="shrink-0 text-red-600"
                size={22}
              />
            )}

            {toast.type === "info" && (
              <Info
                className="shrink-0 text-blue-600"
                size={22}
              />
            )}

            {/* Message */}
            <p className="flex-1 text-sm font-medium text-[#222222]">
              {toast.message}
            </p>

            {/* Close */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}