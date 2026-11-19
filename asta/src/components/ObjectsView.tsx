import { useState } from 'react';
import {
  ArrowDownUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FilePlus2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CategoryView,
  FoundObjectAdminView,
  FoundObjectPublicView,
  ObjectStatus,
  ObjectsQueryResponse,
  OperationResult,
  UserRole,
} from '../types/custodia';

interface ObjectsViewProps {
  role: UserRole;
  categories: CategoryView[];
  queryResult: ObjectsQueryResponse | null;
  loading: boolean;
  filters: {
    q: string;
    categoriaId: string;
    lugar: string;
    fechaDesde: string;
    fechaHasta: string;
    estado: string;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    page: number;
    pageSize: number;
  };
  onFiltersChange: (next: Partial<ObjectsViewProps['filters']>) => void;
  onResetFilters: () => void;
  onCreateObject: (input: {
    codigo: string;
    descripcion: string;
    categoriaId: string;
    lugar: string;
    fecha: string;
    estado: ObjectStatus;
    notasInternas: string;
  }) => Promise<OperationResult>;
  onUpdateObject: (
    id: string,
    input: {
      codigo: string;
      descripcion: string;
      categoriaId: string;
      lugar: string;
      fecha: string;
      estado: ObjectStatus;
      notasInternas: string;
    }
  ) => Promise<OperationResult>;
  onDeleteObject: (id: string) => Promise<OperationResult>;
  onOpenClaimsForObject: (objetoId: string) => void;
}

