import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import type {
  ClaimAdminView,
  ClaimStatus,
  FoundObjectPublicView,
  OperationResult,
} from '../types/custodia';

interface ClaimsViewProps {
  claims: ClaimAdminView[];
  allObjects: FoundObjectPublicView[];
  loading: boolean;
  filterObjetoId: string;
  onFilterObjetoChange: (objetoId: string) => void;
  onCreateClaim: (input: {
    objetoId: string;
    reclamanteFicticio: string;
    comprobacion: string;
    comprobacionVerificada: boolean;
    fecha: string;
  }) => Promise<OperationResult>;
  onUpdateClaim: (
    id: string,
    input: {
      reclamanteFicticio?: string;
      comprobacion?: string;
      comprobacionVerificada?: boolean;
      fecha?: string;
      estado?: ClaimStatus;
      motivoResolucion?: string;
    }
  ) => Promise<OperationResult>;
  onExecuteReturn: (id: string) => Promise<OperationResult>;
  onDeleteClaim: (id: string) => Promise<OperationResult>;
}

export function ClaimsView({
  claims,
  allObjects,
  loading,
  filterObjetoId,
  onFilterObjetoChange,
  onCreateClaim,
  onUpdateClaim,
  onExecuteReturn,
  onDeleteClaim,
}: ClaimsViewProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all');
  const [searchText, setSearchText] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<ClaimAdminView | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [objetoId, setObjetoId] = useState('');
  const [reclamanteFicticio, setReclamanteFicticio] = useState('');
  const [comprobacion, setComprobacion] = useState('');
  const [comprobacionVerificada, setComprobacionVerificada] = useState(false);
  const [fecha, setFecha] = useState('2026-11-19');
  const [estado, setEstado] = useState<ClaimStatus>('Pendiente');

  const filteredClaims = claims.filter((c) => {
    if (filterObjetoId !== 'all' && c.objetoId !== filterObjetoId) return false;
    if (statusFilter !== 'all' && c.estado !== statusFilter) return false;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      return (
        c.reclamanteFicticio.toLowerCase().includes(q) ||
        c.comprobacion.toLowerCase().includes(q) ||
        c.objetoCodigo.toLowerCase().includes(q) ||
        c.objetoDescripcion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function openCreateModal() {
    setEditingClaim(null);
    setFormError(null);
    const defaultObj =
      (filterObjetoId !== 'all' ? allObjects.find((o) => o.id === filterObjetoId) : undefined) ??
      allObjects.find((o) => o.estado === 'Pendiente de retiro') ??
      allObjects[0];
    setObjetoId(defaultObj?.id ?? '');
    setReclamanteFicticio('');
    setComprobacion('');
    setComprobacionVerificada(false);
    setFecha(new Date().toISOString().slice(0, 10));
    setEstado('Pendiente');
    setModalOpen(true);
  }

  function openEditModal(claim: ClaimAdminView) {
    setEditingClaim(claim);
    setFormError(null);
    setObjetoId(claim.objetoId);
    setReclamanteFicticio(claim.reclamanteFicticio);
    setComprobacion(claim.comprobacion);
    setComprobacionVerificada(claim.comprobacionVerificada);
    setFecha(claim.fecha);
    setEstado(claim.estado);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const res = editingClaim
      ? await onUpdateClaim(editingClaim.id, {
          reclamanteFicticio,
          comprobacion,
          comprobacionVerificada,
          fecha,
          estado,
        })
      : await onCreateClaim({
          objetoId,
          reclamanteFicticio,
          comprobacion,
          comprobacionVerificada,
          fecha,
        });

    setSubmitting(false);
    if (res.ok) {
      setModalOpen(false);
    } else {
      setFormError(res.reason);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F5F2EB]">
            Gestión de Reclamos y Devoluciones
          </h1>
          <p className="mt-1 text-sm text-[#A39E93]">
            Registra múltiples reclamos pendientes, exige comprobación verificada y ejecuta una
            única devolución definitiva por objeto.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C966]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar reclamo
        </button>
      </div>

      {/* Filters */}
      <section className="rounded-xl border border-white/10 bg-[#121215] p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label htmlFor="claim-q" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Buscar por reclamante, comprobación o código de objeto
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E998E]"
                aria-hidden="true"
              />
              <input
                id="claim-q"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Ej. Carlos Montoya, factura, OBJ-1002..."
                className="w-full rounded-lg border border-white/15 bg-[#09090B] py-2 pl-9 pr-3 text-sm text-[#F5F2EB] placeholder:text-[#6E6A61] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label htmlFor="claim-obj" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Filtrar por objeto
            </label>
            <select
              id="claim-obj"
              value={filterObjetoId}
              onChange={(e) => onFilterObjetoChange(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">Todos los objetos</option>
              {allObjects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.codigo} — {o.descripcion.slice(0, 42)} ({o.estado})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="claim-status" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Estado del reclamo
            </label>
            <select
              id="claim-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ClaimStatus)}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Claims Table */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#121215]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#17171B] text-xs font-medium text-[#A39E93]">
                <th className="px-4 py-3.5 whitespace-nowrap">Objeto</th>
                <th className="px-4 py-3.5">Reclamante y comprobación</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Verificación</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Estado</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Operaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {loading && filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#9E998E]">
                    Cargando reclamos...
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-[#F5F2EB]">
                      No hay reclamos que coincidan con el filtro seleccionado.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-mono text-xs font-semibold text-[#E8C966] tabular-nums">
                        {claim.objetoCodigo}
                      </div>
                      <div className="mt-0.5 max-w-[200px] truncate text-xs text-[#A39E93]">
                        {claim.objetoDescripcion}
                      </div>
                      <div className="mt-1 text-xs text-[#9E998E]">{claim.objetoEstado}</div>
                    </td>
                    <td className="px-4 py-3.5 align-top max-w-md">
                      <div className="font-medium text-[#F5F2EB]">{claim.reclamanteFicticio}</div>
                      <p className="mt-1 text-xs leading-relaxed text-[#D8D3C8]">
                        {claim.comprobacion}
                      </p>
                      <p className="mt-1 text-xs text-[#9E998E]">
                        {claim.motivoResolucion} · ID {claim.id}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {claim.comprobacionVerificada ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Verificada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5A93C]">
                          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                          Sin verificar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top font-mono text-xs text-[#D8D3C8] tabular-nums whitespace-nowrap">
                      {claim.fecha}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {claim.estado === 'Aprobado' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Aprobado
                        </span>
                      ) : claim.estado === 'Rechazado' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                          <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Rechazado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5A93C]">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void onExecuteReturn(claim.id)}
                          title="Ejecutar devolución única (exige comprobación verificada)"
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-2.5 py-1.5 text-xs font-semibold text-[#E8C966] transition-colors hover:bg-[#D4AF37] hover:text-[#09090B]"
                        >
                          <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Devolver
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(claim)}
                          title="Editar o verificar comprobación"
                          className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-[#D4AF37]/40 hover:text-[#E8C966]"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDeleteClaim(claim.id)}
                          title="Eliminar reclamo"
                          className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-red-500/40 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create / Edit Claim Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-[#D4AF37]/30 bg-[#121215] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 id="claim-modal-title" className="font-display text-lg font-semibold text-[#F5F2EB]">
                  {editingClaim ? `Gestionar reclamo ${editingClaim.id}` : 'Registrar nuevo reclamo'}
                </h2>
                <p className="mt-1 text-xs text-[#9E998E]">
                  Se admiten varios reclamos pendientes sobre un objeto pendiente de retiro, pero una
                  sola devolución.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar formulario de reclamo"
                className="rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/35 bg-[#1B1214] px-3.5 py-2.5 text-xs leading-relaxed text-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="c-obj" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Objeto reclamado
                </label>
                <select
                  id="c-obj"
                  value={objetoId}
                  onChange={(e) => setObjetoId(e.target.value)}
                  disabled={Boolean(editingClaim)}
                  required
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] disabled:opacity-60 focus:border-[#D4AF37] focus:outline-none"
                >
                  {allObjects.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} — {o.descripcion.slice(0, 46)} ({o.estado})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#9E998E]">
                  Intentar registrar reclamo sobre un objeto &quot;Devuelto&quot; será rechazado por
                  el servidor.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-recl" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Reclamante ficticio
                  </label>
                  <input
                    id="c-recl"
                    type="text"
                    value={reclamanteFicticio}
                    onChange={(e) => setReclamanteFicticio(e.target.value)}
                    required
                    placeholder="Ej. Mariana Ortega (Ficticio)"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="c-fecha" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Fecha del reclamo
                  </label>
                  <input
                    id="c-fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="c-comp" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Comprobación de propiedad (factura, serie, señas particulares)
                </label>
                <textarea
                  id="c-comp"
                  rows={3}
                  value={comprobacion}
                  onChange={(e) => setComprobacion(e.target.value)}
                  placeholder="Describe la prueba documental o característica exclusiva aportada por el reclamante"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-[#17171B] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comprobacionVerificada}
                  onChange={(e) => setComprobacionVerificada(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#D4AF37]"
                />
                <span className="text-xs leading-relaxed text-[#D8D3C8]">
                  <strong className="block font-semibold text-[#F5F2EB]">
                    Comprobación verificada por el administrador
                  </strong>
                  Obligatoria para autorizar la devolución del objeto.
                </span>
              </label>

              {editingClaim && (
                <div>
                  <label htmlFor="c-estado" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Estado
                  </label>
                  <select
                    id="c-estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as ClaimStatus)}
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Aprobado">Aprobado (usar botón Devolver)</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-[#F5F2EB] hover:border-[#D4AF37]/40"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#09090B] hover:bg-[#E5C158] disabled:opacity-50"
                >
                  {submitting
                    ? 'Procesando...'
                    : editingClaim
                      ? 'Guardar cambios'
                      : 'Registrar reclamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
