export type UserRole = 'admin' | 'consulta';

export type ObjectStatus = 'Pendiente de retiro' | 'Devuelto';

export type ClaimStatus = 'Pendiente' | 'Aprobado' | 'Rechazado';

export interface CategoryRecord {
  id: string;
  nombre: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryView extends CategoryRecord {
  objectCount: number;
  pendientesCount: number;
}

export interface FoundObjectRecord {
  id: string;
  codigo: string;
  descripcion: string;
  categoriaId: string;
  lugar: string;
  fecha: string;
  estado: ObjectStatus;
  notasInternas: string;
  devueltoAt: string | null;
  reclamoGanadorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoundObjectPublicView {
  id: string;
  codigo: string;
  descripcion: string;
  categoriaId: string;
  categoriaNombre: string;
  lugar: string;
  fecha: string;
  estado: ObjectStatus;
  reclamosAbiertosCount: number;
  devueltoAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoundObjectAdminView extends FoundObjectPublicView {
  notasInternas: string;
  reclamoGanadorId: string | null;
}

export interface ClaimRecord {
  id: string;
  objetoId: string;
  reclamanteFicticio: string;
  comprobacion: string;
  comprobacionVerificada: boolean;
  fecha: string;
  estado: ClaimStatus;
  motivoResolucion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimAdminView extends ClaimRecord {
  objetoCodigo: string;
  objetoDescripcion: string;
  objetoEstado: ObjectStatus;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  operacion: string;
  entidad: 'Categoría' | 'Objeto' | 'Reclamo' | 'Sesión';
  resultado: 'ACEPTADA' | 'RECHAZADA';
  ruleCode: string;
  motivo: string;
}

export interface DashboardMetrics {
  pendientesRetiro: number;
  devueltos: number;
  reclamosAbiertos: number;
  totalObjetos: number;
  totalCategorias: number;
  tasaDevolucion: number;
  porCategoria: Array<{
    categoriaId: string;
    nombre: string;
    pendientes: number;
    devueltos: number;
    total: number;
  }>;
}

export interface OperationResult<T = unknown> {
  ok: boolean;
  ruleCode: string;
  message: string;
  reason: string;
  data?: T;
}

export interface ObjectsQueryResponse {
  items: Array<FoundObjectPublicView | FoundObjectAdminView>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableLocations: string[];
}
