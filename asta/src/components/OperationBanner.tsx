import { CheckCircle2, ShieldAlert, X } from 'lucide-react';
import type { OperationResult } from '../types/custodia';

interface OperationBannerProps {
  feedback: OperationResult | null;
  onDismiss: () => void;
}

export function OperationBanner({ feedback, onDismiss }: OperationBannerProps) {
  if (!feedback) return null;

  const isAccepted = feedback.ok;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border px-4 py-3.5 transition-colors duration-150 ${
        isAccepted
          ? 'border-emerald-500/30 bg-[#121815]'
          : 'border-red-500/35 bg-[#1B1214]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isAccepted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-400" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`font-semibold ${
                  isAccepted ? 'text-emerald-300' : 'text-red-300'
                }`}
              >
                {isAccepted ? 'Operación aceptada' : 'Operación rechazada'}
              </span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="font-medium text-[#F5F2EB]">{feedback.message}</span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="font-mono text-xs text-[#9E998E] tabular-nums">
                {feedback.ruleCode}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#D8D3C8]">{feedback.reason}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación de resultado"
          className="shrink-0 rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
