import { useToast } from "../../../contexts/toast/ToastContex";
import { Toast } from "./Toast";

export function ToastViewport() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
