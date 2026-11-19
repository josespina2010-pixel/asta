import { useState } from 'react';
import { Eye, KeyRound, ShieldCheck, X } from 'lucide-react';
import type { UserRole } from '../types/custodia';

interface AuthModalProps {
  open: boolean;
  currentRole: UserRole;
  loading: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onLogin: (role: UserRole, accessKey?: string) => Promise<void>;
}

export function AuthModal({
  open,
  currentRole,
  loading,
  errorMessage,
  onClose,
  onLogin,
}: AuthModalProps) {
  const [accessKey, setAccessKey] = useState('CUSTODIA-ADMIN-2026');

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-[#D4AF37]/30 bg-[#121215] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 id="auth-modal-title" className="font-display text-xl font-semibold text-[#F5F2EB]">
              Control de Acceso y Roles
            </h2>
            <p className="mt-1 text-sm text-[#9E998E]">
              Elige el perfil con el que deseas interactuar en el servicio web.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de acceso"
            className="rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {errorMessage && (
            <div className="rounded-lg border border-red-500/35 bg-[#1B1214] px-3.5 py-2.5 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Admin Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onLogin('admin', accessKey);
            }}
            className="space-y-3 rounded-lg border border-[#D4AF37]/25 bg-[#17171B] p-4"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#E8C966]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Perfil Administrador</span>
              {currentRole === 'admin' && (
                <span className="text-xs font-normal text-[#9E998E]">· Activo</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[#A39E93]">
              Opera altas, modificaciones, bajas, revisión de reclamos, validación de comprobaciones
              y devolución única al propietario.
            </p>

            <div>
              <label
                htmlFor="admin-access-key"
                className="block text-xs font-medium text-[#D8D3C8] mb-1.5"
              >
                Clave de acceso administrativo
              </label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E998E]"
                  aria-hidden="true"
                />
                <input
                  id="admin-access-key"
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Ingresa la clave administrativa"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] py-2 pl-9 pr-3 font-mono text-sm text-[#F5F2EB] placeholder:text-[#6E6A61] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  required
                />
              </div>
              <p className="mt-1.5 font-mono text-xs text-[#9E998E]">
                Clave de evaluación: CUSTODIA-ADMIN-2026
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158] disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C966]"
            >
              {loading ? 'Validando acceso...' : 'Entrar como Administrador'}
            </button>
          </form>

          {/* Consultation Mode */}
          <div className="space-y-3 rounded-lg border border-white/10 bg-[#17171B] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F2EB]">
              <Eye className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
              <span>Usuario de Consulta</span>
              {currentRole === 'consulta' && (
                <span className="text-xs font-normal text-[#9E998E]">· Activo</span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-[#A39E93]">
              Acceso de solo lectura a la información autorizada: tablero de métricas, catálogo de
              categorías y buscador de objetos sin datos privados de reclamantes ni acciones de
              edición.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void onLogin('consulta')}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-4 py-2 text-sm font-medium text-[#F5F2EB] transition-colors hover:border-[#D4AF37]/50 hover:text-[#E8C966] disabled:opacity-50 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              Cambiar a Usuario de Consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
