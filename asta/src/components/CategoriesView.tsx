import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import type { CategoryView, OperationResult, UserRole } from '../types/custodia';

interface CategoriesViewProps {
  role: UserRole;
  categories: CategoryView[];
  onCreateCategory: (input: { nombre: string; descripcion: string }) => Promise<OperationResult>;
  onUpdateCategory: (
    id: string,
    input: { nombre: string; descripcion: string }
  ) => Promise<OperationResult>;
  onDeleteCategory: (id: string) => Promise<OperationResult>;
  onFilterByCategory: (categoriaId: string) => void;
}

export function CategoriesView({
  role,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onFilterByCategory,
}: CategoriesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryView | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditing(null);
    setNombre('');
    setDescripcion('');
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(cat: CategoryView) {
    setEditing(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    const res = editing
      ? await onUpdateCategory(editing.id, { nombre, descripcion })
      : await onCreateCategory({ nombre, descripcion });
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
            Categorías de Hallazgos
          </h1>
          <p className="mt-1 text-sm text-[#A39E93]">
            {role === 'admin'
              ? 'Administra la taxonomía de clasificación. Se impide eliminar categorías con objetos vinculados.'
              : 'Catálogo autorizado de categorías para orientar la búsqueda de objetos.'}
          </p>
        </div>

        {role === 'admin' && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158] whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nueva categoría
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <article
            key={cat.id}
            className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121215] p-5 transition-colors hover:border-[#D4AF37]/35"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-semibold text-[#F5F2EB]">{cat.nombre}</h2>
                <span className="font-mono text-xs text-[#E8C966] tabular-nums shrink-0">
                  {cat.objectCount} obj.
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#A39E93]">{cat.descripcion}</p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-3.5 text-xs">
              <button
                type="button"
                onClick={() => onFilterByCategory(cat.id)}
                className="font-medium text-[#D4AF37] hover:underline whitespace-nowrap"
              >
                Ver {cat.pendientesCount} pendiente(s)
              </button>

              {role === 'admin' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    title="Modificar categoría"
                    className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-[#D4AF37]/40 hover:text-[#E8C966]"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">Modificar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDeleteCategory(cat.id)}
                    title="Dar de baja categoría"
                    className="rounded-md border border-white/10 p-1.5 text-[#D8D3C8] hover:border-red-500/40 hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">Eliminar</span>
                  </button>
                </div>
              ) : (
                <span className="font-mono text-[#9E998E] tabular-nums">
                  Act. {cat.updatedAt.slice(0, 10)}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {modalOpen && role === 'admin' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cat-modal-title"
        >
          <div className="w-full max-w-md rounded-xl border border-[#D4AF37]/30 bg-[#121215] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <h2 id="cat-modal-title" className="font-display text-lg font-semibold text-[#F5F2EB]">
                {editing ? `Editar categoría "${editing.nombre}"` : 'Nueva categoría'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="rounded-md p-1.5 text-[#9E998E] hover:bg-white/5 hover:text-[#F5F2EB]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-lg border border-red-500/35 bg-[#1B1214] px-3.5 py-2.5 text-xs text-red-200">
                  {formError}
                </div>
              )}
              <div>
                <label htmlFor="cat-nombre" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Nombre de la categoría
                </label>
                <input
                  id="cat-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Ej. Joyería y Relojes"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="cat-desc" className="block text-xs font-medium text-[#D8D3C8] mb-1">
                  Descripción
                </label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Alcance de los objetos incluidos"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-[#F5F2EB] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-[#F5F2EB]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#09090B] hover:bg-[#E5C158] disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
