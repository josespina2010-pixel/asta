import { useCallback, useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { CategoriesView } from './components/CategoriesView';
import { ClaimsView } from './components/ClaimsView';
import { DashboardView } from './components/DashboardView';
import { ObjectsView } from './components/ObjectsView';
import { OperationBanner } from './components/OperationBanner';
import { WebServiceView } from './components/WebServiceView';
import {
  createCategory,
  createClaim,
  createObject,
  deleteCategory,
  deleteClaim,
  deleteObject,
  executeClaimReturn,
  fetchAudit,
  fetchCategories,
  fetchClaims,
  fetchDashboard,
  fetchObjects,
  loginRole,
  updateCategory,
  updateClaim,
  updateObject,
} from './lib/api';
import type {
  AuditEntry,
  CategoryView,
  ClaimAdminView,
  ClaimStatus,
  DashboardMetrics,
  FoundObjectPublicView,
  ObjectStatus,
  ObjectsQueryResponse,
  OperationResult,
  UserRole,
} from './types/custodia';

type ActiveTab = 'panel' | 'objetos' | 'reclamos' | 'categorias' | 'servicio';

const INITIAL_FILTERS = {
  q: '',
  categoriaId: 'all',
  lugar: 'all',
  fechaDesde: '',
  fechaHasta: '',
  estado: 'all',
  sortBy: 'fecha',
  sortDir: 'desc' as 'asc' | 'desc',
  page: 1,
  pageSize: 6,
};

export default function App() {
  const [role, setRole] = useState<UserRole>('consulta');
  const [activeTab, setActiveTab] = useState<ActiveTab>('panel');
  const [feedback, setFeedback] = useState<OperationResult | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [categories, setCategories] = useState<CategoryView[]>([]);
  const [objectsQuery, setObjectsQuery] = useState<ObjectsQueryResponse | null>(null);
  const [allObjectsSummary, setAllObjectsSummary] = useState<FoundObjectPublicView[]>([]);
  const [claims, setClaims] = useState<ClaimAdminView[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [claimObjetoFilter, setClaimObjetoFilter] = useState<string>('all');
  const [loadingMain, setLoadingMain] = useState(true);

  const loadCoreData = useCallback(
    async (currentRole: UserRole, currentFilters: typeof INITIAL_FILTERS) => {
      setLoadingMain(true);
      const [dashRes, catRes, objRes, allObjRes] = await Promise.all([
        fetchDashboard(),
        fetchCategories(),
        fetchObjects(currentFilters),
        fetchObjects({ page: 1, pageSize: 50, sortBy: 'codigo', sortDir: 'asc' }),
      ]);

      if (dashRes.ok && dashRes.data) setDashboard(dashRes.data);
      if (catRes.ok && catRes.data) setCategories(catRes.data);
      if (objRes.ok && objRes.data) setObjectsQuery(objRes.data);
      if (allObjRes.ok && allObjRes.data) setAllObjectsSummary(allObjRes.data.items);

      if (currentRole === 'admin') {
        const [claimsRes, auditRes] = await Promise.all([fetchClaims({}), fetchAudit()]);
        if (claimsRes.ok && claimsRes.data) setClaims(claimsRes.data);
        if (auditRes.ok && auditRes.data) setAuditEntries(auditRes.data);
      } else {
        setClaims([]);
        setAuditEntries([]);
      }
      setLoadingMain(false);
    },
    []
  );

  useEffect(() => {
    void loadCoreData(role, filters);
  }, [role, filters, loadCoreData]);

  async function handleLogin(nextRole: UserRole, accessKey?: string) {
    setAuthLoading(true);
    setAuthError(null);
    const res = await loginRole(nextRole, accessKey);
    setAuthLoading(false);

    if (!res.ok) {
      setAuthError(res.reason);
      setFeedback(res);
      return;
    }

    setRole(nextRole);
    setAuthModalOpen(false);
    setFeedback(res);
    if (nextRole === 'consulta' && activeTab === 'reclamos') {
      setActiveTab('panel');
    }
  }

  function handleTabSelect(tab: ActiveTab) {
    if (tab === 'reclamos' && role !== 'admin') {
      setFeedback({
        ok: false,
        ruleCode: 'AUTORIZACION_DENEGADA',
        message: 'Acceso restringido',
        reason:
          'El módulo de Reclamos contiene datos de reclamantes y comprobaciones reservadas al Administrador.',
      });
      setAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  }

  async function refreshAfterMutation(res: OperationResult): Promise<OperationResult> {
    setFeedback(res);
    if (res.ok) {
      await loadCoreData(role, filters);
    } else if (role === 'admin') {
      const auditRes = await fetchAudit();
      if (auditRes.ok && auditRes.data) setAuditEntries(auditRes.data);
    }
    return res;
  }

  const navItems: Array<{ id: ActiveTab; label: string }> =
    role === 'admin'
      ? [
          { id: 'panel', label: 'Panel' },
          { id: 'objetos', label: 'Objetos' },
          { id: 'reclamos', label: 'Reclamos' },
          { id: 'categorias', label: 'Categorías' },
          { id: 'servicio', label: 'Servicio Web' },
        ]
      : [
          { id: 'panel', label: 'Panel' },
          { id: 'objetos', label: 'Objetos' },
          { id: 'categorias', label: 'Categorías' },
          { id: 'servicio', label: 'Servicio Web' },
        ];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F5F2EB] flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/20 bg-[#09090B]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <a
            href="#panel"
            onClick={(e) => {
              e.preventDefault();
              handleTabSelect('panel');
            }}
            className="font-display text-lg font-bold tracking-tight text-[#E8C966] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded"
          >
            Áurea Custodia
          </a>

          {/* Zone 2: Concise single-line nav links */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabSelect(item.id)}
                  className={`border-b-2 py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                    isActive
                      ? 'border-[#D4AF37] text-[#F5F2EB]'
                      : 'border-transparent text-[#9E998E] hover:text-[#F5F2EB]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setAuthModalOpen(true);
              }}
              className="rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#09090B] transition-colors hover:bg-[#E5C158] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C966]"
            >
              {role === 'admin' ? 'Rol: Administrador' : 'Acceso Administrador'}
            </button>
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <nav
          aria-label="Navegación móvil"
          className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-white/8 px-4 py-2 text-xs font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabSelect(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 ${
                  isActive ? 'text-[#E8C966] font-semibold' : 'text-[#9E998E]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <OperationBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

        {activeTab === 'panel' && (
          <DashboardView
            metrics={dashboard}
            recentObjects={allObjectsSummary.slice(0, 5)}
            auditEntries={auditEntries}
            role={role}
            loading={loadingMain}
            onNavigateObjectsWithStatus={(estado) => {
              setFilters({ ...INITIAL_FILTERS, estado });
              setActiveTab('objetos');
            }}
            onNavigateClaims={() => handleTabSelect('reclamos')}
            onOpenAuth={() => {
              setAuthError(null);
              setAuthModalOpen(true);
            }}
          />
        )}

        {activeTab === 'objetos' && (
          <ObjectsView
            role={role}
            categories={categories}
            queryResult={objectsQuery}
            loading={loadingMain}
            filters={filters}
            onFiltersChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            onResetFilters={() => setFilters(INITIAL_FILTERS)}
            onCreateObject={async (input) => refreshAfterMutation(await createObject(input))}
            onUpdateObject={async (id, input) => refreshAfterMutation(await updateObject(id, input))}
            onDeleteObject={async (id) => refreshAfterMutation(await deleteObject(id))}
            onOpenClaimsForObject={(objetoId) => {
              setClaimObjetoFilter(objetoId);
              handleTabSelect('reclamos');
            }}
          />
        )}

        {activeTab === 'reclamos' && role === 'admin' && (
          <ClaimsView
            claims={claims}
            allObjects={allObjectsSummary}
            loading={loadingMain}
            filterObjetoId={claimObjetoFilter}
            onFilterObjetoChange={setClaimObjetoFilter}
            onCreateClaim={async (input) => refreshAfterMutation(await createClaim(input))}
            onUpdateClaim={async (
              id,
              input: {
                reclamanteFicticio?: string;
                comprobacion?: string;
                comprobacionVerificada?: boolean;
                fecha?: string;
                estado?: ClaimStatus;
                motivoResolucion?: string;
              }
            ) => refreshAfterMutation(await updateClaim(id, input))}
            onExecuteReturn={async (id) => refreshAfterMutation(await executeClaimReturn(id))}
            onDeleteClaim={async (id) => refreshAfterMutation(await deleteClaim(id))}
          />
        )}

        {activeTab === 'categorias' && (
          <CategoriesView
            role={role}
            categories={categories}
            onCreateCategory={async (input) => refreshAfterMutation(await createCategory(input))}
            onUpdateCategory={async (id, input) =>
              refreshAfterMutation(await updateCategory(id, input))
            }
            onDeleteCategory={async (id) => refreshAfterMutation(await deleteCategory(id))}
            onFilterByCategory={(categoriaId) => {
              setFilters({ ...INITIAL_FILTERS, categoriaId });
              setActiveTab('objetos');
            }}
          />
        )}

        {activeTab === 'servicio' && (
          <WebServiceView
            role={role}
            auditEntries={auditEntries}
            onRefreshAudit={async () => {
              const res = await fetchAudit();
              if (res.ok && res.data) setAuditEntries(res.data);
            }}
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="border-t border-white/10 bg-[#09090B]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-[#9E998E] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>Áurea Custodia · Registro de Hallazgos, Reclamos y Devoluciones</span>
          <span>
            Perfil activo:{' '}
            <strong className="font-medium text-[#E8C966]">
              {role === 'admin' ? 'Administrador' : 'Usuario de Consulta'}
            </strong>
          </span>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        currentRole={role}
        loading={authLoading}
        errorMessage={authError}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}
