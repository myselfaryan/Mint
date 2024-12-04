import { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export enum ToastType {
  SUCCESS = "success",
  FAILURE = "failure",
}

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 m-4 p-4 rounded-md shadow-md flex items-center space-x-2 z-[9999] space-y-1 ${
        type === ToastType.SUCCESS
          ? "bg-background text-foreground border border-border"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      {type === ToastType.SUCCESS ? (
        <CheckCircle className="text-primary" />
      ) : (
        <XCircle className="text-destructive-foreground" />
      )}
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className={`ml-2 focus:outline-none ${
          type === ToastType.SUCCESS
            ? "text-muted-foreground hover:text-foreground"
            : "text-destructive-foreground/80 hover:text-destructive-foreground"
        }`}
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}
