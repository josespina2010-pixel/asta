import { useState } from 'react';
import { CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import type { AuditEntry, UserRole } from '../types/custodia';

interface WebServiceViewProps {
  role: UserRole;
  auditEntries: AuditEntry[];
  onRefreshAudit: () => Promise<void>;
}

interface EndpointDoc {
  method: string;
  path: string;
  access: 'Consulta y Admin' | 'Solo Administrador';
  summary: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/dashboard',
    access: 'Consulta y Admin',
    summary: 'Métricas agregadas: pendientes de retiro, devueltos y reclamos abiertos.',
  },
  {
    method: 'GET',
    path: '/api/objects',
    access: 'Consulta y Admin',
    summary: 'Búsqueda textual, filtros combinados (categoría, lugar, fechas, estado), orden y paginación.',
  },
  {
    method: 'GET',
    path: '/api/categories',
    access: 'Consulta y Admin',
    summary: 'Listado de categorías con conteo de hallazgos.',
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    access: 'Consulta y Admin',
    summary: 'Emisión de token Bearer firmado según rol (admin o consulta).',
  },
  {
    method: 'POST / PUT / DELETE',
    path: '/api/categories/:id',
    access: 'Solo Administrador',
    summary: 'Alta, modificación y baja de categorías (rechaza baja si existen objetos vinculados).',
  },
  {
    method: 'POST / PUT / DELETE',
    path: '/api/objects/:id',
    access: 'Solo Administrador',
    summary: 'Alta, modificación y baja de hallazgos con bloqueo de devolución directa sin reclamo.',
  },
  {
    method: 'GET / POST / PUT / DELETE',
    path: '/api/claims/:id',
    access: 'Solo Administrador',
    summary: 'Gestión de reclamos múltiples, validación de comprobaciones y protección de datos.',
  },
  {
    method: 'POST',
    path: '/api/claims/:id/return',
    access: 'Solo Administrador',
    summary: 'Devolución única al propietario: exige comprobación verificada y bloquea duplicados.',
  },
];

export function WebServiceView({ role, auditEntries, onRefreshAudit }: WebServiceViewProps) {
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function testHealthEndpoint() {
    setChecking(true);
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      setHealthResult(`${res.status} OK · ${json.service} · ${json.timestamp}`);
    } catch {
      setHealthResult('Error al consultar /api/health');
    } finally {
      setChecking(false);
    }
  }

  const visibleEndpoints =
    role === 'admin' ? ENDPOINTS : ENDPOINTS.filter((e) => e.access === 'Consulta y Admin');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F5F2EB]">
            {role === 'admin' ? 'Servicio Web REST y Auditoría' : 'Servicio Web Autorizado'}
          </h1>
          <p className="mt-1 text-sm text-[#A39E93]">
            {role === 'admin'
              ? 'Contratos REST activos con control de rol por token Bearer y registro histórico de decisiones.'
              : 'Puntos de consulta pública habilitados para el perfil de Consulta.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void testHealthEndpoint()}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D4AF37]/40 bg-[#17171B] px-4 py-2 text-xs font-semibold text-[#E8C966] hover:bg-[#D4AF37] hover:text-[#09090B] transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
          Verificar /api/health
        </button>
      </div>

      {healthResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-[#121815] px-4 py-3 font-mono text-xs text-emerald-300">
          {healthResult}
        </div>
      )}

      {/* Endpoints Table */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#121215]">
        <div className="border-b border-white/10 bg-[#17171B] px-4 py-3 text-xs font-semibold text-[#F5F2EB]">
          Endpoints disponibles ({visibleEndpoints.length})
        </div>
        <div className="divide-y divide-white/8">
          {visibleEndpoints.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="flex flex-col gap-1.5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-semibold text-[#E8C966]">{ep.method}</span>
                  <span className="text-[#F5F2EB]">{ep.path}</span>
                  <span aria-hidden="true" className="text-neutral-600">
                    ·
                  </span>
                  <span className="font-sans text-[#9E998E]">{ep.access}</span>
                </div>
                <p className="text-xs text-[#A39E93]">{ep.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin-only Audit Log */}
      {role === 'admin' && (
        <section className="overflow-hidden rounded-xl border border-[#D4AF37]/25 bg-[#121215]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#17171B] px-4 py-3">
            <h2 className="text-xs font-semibold text-[#F5F2EB]">
              Bitácora de aceptaciones y rechazos (Solo Administrador)
            </h2>
            <button
              type="button"
              onClick={() => void onRefreshAudit()}
              className="text-xs font-medium text-[#D4AF37] hover:underline"
            >
              Actualizar
            </button>
          </div>
          <div className="divide-y divide-white/8">
            {auditEntries.map((entry) => (
              <div key={entry.id} className="px-4 py-3.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.resultado === 'ACEPTADA' ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        ACEPTADA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-red-400">
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        RECHAZADA
                      </span>
                    )}
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="font-medium text-[#F5F2EB]">{entry.operacion}</span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="font-mono text-xs text-[#9E998E]">{entry.ruleCode}</span>
                  </div>
                  <span className="font-mono text-xs text-[#9E998E] tabular-nums">
                    {entry.timestamp.slice(0, 19).replace('T', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#A39E93]">{entry.motivo}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
