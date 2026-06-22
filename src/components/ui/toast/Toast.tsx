import type { Toast as ToastType } from '../../../contexts/ToastContex'

const variants = {
  default: 'bg-white text-gray-900 border',
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
}

export function Toast({ toast }: { toast: ToastType }) {
  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg p-4 transition-all animate-in slide-in-from-top
        ${variants[toast.variant ?? 'default']}`}
    >
      {toast.title && <h5 className="font-semibold text-sm">{toast.title}</h5>}
      {toast.description && <p className="text-sm mt-1 opacity-90">{toast.description}</p>}
    </div>
  )
}