export function ObjectsView({
  role,
  categories,
  queryResult,
  loading,
  filters,
  onFiltersChange,
  onResetFilters,
  onCreateObject,
  onUpdateObject,
  onDeleteObject,
  onOpenClaimsForObject,
}: ObjectsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<FoundObjectAdminView | null>(null);
  const [inspectObject, setInspectObject] = useState<FoundObjectPublicView | FoundObjectAdminView | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [lugar, setLugar] = useState('');
  const [fecha, setFecha] = useState('2026-11-19');
  const [estado, setEstado] = useState<ObjectStatus>('Pendiente de retiro');
  const [notasInternas, setNotasInternas] = useState('');

  const items = queryResult?.items ?? [];
  const total = queryResult?.total ?? 0;
  const page = queryResult?.page ?? 1;
  const pageSize = queryResult?.pageSize ?? filters.pageSize;
  const totalPages = queryResult?.totalPages ?? 1;
  const availableLocations = queryResult?.availableLocations ?? [];

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  function openCreateModal() {
    setEditingObject(null);
    setFormError(null);
    setCodigo(`OBJ-${Math.floor(1020 + Math.random() * 8900)}`);
    setDescripcion('');
    setCategoriaId(categories[0]?.id ?? '');
    setLugar('');
    setFecha(new Date().toISOString().slice(0, 10));
    setEstado('Pendiente de retiro');
    setNotasInternas('');
    setModalOpen(true);
  }

  function openEditModal(obj: FoundObjectAdminView) {
    setEditingObject(obj);
    setFormError(null);
    setCodigo(obj.codigo);
    setDescripcion(obj.descripcion);
    setCategoriaId(obj.categoriaId);
    setLugar(obj.lugar);
    setFecha(obj.fecha);
    setEstado(obj.estado);
    setNotasInternas(obj.notasInternas ?? '');
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      codigo,
      descripcion,
      categoriaId,
      lugar,
      fecha,
      estado,
      notasInternas,
    };

    const res = editingObject
      ? await onUpdateObject(editingObject.id, payload)
      : await onCreateObject(payload);

    setSubmitting(false);
    if (res.ok) {
      setModalOpen(false);
    } else {
      setFormError(res.reason);
    }
  }

  const hasActiveFilters =
    filters.q.trim() !== '' ||
    filters.categoriaId !== 'all' ||
    filters.lugar !== 'all' ||
    filters.fechaDesde !== '' ||
    filters.fechaHasta !== '' ||
    filters.estado !== 'all';

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F5F2EB]">
            Catálogo de Objetos Hallados
          </h1>
          <p className="mt-1 text-sm text-[#A39E93]">
            Búsqueda textual combinada con filtros de categoría, lugar, rango de fechas y estado.
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C966]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Registrar hallazgo
          </button>
        )}
      </div>

      {/* Combined Search & Filters Bar */}
      <section
        aria-label="Búsqueda y filtros combinados"
        className="rounded-xl border border-white/10 bg-[#121215] p-5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Textual Search */}
          <div className="md:col-span-4">
            <label htmlFor="obj-search" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Búsqueda textual (código, descripción o lugar)
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9E998E]"
                aria-hidden="true"
              />
              <input
                id="obj-search"
                type="text"
                value={filters.q}
                onChange={(e) => onFiltersChange({ q: e.target.value, page: 1 })}
                placeholder="Ej. reloj, OBJ-1002, vestíbulo..."
                className="w-full rounded-lg border border-white/15 bg-[#09090B] py-2 pl-9 pr-3 text-sm text-[#F5F2EB] placeholder:text-[#6E6A61] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <label htmlFor="obj-cat" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Categoría
            </label>
            <select
              id="obj-cat"
              value={filters.categoriaId}
              onChange={(e) => onFiltersChange({ categoriaId: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="md:col-span-3">
            <label htmlFor="obj-loc" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Lugar del hallazgo
            </label>
            <select
              id="obj-loc"
              value={filters.lugar}
              onChange={(e) => onFiltersChange({ lugar: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="all">Todos los lugares</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <label htmlFor="obj-status" className="block text-xs font-medium text-[#A39E93] mb-1.5">
              Estado
            </label>
            <select
              id="obj-status"
              value={filters.estado}
              onChange={(e) => onFiltersChange({ estado: e.target.value, page: 1 })}
              className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="all">Todos</option>
              <option value="Pendiente de retiro">Pendiente de retiro</option>
              <option value="Devuelto">Devuelto</option>
            </select>
          </div>
        </div>

        {/* Second row: Date range + Sorting + Page Size + Clear */}
        <div className="flex flex-col gap-3 border-t border-white/8 pt-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            <div>
              <label htmlFor="obj-from" className="block text-xs font-medium text-[#A39E93] mb-1.5">
                Fecha desde
              </label>
              <input
                id="obj-from"
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => onFiltersChange({ fechaDesde: e.target.value, page: 1 })}
                className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <div>
              <label htmlFor="obj-to" className="block text-xs font-medium text-[#A39E93] mb-1.5">
                Fecha hasta
              </label>
              <input
                id="obj-to"
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => onFiltersChange({ fechaHasta: e.target.value, page: 1 })}
                className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="obj-sort" className="block text-xs font-medium text-[#A39E93] mb-1.5">
                Ordenar por
              </label>
              <select
                id="obj-sort"
                value={filters.sortBy}
                onChange={(e) => onFiltersChange({ sortBy: e.target.value, page: 1 })}
                className="rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value="fecha">Fecha de hallazgo</option>
                <option value="codigo">Código</option>
                <option value="descripcion">Descripción</option>
                <option value="estado">Estado</option>
                <option value="updatedAt">Última actualización</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc',
                  page: 1,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-xs font-medium text-[#F5F2EB] hover:border-[#D4AF37]/50 whitespace-nowrap"
            >
              <ArrowDownUp className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
              {filters.sortDir === 'asc' ? 'Ascendente' : 'Descendente'}
            </button>

            <div>
              <label htmlFor="obj-size" className="block text-xs font-medium text-[#A39E93] mb-1.5">
                Por página
              </label>
              <select
                id="obj-size"
                value={filters.pageSize}
                onChange={(e) => onFiltersChange({ pageSize: Number(e.target.value), page: 1 })}
                className="rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#17171B] px-3 py-2 text-xs font-medium text-[#F5F2EB] transition-colors hover:border-[#D4AF37]/50 disabled:opacity-40 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {/* Objects Data Grid */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-[#121215]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#17171B] text-xs font-medium text-[#A39E93]">
                <th className="px-4 py-3.5 whitespace-nowrap">Código</th>
                <th className="px-4 py-3.5">Descripción y categoría</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Lugar</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Estado</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {loading && items.length === 0 ? (
                [1, 2, 3, 4].map((row) => (
                  <tr key={row}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-6 animate-pulse rounded bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-[#F5F2EB]">
                      No se encontraron hallazgos con los criterios combinados.
                    </p>
                    <p className="mt-1 text-xs text-[#9E998E]">
                      Ajusta los filtros o limpia la búsqueda para ver todos los registros.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 px-3.5 py-2 text-xs font-medium text-[#E8C966] hover:bg-[#D4AF37]/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                items.map((obj) => (
                  <tr key={obj.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="px-4 py-3.5 align-top font-mono text-xs font-semibold text-[#E8C966] tabular-nums whitespace-nowrap">
                      {obj.codigo}
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-[#F5F2EB]">{obj.descripcion}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#9E998E]">
                        <span>{obj.categoriaNombre}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {obj.reclamosAbiertosCount} reclamo(s) pendiente(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top text-xs text-[#D8D3C8] whitespace-nowrap">
                      {obj.lugar}
                    </td>
                    <td className="px-4 py-3.5 align-top font-mono text-xs text-[#D8D3C8] tabular-nums whitespace-nowrap">
                      {obj.fecha}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {obj.estado === 'Devuelto' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Devuelto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#E5A93C]">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Pendiente de retiro
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectObject(obj)}
                          title="Consultar detalle autorizado"
                          className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-[#D4AF37]/40 hover:text-[#E8C966] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">Consultar</span>
                        </button>

                        {role === 'admin' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onOpenClaimsForObject(obj.id)}
                              title="Ver o registrar reclamos de este objeto"
                              className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-[#D4AF37]/40 hover:text-[#E8C966] transition-colors"
                            >
                              <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">Reclamos</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(obj as FoundObjectAdminView)}
                              title="Modificar objeto"
                              className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-[#D4AF37]/40 hover:text-[#E8C966] transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">Modificar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDeleteObject(obj.id)}
                              title="Dar de baja objeto"
                              className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-red-500/40 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">Eliminar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col gap-3 border-t border-white/10 bg-[#17171B] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs text-[#9E998E] tabular-nums">
            Mostrando {startIdx}–{endIdx} de {total} registro(s) · Página {page} de {totalPages}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onFiltersChange({ page: page - 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#09090B] px-2.5 py-1.5 text-xs font-medium text-[#F5F2EB] hover:border-[#D4AF37]/50 disabled:opacity-40 whitespace-nowrap"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => onFiltersChange({ page: pNum })}
                className={`min-w-8 rounded-md px-2.5 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors ${
                  pNum === page
                    ? 'bg-[#D4AF37] text-[#09090B] font-semibold'
                    : 'border border-white/10 bg-[#09090B] text-[#D8D3C8] hover:border-[#D4AF37]/40'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onFiltersChange({ page: page + 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-[#09090B] px-2.5 py-1.5 text-xs font-medium text-[#F5F2EB] hover:border-[#D4AF37]/50 disabled:opacity-40 whitespace-nowrap"
            >
              Siguiente
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Inspect Object Detail Modal (Authorized Fields Only for Consulta) */}
      {inspectObject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspect-obj-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-[#D4AF37]/30 bg-[#121215] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="font-mono text-xs font-semibold text-[#E8C966]">
                  {inspectObject.codigo} · ID {inspectObject.id}
                </div>
                <h2 id="inspect-obj-title" className="mt-1 font-display text-lg font-semibold text-[#F5F2EB]">
                  Detalle del Hallazgo
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectObject(null)}
                aria-label="Cerrar detalle"
                className="rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#9E998E]">Descripción</dt>
                <dd className="mt-0.5 font-medium text-[#F5F2EB]">{inspectObject.descripcion}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Categoría</dt>
                <dd className="mt-0.5 text-[#F5F2EB]">{inspectObject.categoriaNombre}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Lugar del hallazgo</dt>
                <dd className="mt-0.5 text-[#F5F2EB]">{inspectObject.lugar}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Fecha de hallazgo</dt>
                <dd className="mt-0.5 font-mono text-[#F5F2EB] tabular-nums">{inspectObject.fecha}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Estado actual</dt>
                <dd className="mt-0.5 font-medium text-[#E8C966]">{inspectObject.estado}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Reclamos pendientes</dt>
                <dd className="mt-0.5 font-mono text-[#F5F2EB] tabular-nums">
                  {inspectObject.reclamosAbiertosCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Fecha de devolución</dt>
                <dd className="mt-0.5 font-mono text-[#F5F2EB] tabular-nums">
                  {inspectObject.devueltoAt ? inspectObject.devueltoAt.slice(0, 10) : 'No devuelto'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Creado</dt>
                <dd className="mt-0.5 font-mono text-xs text-[#A39E93] tabular-nums">
                  {inspectObject.createdAt.slice(0, 19).replace('T', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#9E998E]">Actualizado</dt>
                <dd className="mt-0.5 font-mono text-xs text-[#A39E93] tabular-nums">
                  {inspectObject.updatedAt.slice(0, 19).replace('T', ' ')}
                </dd>
              </div>

              {role === 'admin' && 'notasInternas' in inspectObject && (
                <div className="sm:col-span-2 rounded-lg border border-white/10 bg-[#17171B] p-3">
                  <dt className="text-xs font-medium text-[#E8C966]">
                    Notas internas de custodia (Solo Administrador)
                  </dt>
                  <dd className="mt-1 text-xs leading-relaxed text-[#D8D3C8]">
                    {inspectObject.notasInternas || 'Sin notas internas registradas.'}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              {role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    const id = inspectObject.id;
                    setInspectObject(null);
                    onOpenClaimsForObject(id);
                  }}
                  className="rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#09090B] hover:bg-[#E5C158] whitespace-nowrap"
                >
                  Gestionar reclamos de este objeto
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectObject(null)}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-[#F5F2EB] hover:border-[#D4AF37]/50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create / Edit Object Modal */}
      {modalOpen && role === 'admin' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="obj-form-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-[#D4AF37]/30 bg-[#121215] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 id="obj-form-title" className="font-display text-lg font-semibold text-[#F5F2EB]">
                  {editingObject ? `Modificar objeto ${editingObject.codigo}` : 'Registrar nuevo hallazgo'}
                </h2>
                <p className="mt-1 text-xs text-[#9E998E]">
                  Los cambios quedan sujetos a las reglas de integridad y devolución única.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar formulario"
                className="rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/35 bg-[#1B1214] px-3.5 py-2.5 text-xs leading-relaxed text-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-codigo" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Código único
                  </label>
                  <input
                    id="f-codigo"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="f-fecha" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Fecha de hallazgo
                  </label>
                  <input
                    id="f-fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="f-desc" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Descripción detallada del objeto
                </label>
                <input
                  id="f-desc"
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  placeholder="Ej. Cartera de cuero negro con cierre dorado"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="f-cat" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Categoría
                  </label>
                  <select
                    id="f-cat"
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="f-lugar" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                    Lugar del hallazgo
                  </label>
                  <input
                    id="f-lugar"
                    type="text"
                    value={lugar}
                    onChange={(e) => setLugar(e.target.value)}
                    required
                    placeholder="Ej. Vestíbulo Principal"
                    className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="f-estado" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Estado (controlado por regla de comprobación)
                </label>
                <select
                  id="f-estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as ObjectStatus)}
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="Pendiente de retiro">Pendiente de retiro</option>
                  <option value="Devuelto">Devuelto</option>
                </select>
                <p className="mt-1 text-xs text-[#9E998E]">
                  Nota: El sistema rechaza marcar &quot;Devuelto&quot; directamente sin un reclamo con
                  comprobación verificada.
                </p>
              </div>

              <div>
                <label htmlFor="f-notas" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Notas internas de custodia (solo administrador)
                </label>
                <textarea
                  id="f-notas"
                  rows={2}
                  value={notasInternas}
                  onChange={(e) => setNotasInternas(e.target.value)}
                  placeholder="Detalles internos para validar propiedad (no visibles al usuario de consulta)"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

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
                    ? 'Guardando...'
                    : editingObject
                      ? 'Guardar cambios'
                      : 'Registrar objeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
