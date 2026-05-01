import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={clsx(
                "w-80 border-l-4 p-4 shadow-2xl flex gap-3 items-start",
                "bg-black border border-white/10",
                t.type === "success" && "border-l-emerald-500",
                t.type === "error" && "border-l-red-500",
                t.type === "warning" && "border-l-yellow-500",
                t.type === "info" && "border-l-blue-500"
              )}>
                <div className={clsx(
                  "p-1.5 rounded-sm",
                  t.type === "success" && "text-emerald-500 bg-emerald-500/10",
                  t.type === "error" && "text-red-500 bg-red-500/10",
                  t.type === "warning" && "text-yellow-500 bg-yellow-500/10",
                  t.type === "info" && "text-blue-500 bg-blue-500/10"
                )}>
                  {t.type === "success" && <CheckCircle size={18} />}
                  {t.type === "error" && <AlertCircle size={18} />}
                  {t.type === "warning" && <Bell size={18} />}
                  {t.type === "info" && <Info size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">{t.title}</h4>
                  {t.message && (
                    <p className="text-[11px] text-gray-500 font-bold italic mt-0.5 leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => removeToast(t.id)}
                  className="text-gray-600 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
