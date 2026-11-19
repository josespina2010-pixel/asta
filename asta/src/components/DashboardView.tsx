import { ArrowRight, CheckCircle2, Clock, FileCheck2, Lock, ShieldCheck } from 'lucide-react';
import type {
  AuditEntry,
  DashboardMetrics,
  FoundObjectPublicView,
  ObjectStatus,
  UserRole,
} from '../types/custodia';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  recentObjects: FoundObjectPublicView[];
  auditEntries: AuditEntry[];
  role: UserRole;
  loading: boolean;
  onNavigateObjectsWithStatus: (estado: 'all' | ObjectStatus) => void;
  onNavigateClaims: () => void;
  onOpenAuth: () => void;
}

export function DashboardView({
  metrics,
  recentObjects,
  auditEntries,
  role,
  loading,
  onNavigateObjectsWithStatus,
  onNavigateClaims,
  onOpenAuth,
}: DashboardViewProps) {
  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-xl border border-white/10 bg-[#121215]"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-[#121215]" />
      </div>
    );
  }

  const pendientes = metrics?.pendientesRetiro ?? 0;
  const devueltos = metrics?.devueltos ?? 0;
  const reclamosAbiertos = metrics?.reclamosAbiertos ?? 0;
  const totalObjetos = metrics?.totalObjetos ?? 0;
  const tasaDevolucion = metrics?.tasaDevolucion ?? 0;

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F5F2EB] sm:text-3xl">
            Panel de Control de Custodia
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#A39E93]">
            {role === 'admin'
              ? 'Vista operativa completa para administrar hallazgos, validar comprobaciones y formalizar devoluciones únicas.'
              : 'Vista pública autorizada. Consulta el inventario disponible y el estado general sin exposición de datos personales de reclamantes.'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#9E998E] shrink-0">
          {role === 'admin' ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-[#E8C966]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Modo Administrador activo
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/30 bg-[#17171B] px-3 py-2 font-medium text-[#E8C966] transition-colors hover:border-[#D4AF37] whitespace-nowrap"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Iniciar sesión como Administrador
            </button>
          )}
        </div>
      </div>

      {/* 3 Primary KPI Blocks */}
      <section aria-label="Indicadores principales del panel de control">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* KPI 1: Objetos pendientes de retiro */}
          <button
            type="button"
            onClick={() => onNavigateObjectsWithStatus('Pendiente de retiro')}
            className="group flex flex-col justify-between rounded-xl border border-[#D4AF37]/25 bg-[#121215] p-6 text-left transition-colors hover:border-[#D4AF37]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-[#A39E93]">
                Objetos pendientes de retiro
              </span>
              <Clock className="h-4 w-4 text-[#E5A93C]" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-mono text-4xl font-semibold tracking-tight text-[#F5F2EB] tabular-nums">
                {pendientes}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] group-hover:underline">
                Filtrar listado
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-[#9E998E] tabular-nums">
              De {totalObjetos} hallazgos registrados en {metrics?.totalCategorias ?? 0} categorías
            </p>
          </button>

          {/* KPI 2: Objetos devueltos */}
          <button
            type="button"
            onClick={() => onNavigateObjectsWithStatus('Devuelto')}
            className="group flex flex-col justify-between rounded-xl border border-white/12 bg-[#121215] p-6 text-left transition-colors hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-[#A39E93]">
                Objetos devueltos
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-mono text-4xl font-semibold tracking-tight text-[#F5F2EB] tabular-nums">
                {devueltos}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] group-hover:underline">
                Ver entregas
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-[#9E998E] tabular-nums">
              Tasa de restitución única: {tasaDevolucion}%
            </p>
          </button>

          {/* KPI 3: Reclamos abiertos */}
          <button
            type="button"
            onClick={() => {
              if (role === 'admin') {
                onNavigateClaims();
              } else {
                onOpenAuth();
              }
            }}
            className="group flex flex-col justify-between rounded-xl border border-white/12 bg-[#121215] p-6 text-left transition-colors hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-[#A39E93]">
                Reclamos abiertos
              </span>
              <FileCheck2 className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-mono text-4xl font-semibold tracking-tight text-[#F5F2EB] tabular-nums">
                {reclamosAbiertos}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D4AF37] group-hover:underline">
                {role === 'admin' ? 'Gestionar reclamos' : 'Solo administrador'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-[#9E998E]">
              {role === 'admin'
                ? 'Solicitudes pendientes de comprobación o retiro'
                : 'Los detalles de reclamantes están protegidos por rol'}
            </p>
          </button>
        </div>
      </section>

      {/* Two-column distribution & recent records */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Category Distribution */}
        <section className="lg:col-span-5 rounded-xl border border-white/10 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <h2 className="font-display text-base font-semibold text-[#F5F2EB]">
              Distribución por categoría
            </h2>
            <span className="font-mono text-xs text-[#9E998E] tabular-nums">
              {metrics?.totalCategorias ?? 0} categorías
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {(metrics?.porCategoria ?? []).map((cat) => {
              const pct = cat.total > 0 ? Math.round((cat.pendientes / cat.total) * 100) : 0;
              return (
                <div key={cat.categoriaId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#F5F2EB]">{cat.nombre}</span>
                    <span className="font-mono text-xs text-[#9E998E] tabular-nums">
                      {cat.pendientes} pend. · {cat.devueltos} dev.
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[#D4AF37] transition-all duration-300"
                      style={{ width: `${cat.total === 0 ? 0 : Math.max(pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Authorized Objects */}
        <section className="lg:col-span-7 rounded-xl border border-white/10 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <h2 className="font-display text-base font-semibold text-[#F5F2EB]">
              Hallazgos recientes
            </h2>
            <button
              type="button"
              onClick={() => onNavigateObjectsWithStatus('all')}
              className="text-xs font-medium text-[#D4AF37] hover:underline whitespace-nowrap"
            >
              Explorar catálogo completo
            </button>
          </div>

          <div className="mt-2 divide-y divide-white/8">
            {recentObjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#9E998E]">
                No hay hallazgos registrados todavía.
              </p>
            ) : (
              recentObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="flex flex-col gap-1.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-mono text-xs font-semibold text-[#E8C966] tabular-nums">
                        {obj.codigo}
                      </span>
                      <span aria-hidden="true" className="text-neutral-600">
                        ·
                      </span>
                      <span className="truncate font-medium text-[#F5F2EB]">{obj.descripcion}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#9E998E]">
                      <span>{obj.categoriaNombre}</span>
                      <span aria-hidden="true">·</span>
                      <span>{obj.lugar}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{obj.fecha}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-medium">
                    {obj.estado === 'Devuelto' ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Devuelto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#E5A93C]">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Pendiente de retiro
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Role-Specific Footer Section: Admin Audit Summary or Public Rules Notice */}
      {role === 'admin' ? (
        <section className="rounded-xl border border-[#D4AF37]/20 bg-[#121215] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <h2 className="font-display text-base font-semibold text-[#F5F2EB]">
              Últimas decisiones de validación del sistema
            </h2>
            <span className="text-xs text-[#9E998E]">Visible únicamente para Administrador</span>
          </div>
          <div className="mt-2 divide-y divide-white/8">
            {auditEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        entry.resultado === 'ACEPTADA' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {entry.resultado}
                    </span>
                    <span aria-hidden="true" className="text-neutral-600">
                      ·
                    </span>
                    <span className="font-medium text-[#F5F2EB]">{entry.operacion}</span>
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
      ) : (
        <section className="rounded-xl border border-white/10 bg-[#121215] p-6">
          <h2 className="font-display text-base font-semibold text-[#F5F2EB]">
            Política de consulta autorizada y retiro
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#A39E93]">
            Como usuario de consulta puedes revisar únicamente el catálogo autorizado de objetos
            hallados, sus categorías, lugares, fechas y estado de disponibilidad. Los datos de
            reclamantes, evidencias de comprobación y bitácoras internas permanecen restringidos al
            administrador. Para retirar un objeto pendiente es obligatorio presentar comprobación de
            propiedad ante administración; cada objeto admite una única devolución definitiva.
          </p>
        </section>
      )}
    </div>
  );
}
