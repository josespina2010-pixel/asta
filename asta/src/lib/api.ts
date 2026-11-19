import type {
  AuditEntry,
  CategoryView,
  ClaimAdminView,
  ClaimStatus,
  DashboardMetrics,
  FoundObjectAdminView,
  ObjectStatus,
  ObjectsQueryResponse,
  OperationResult,
  UserRole,
} from '../types/custodia';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<OperationResult<T>> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const payload = (await res.json()) as OperationResult<T>;
    return payload;
  } catch (err) {
    return {
      ok: false,
      ruleCode: 'ERROR_RED',
      message: 'Error de comunicación',
      reason:
        err instanceof Error
          ? `No fue posible contactar al servicio web: ${err.message}`
          : 'No fue posible contactar al servicio web.',
    };
  }
}

export async function loginRole(
  role: UserRole,
  accessKey?: string
): Promise<OperationResult<{ role: UserRole; token: string }>> {
  const res = await request<{ role: UserRole; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, accessKey }),
  });
  if (res.ok && res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res;
}

export async function fetchDashboard(): Promise<OperationResult<DashboardMetrics>> {
  return request<DashboardMetrics>('/api/dashboard');
}

export async function fetchCategories(): Promise<OperationResult<CategoryView[]>> {
  return request<CategoryView[]>('/api/categories');
}

export async function createCategory(input: {
  nombre: string;
  descripcion: string;
}): Promise<OperationResult<CategoryView>> {
  return request<CategoryView>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  id: string,
  input: { nombre: string; descripcion: string }
): Promise<OperationResult<CategoryView>> {
  return request<CategoryView>(`/api/categories/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteCategory(id: string): Promise<OperationResult<{ id: string }>> {
  return request<{ id: string }>(`/api/categories/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface ObjectsQueryParams {
  q?: string;
  categoriaId?: string;
  lugar?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchObjects(
  params: ObjectsQueryParams
): Promise<OperationResult<ObjectsQueryResponse>> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.categoriaId && params.categoriaId !== 'all') search.set('categoriaId', params.categoriaId);
  if (params.lugar && params.lugar !== 'all') search.set('lugar', params.lugar);
  if (params.fechaDesde) search.set('fechaDesde', params.fechaDesde);
  if (params.fechaHasta) search.set('fechaHasta', params.fechaHasta);
  if (params.estado && params.estado !== 'all') search.set('estado', params.estado);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();
  return request<ObjectsQueryResponse>(`/api/objects${qs ? `?${qs}` : ''}`);
}

export async function createObject(input: {
  codigo: string;
  descripcion: string;
  categoriaId: string;
  lugar: string;
  fecha: string;
  estado?: ObjectStatus;
  notasInternas?: string;
}): Promise<OperationResult<FoundObjectAdminView>> {
  return request<FoundObjectAdminView>('/api/objects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateObject(
  id: string,
  input: {
    codigo: string;
    descripcion: string;
    categoriaId: string;
    lugar: string;
    fecha: string;
    estado: ObjectStatus;
    notasInternas?: string;
  }
): Promise<OperationResult<FoundObjectAdminView>> {
  return request<FoundObjectAdminView>(`/api/objects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function deleteObject(id: string): Promise<OperationResult<{ id: string }>> {
  return request<{ id: string }>(`/api/objects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function fetchClaims(filters: {
  objetoId?: string;
  estado?: string;
  q?: string;
}): Promise<OperationResult<ClaimAdminView[]>> {
  const search = new URLSearchParams();
  if (filters.objetoId && filters.objetoId !== 'all') search.set('objetoId', filters.objetoId);
  if (filters.estado && filters.estado !== 'all') search.set('estado', filters.estado);
  if (filters.q) search.set('q', filters.q);
  const qs = search.toString();
  return request<ClaimAdminView[]>(`/api/claims${qs ? `?${qs}` : ''}`);
}

export async function createClaim(input: {
  objetoId: string;
  reclamanteFicticio: string;
  comprobacion: string;
  comprobacionVerificada: boolean;
  fecha: string;
}): Promise<OperationResult<ClaimAdminView>> {
  return request<ClaimAdminView>('/api/claims', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateClaim(
  id: string,
  input: {
    reclamanteFicticio?: string;
    comprobacion?: string;
    comprobacionVerificada?: boolean;
    fecha?: string;
    estado?: ClaimStatus;
    motivoResolucion?: string;
  }
): Promise<OperationResult<ClaimAdminView>> {
  return request<ClaimAdminView>(`/api/claims/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function executeClaimReturn(id: string): Promise<OperationResult<ClaimAdminView>> {
  return request<ClaimAdminView>(`/api/claims/${encodeURIComponent(id)}/return`, {
    method: 'POST',
  });
}

export async function deleteClaim(id: string): Promise<OperationResult<{ id: string }>> {
  return request<{ id: string }>(`/api/claims/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function fetchAudit(): Promise<OperationResult<AuditEntry[]>> {
  return request<AuditEntry[]>('/api/audit');
}
