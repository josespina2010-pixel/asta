import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  AuditEntry,
  CategoryRecord,
  CategoryView,
  ClaimAdminView,
  ClaimRecord,
  ClaimStatus,
  DashboardMetrics,
  FoundObjectAdminView,
  FoundObjectPublicView,
  FoundObjectRecord,
  ObjectStatus,
  ObjectsQueryResponse,
  OperationResult,
  UserRole,
} from '../src/types/custodia.ts';

interface DatabaseSnapshot {
  categories: CategoryRecord[];
  objects: FoundObjectRecord[];
  claims: ClaimRecord[];
  audit: AuditEntry[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'custodia-db.json');

function createSeedDatabase(): DatabaseSnapshot {
  const categories: CategoryRecord[] = [
    {
      id: 'cat-electronica',
      nombre: 'Electrónica',
      descripcion: 'Dispositivos móviles, portátiles, auriculares y equipos digitales.',
      createdAt: '2026-10-12T09:15:00.000Z',
      updatedAt: '2026-10-12T09:15:00.000Z',
    },
    {
      id: 'cat-documentacion',
      nombre: 'Documentación',
      descripcion: 'Identificaciones, pasaportes, credenciales corporativas y carpetas.',
      createdAt: '2026-10-12T09:18:00.000Z',
      updatedAt: '2026-10-12T09:18:00.000Z',
    },
    {
      id: 'cat-accesorios',
      nombre: 'Accesorios Personales',
      descripcion: 'Relojes, gafas, joyería y artículos de uso cotidiano.',
      createdAt: '2026-10-12T09:20:00.000Z',
      updatedAt: '2026-10-12T09:20:00.000Z',
    },
    {
      id: 'cat-llaves',
      nombre: 'Llaves y Tarjetas',
      descripcion: 'Llaveros vehiculares, llaves de acceso y tarjetas magnéticas.',
      createdAt: '2026-10-12T09:22:00.000Z',
      updatedAt: '2026-10-12T09:22:00.000Z',
    },
    {
      id: 'cat-equipaje',
      nombre: 'Equipaje y Bolsos',
      descripcion: 'Mochilas ejecutivas, portafolios, maletas y estuches.',
      createdAt: '2026-10-12T09:25:00.000Z',
      updatedAt: '2026-10-12T09:25:00.000Z',
    },
    {
      id: 'cat-optica',
      nombre: 'Instrumentos y Óptica',
      descripcion: 'Cámaras fotográficas, lentes profesionales e instrumentos de medición.',
      createdAt: '2026-10-12T09:28:00.000Z',
      updatedAt: '2026-10-12T09:28:00.000Z',
    },
  ];

  const objects: FoundObjectRecord[] = [
    {
      id: 'obj-1001',
      codigo: 'OBJ-1001',
      descripcion: 'Laptop profesional 14 pulgadas gris espacial con funda rígida negra',
      categoriaId: 'cat-electronica',
      lugar: 'Sala de Conferencias B',
      fecha: '2026-11-04',
      estado: 'Pendiente de retiro',
      notasInternas: 'Etiqueta parcial en la base sin nombre completo; batería al 40%.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-04T14:20:00.000Z',
      updatedAt: '2026-11-04T14:20:00.000Z',
    },
    {
      id: 'obj-1002',
      codigo: 'OBJ-1002',
      descripcion: 'Reloj cronógrafo de acero inoxidable con bisel dorado',
      categoriaId: 'cat-accesorios',
      lugar: 'Vestíbulo Principal',
      fecha: '2026-11-06',
      estado: 'Pendiente de retiro',
      notasInternas: 'Tiene grabado de iniciales en la tapa posterior (verificación clave).',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-06T11:05:00.000Z',
      updatedAt: '2026-11-08T16:40:00.000Z',
    },
    {
      id: 'obj-1003',
      codigo: 'OBJ-1003',
      descripcion: 'Portafolio ejecutivo de cuero negro con cierre metálico',
      categoriaId: 'cat-equipaje',
      lugar: 'Auditorio Dorado',
      fecha: '2026-11-07',
      estado: 'Devuelto',
      notasInternas: 'Contenía agenda corporativa y cargador USB-C.',
      devueltoAt: '2026-11-10T17:15:00.000Z',
      reclamoGanadorId: 'rec-2001',
      createdAt: '2026-11-07T18:30:00.000Z',
      updatedAt: '2026-11-10T17:15:00.000Z',
    },
    {
      id: 'obj-1004',
      codigo: 'OBJ-1004',
      descripcion: 'Llavero metálico con llave inteligente vehicular y tag magnético',
      categoriaId: 'cat-llaves',
      lugar: 'Estacionamiento Nivel 2',
      fecha: '2026-11-09',
      estado: 'Pendiente de retiro',
      notasInternas: 'Entregado por personal de vigilancia del sector Norte.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-09T08:45:00.000Z',
      updatedAt: '2026-11-09T08:45:00.000Z',
    },
    {
      id: 'obj-1005',
      codigo: 'OBJ-1005',
      descripcion: 'Auriculares inalámbricos con cancelación de ruido en estuche negro',
      categoriaId: 'cat-electronica',
      lugar: 'Cafetería Central',
      fecha: '2026-11-10',
      estado: 'Pendiente de retiro',
      notasInternas: 'Número de serie registrado en inventario interno.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-10T13:10:00.000Z',
      updatedAt: '2026-11-11T10:00:00.000Z',
    },
    {
      id: 'obj-1006',
      codigo: 'OBJ-1006',
      descripcion: 'Pasaporte vigente dentro de porta-documentos azul marino',
      categoriaId: 'cat-documentacion',
      lugar: 'Recepción Torre Norte',
      fecha: '2026-11-11',
      estado: 'Devuelto',
      notasInternas: 'Resguardado en caja fuerte hasta la validación presencial.',
      devueltoAt: '2026-11-12T15:30:00.000Z',
      reclamoGanadorId: 'rec-2003',
      createdAt: '2026-11-11T09:20:00.000Z',
      updatedAt: '2026-11-12T15:30:00.000Z',
    },
    {
      id: 'obj-1007',
      codigo: 'OBJ-1007',
      descripcion: 'Cámara mirrorless con lente 35mm y correa tejida',
      categoriaId: 'cat-optica',
      lugar: 'Auditorio Dorado',
      fecha: '2026-11-12',
      estado: 'Pendiente de retiro',
      notasInternas: 'Tarjeta SD intacta; requiere acreditar número de serie.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-12T19:00:00.000Z',
      updatedAt: '2026-11-12T19:00:00.000Z',
    },
    {
      id: 'obj-1008',
      codigo: 'OBJ-1008',
      descripcion: 'Gafas ópticas con montura de carey en estuche rígido',
      categoriaId: 'cat-accesorios',
      lugar: 'Cafetería Central',
      fecha: '2026-11-14',
      estado: 'Pendiente de retiro',
      notasInternas: 'Halladas en la mesa 12 junto a la terraza.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-14T16:10:00.000Z',
      updatedAt: '2026-11-14T16:10:00.000Z',
    },
    {
      id: 'obj-1009',
      codigo: 'OBJ-1009',
      descripcion: 'Mochila técnica impermeable con compartimento para tableta',
      categoriaId: 'cat-equipaje',
      lugar: 'Vestíbulo Principal',
      fecha: '2026-11-15',
      estado: 'Devuelto',
      notasInternas: 'Incluía identificación laboral verificada al retirar.',
      devueltoAt: '2026-11-16T11:45:00.000Z',
      reclamoGanadorId: 'rec-2004',
      createdAt: '2026-11-15T10:00:00.000Z',
      updatedAt: '2026-11-16T11:45:00.000Z',
    },
    {
      id: 'obj-1010',
      codigo: 'OBJ-1010',
      descripcion: 'Tarjeta de acceso corporativo sin fotografía visible en funda transparente',
      categoriaId: 'cat-llaves',
      lugar: 'Recepción Torre Norte',
      fecha: '2026-11-16',
      estado: 'Pendiente de retiro',
      notasInternas: 'Requiere validación del código RFID en módulo de seguridad.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-16T08:30:00.000Z',
      updatedAt: '2026-11-16T08:30:00.000Z',
    },
    {
      id: 'obj-1011',
      codigo: 'OBJ-1011',
      descripcion: 'Tableta digitalizadora de 11 pulgadas con lápiz óptico acoplado',
      categoriaId: 'cat-electronica',
      lugar: 'Sala de Conferencias B',
      fecha: '2026-11-17',
      estado: 'Pendiente de retiro',
      notasInternas: 'Pantalla protegida con mica mate; sin daños visibles.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-17T15:40:00.000Z',
      updatedAt: '2026-11-17T15:40:00.000Z',
    },
    {
      id: 'obj-1012',
      codigo: 'OBJ-1012',
      descripcion: 'Carpeta de cuero con planos arquitectónicos enrollados',
      categoriaId: 'cat-documentacion',
      lugar: 'Estacionamiento Nivel 2',
      fecha: '2026-11-18',
      estado: 'Pendiente de retiro',
      notasInternas: 'Encontrada junto al ascensor principal.',
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: '2026-11-18T12:25:00.000Z',
      updatedAt: '2026-11-18T12:25:00.000Z',
    },
  ];

  const claims: ClaimRecord[] = [
    {
      id: 'rec-2001',
      objetoId: 'obj-1003',
      reclamanteFicticio: 'Mateo Villalobos (Ficticio)',
      comprobacion: 'Factura original #FAC-8821 y coincidencia exacta de iniciales en agenda interior.',
      comprobacionVerificada: true,
      fecha: '2026-11-09',
      estado: 'Aprobado',
      motivoResolucion: 'Comprobación documental verificada y entrega única formalizada.',
      createdAt: '2026-11-09T10:15:00.000Z',
      updatedAt: '2026-11-10T17:15:00.000Z',
    },
    {
      id: 'rec-2002',
      objetoId: 'obj-1003',
      reclamanteFicticio: 'Lucía Mendizábal (Ficticio)',
      comprobacion: 'Descripción general del color sin especificar contenido interior.',
      comprobacionVerificada: false,
      fecha: '2026-11-09',
      estado: 'Rechazado',
      motivoResolucion: 'Cerrado automáticamente: el objeto fue devuelto al reclamo rec-2001.',
      createdAt: '2026-11-09T14:40:00.000Z',
      updatedAt: '2026-11-10T17:15:00.000Z',
    },
    {
      id: 'rec-2003',
      objetoId: 'obj-1006',
      reclamanteFicticio: 'Sofía Altamirano (Ficticio)',
      comprobacion: 'Cédula oficial coincidente con titular del pasaporte y firma presencial.',
      comprobacionVerificada: true,
      fecha: '2026-11-12',
      estado: 'Aprobado',
      motivoResolucion: 'Identidad verificada presencialmente; devolución única completada.',
      createdAt: '2026-11-12T11:00:00.000Z',
      updatedAt: '2026-11-12T15:30:00.000Z',
    },
    {
      id: 'rec-2004',
      objetoId: 'obj-1009',
      reclamanteFicticio: 'Andrés Salgado (Ficticio)',
      comprobacion: 'Credencial laboral vigente y código de serie de la tableta interior.',
      comprobacionVerificada: true,
      fecha: '2026-11-16',
      estado: 'Aprobado',
      motivoResolucion: 'Evidencia confirmada; objeto entregado al propietario.',
      createdAt: '2026-11-16T09:10:00.000Z',
      updatedAt: '2026-11-16T11:45:00.000Z',
    },
    {
      id: 'rec-2005',
      objetoId: 'obj-1002',
      reclamanteFicticio: 'Carlos Montoya (Ficticio)',
      comprobacion: 'Certificado de compra #CR-4410 y coincidencia exacta de iniciales grabadas "C.M.R.".',
      comprobacionVerificada: true,
      fecha: '2026-11-08',
      estado: 'Pendiente',
      motivoResolucion: 'Comprobación verificada; listo para formalizar devolución única.',
      createdAt: '2026-11-08T16:40:00.000Z',
      updatedAt: '2026-11-08T16:40:00.000Z',
    },
    {
      id: 'rec-2006',
      objetoId: 'obj-1002',
      reclamanteFicticio: 'Elena Ríos (Ficticio)',
      comprobacion: 'Indica haber perdido un reloj dorado en el vestíbulo, pendiente presentar factura o iniciales.',
      comprobacionVerificada: false,
      fecha: '2026-11-08',
      estado: 'Pendiente',
      motivoResolucion: 'Pendiente de acreditar comprobación documental.',
      createdAt: '2026-11-08T18:05:00.000Z',
      updatedAt: '2026-11-08T18:05:00.000Z',
    },
    {
      id: 'rec-2007',
      objetoId: 'obj-1005',
      reclamanteFicticio: 'Diego Peñaloza (Ficticio)',
      comprobacion: 'Solicitud inicial sin comprobante de serie ni vinculación Bluetooth verificada.',
      comprobacionVerificada: false,
      fecha: '2026-11-11',
      estado: 'Pendiente',
      motivoResolucion: 'En espera de comprobación antes de autorizar devolución.',
      createdAt: '2026-11-11T10:00:00.000Z',
      updatedAt: '2026-11-11T10:00:00.000Z',
    },
    {
      id: 'rec-2008',
      objetoId: 'obj-1007',
      reclamanteFicticio: 'Valeria Paredes (Ficticio)',
      comprobacion: 'Tarjeta de garantía del fabricante con número de serie coincidente.',
      comprobacionVerificada: true,
      fecha: '2026-11-15',
      estado: 'Pendiente',
      motivoResolucion: 'Evidencia validada; pendiente de retiro presencial.',
      createdAt: '2026-11-15T14:20:00.000Z',
      updatedAt: '2026-11-15T14:20:00.000Z',
    },
  ];

  const audit: AuditEntry[] = [
    {
      id: 'aud-1',
      timestamp: '2026-11-16T11:45:00.000Z',
      actorRole: 'admin',
      operacion: 'Devolución de objeto OBJ-1009',
      entidad: 'Reclamo',
      resultado: 'ACEPTADA',
      ruleCode: 'DEVOLUCION_UNICA_APROBADA',
      motivo: 'Se verificó comprobación (credencial laboral y serie de tableta) y se registró la devolución única del objeto OBJ-1009.',
    },
    {
      id: 'aud-2',
      timestamp: '2026-11-12T15:30:00.000Z',
      actorRole: 'admin',
      operacion: 'Devolución de objeto OBJ-1006',
      entidad: 'Reclamo',
      resultado: 'ACEPTADA',
      ruleCode: 'DEVOLUCION_UNICA_APROBADA',
      motivo: 'Identidad verificada presencialmente; pasaporte entregado y bloqueado contra segundas devoluciones.',
    },
    {
      id: 'aud-3',
      timestamp: '2026-11-10T17:15:00.000Z',
      actorRole: 'admin',
      operacion: 'Devolución de objeto OBJ-1003',
      entidad: 'Reclamo',
      resultado: 'ACEPTADA',
      ruleCode: 'DEVOLUCION_UNICA_APROBADA',
      motivo: 'Reclamo rec-2001 aprobado con factura #FAC-8821; 1 reclamo pendiente concurrente (rec-2002) fue rechazado automáticamente.',
    },
  ];

  return { categories, objects, claims, audit };
}

class CustodiaRepository {
  private data: DatabaseSnapshot;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSnapshot {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const seed = createSeedDatabase();
      this.persist(seed);
      return seed;
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSnapshot;
      if (
        !Array.isArray(parsed.categories) ||
        !Array.isArray(parsed.objects) ||
        !Array.isArray(parsed.claims) ||
        !Array.isArray(parsed.audit)
      ) {
        throw new Error('Invalid snapshot structure');
      }
      return parsed;
    } catch {
      const seed = createSeedDatabase();
      this.persist(seed);
      return seed;
    }
  }

  private persist(snapshot: DatabaseSnapshot = this.data): void {
    const tmpPath = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(snapshot, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_FILE);
  }

  private recordAudit(
    actorRole: UserRole,
    operacion: string,
    entidad: AuditEntry['entidad'],
    resultado: AuditEntry['resultado'],
    ruleCode: string,
    motivo: string
  ): void {
    const entry: AuditEntry = {
      id: `aud-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      actorRole,
      operacion,
      entidad,
      resultado,
      ruleCode,
      motivo,
    };
    this.data.audit.unshift(entry);
    if (this.data.audit.length > 100) {
      this.data.audit = this.data.audit.slice(0, 100);
    }
    this.persist();
  }

  public getDashboardMetrics(): DashboardMetrics {
    const pendientesRetiro = this.data.objects.filter((o) => o.estado === 'Pendiente de retiro').length;
    const devueltos = this.data.objects.filter((o) => o.estado === 'Devuelto').length;
    const reclamosAbiertos = this.data.claims.filter((c) => c.estado === 'Pendiente').length;
    const totalObjetos = this.data.objects.length;
    const tasaDevolucion = totalObjetos > 0 ? Math.round((devueltos / totalObjetos) * 100) : 0;

    const porCategoria = this.data.categories.map((cat) => {
      const catObjects = this.data.objects.filter((o) => o.categoriaId === cat.id);
      const pendientes = catObjects.filter((o) => o.estado === 'Pendiente de retiro').length;
      const catDevueltos = catObjects.filter((o) => o.estado === 'Devuelto').length;
      return {
        categoriaId: cat.id,
        nombre: cat.nombre,
        pendientes,
        devueltos: catDevueltos,
        total: catObjects.length,
      };
    });

    return {
      pendientesRetiro,
      devueltos,
      reclamosAbiertos,
      totalObjetos,
      totalCategorias: this.data.categories.length,
      tasaDevolucion,
      porCategoria,
    };
  }

  public listCategories(): CategoryView[] {
    return this.data.categories
      .map((cat) => {
        const linked = this.data.objects.filter((o) => o.categoriaId === cat.id);
        return {
          ...cat,
          objectCount: linked.length,
          pendientesCount: linked.filter((o) => o.estado === 'Pendiente de retiro').length,
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  public createCategory(
    input: { nombre?: string; descripcion?: string },
    actorRole: UserRole
  ): OperationResult<CategoryView> {
    const nombre = (input.nombre ?? '').trim();
    const descripcion = (input.descripcion ?? '').trim();

    if (nombre.length < 2) {
      const reason = 'El nombre de la categoría debe contener al menos 2 caracteres válidos.';
      this.recordAudit(actorRole, 'Alta de categoría', 'Categoría', 'RECHAZADA', 'CAT_NOMBRE_INVALIDO', reason);
      return {
        ok: false,
        ruleCode: 'CAT_NOMBRE_INVALIDO',
        message: 'Operación rechazada',
        reason,
      };
    }

    const exists = this.data.categories.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase());
    if (exists) {
      const reason = `Ya existe una categoría registrada con el nombre "${nombre}". No se permiten duplicados.`;
      this.recordAudit(actorRole, `Alta de categoría "${nombre}"`, 'Categoría', 'RECHAZADA', 'CAT_DUPLICADA', reason);
      return {
        ok: false,
        ruleCode: 'CAT_DUPLICADA',
        message: 'Operación rechazada',
        reason,
      };
    }

    const now = new Date().toISOString();
    const record: CategoryRecord = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      nombre,
      descripcion: descripcion || 'Sin descripción adicional.',
      createdAt: now,
      updatedAt: now,
    };
    this.data.categories.push(record);
    this.persist();

    const reason = `Se creó la categoría "${nombre}" (ID ${record.id}) con marca temporal ${now}.`;
    this.recordAudit(actorRole, `Alta de categoría "${nombre}"`, 'Categoría', 'ACEPTADA', 'CAT_CREADA', reason);
    return {
      ok: true,
      ruleCode: 'CAT_CREADA',
      message: 'Categoría registrada',
      reason,
      data: { ...record, objectCount: 0, pendientesCount: 0 },
    };
  }

  public updateCategory(
    id: string,
    input: { nombre?: string; descripcion?: string },
    actorRole: UserRole
  ): OperationResult<CategoryView> {
    const existing = this.data.categories.find((c) => c.id === id);
    if (!existing) {
      const reason = `No se encontró la categoría con identificador "${id}".`;
      this.recordAudit(actorRole, `Modificación de categoría ${id}`, 'Categoría', 'RECHAZADA', 'CAT_NO_ENCONTRADA', reason);
      return { ok: false, ruleCode: 'CAT_NO_ENCONTRADA', message: 'Operación rechazada', reason };
    }

    const nombre = (input.nombre ?? existing.nombre).trim();
    const descripcion = (input.descripcion ?? existing.descripcion).trim();

    if (nombre.length < 2) {
      const reason = 'El nombre de la categoría debe tener al menos 2 caracteres.';
      this.recordAudit(actorRole, `Modificación de categoría ${id}`, 'Categoría', 'RECHAZADA', 'CAT_NOMBRE_INVALIDO', reason);
      return { ok: false, ruleCode: 'CAT_NOMBRE_INVALIDO', message: 'Operación rechazada', reason };
    }

    const duplicate = this.data.categories.some(
      (c) => c.id !== id && c.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (duplicate) {
      const reason = `Otra categoría ya utiliza el nombre "${nombre}". Elija un nombre único.`;
      this.recordAudit(actorRole, `Modificación de categoría ${id}`, 'Categoría', 'RECHAZADA', 'CAT_DUPLICADA', reason);
      return { ok: false, ruleCode: 'CAT_DUPLICADA', message: 'Operación rechazada', reason };
    }

    existing.nombre = nombre;
    existing.descripcion = descripcion || existing.descripcion;
    existing.updatedAt = new Date().toISOString();
    this.persist();

    const linked = this.data.objects.filter((o) => o.categoriaId === existing.id);
    const reason = `Se actualizó la categoría "${existing.nombre}" (${linked.length} objetos vinculados conservan su relación).`;
    this.recordAudit(actorRole, `Modificación de categoría "${existing.nombre}"`, 'Categoría', 'ACEPTADA', 'CAT_ACTUALIZADA', reason);
    return {
      ok: true,
      ruleCode: 'CAT_ACTUALIZADA',
      message: 'Categoría actualizada',
      reason,
      data: {
        ...existing,
        objectCount: linked.length,
        pendientesCount: linked.filter((o) => o.estado === 'Pendiente de retiro').length,
      },
    };
  }

  public deleteCategory(id: string, actorRole: UserRole): OperationResult<{ id: string }> {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      const reason = `No existe ninguna categoría con identificador "${id}".`;
      this.recordAudit(actorRole, `Baja de categoría ${id}`, 'Categoría', 'RECHAZADA', 'CAT_NO_ENCONTRADA', reason);
      return { ok: false, ruleCode: 'CAT_NO_ENCONTRADA', message: 'Operación rechazada', reason };
    }

    const cat = this.data.categories[idx];
    const linkedObjects = this.data.objects.filter((o) => o.categoriaId === id);
    if (linkedObjects.length > 0) {
      const reason = `No es posible eliminar la categoría "${cat.nombre}" porque tiene ${linkedObjects.length} objeto(s) asociado(s). Reasigne los objetos antes de eliminarla.`;
      this.recordAudit(actorRole, `Baja de categoría "${cat.nombre}"`, 'Categoría', 'RECHAZADA', 'CAT_EN_USO', reason);
      return { ok: false, ruleCode: 'CAT_EN_USO', message: 'Operación rechazada', reason };
    }

    this.data.categories.splice(idx, 1);
    this.persist();

    const reason = `La categoría "${cat.nombre}" no poseía objetos vinculados y fue dada de baja correctamente.`;
    this.recordAudit(actorRole, `Baja de categoría "${cat.nombre}"`, 'Categoría', 'ACEPTADA', 'CAT_ELIMINADA', reason);
    return {
      ok: true,
      ruleCode: 'CAT_ELIMINADA',
      message: 'Categoría eliminada',
      reason,
      data: { id },
    };
  }

  private toObjectView(
    obj: FoundObjectRecord,
    role: UserRole
  ): FoundObjectPublicView | FoundObjectAdminView {
    const cat = this.data.categories.find((c) => c.id === obj.categoriaId);
    const reclamosAbiertosCount = this.data.claims.filter(
      (c) => c.objetoId === obj.id && c.estado === 'Pendiente'
    ).length;

    const publicView: FoundObjectPublicView = {
      id: obj.id,
      codigo: obj.codigo,
      descripcion: obj.descripcion,
      categoriaId: obj.categoriaId,
      categoriaNombre: cat ? cat.nombre : 'Sin categoría',
      lugar: obj.lugar,
      fecha: obj.fecha,
      estado: obj.estado,
      reclamosAbiertosCount,
      devueltoAt: obj.devueltoAt,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };

    if (role === 'admin') {
      const adminView: FoundObjectAdminView = {
        ...publicView,
        notasInternas: obj.notasInternas,
        reclamoGanadorId: obj.reclamoGanadorId,
      };
      return adminView;
    }

    return publicView;
  }

  public queryObjects(
    params: {
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
    },
    role: UserRole
  ): ObjectsQueryResponse {
    const q = (params.q ?? '').trim().toLowerCase();
    const categoriaId = (params.categoriaId ?? '').trim();
    const lugar = (params.lugar ?? '').trim().toLowerCase();
    const fechaDesde = (params.fechaDesde ?? '').trim();
    const fechaHasta = (params.fechaHasta ?? '').trim();
    const estado = (params.estado ?? '').trim();

    const availableLocations = Array.from(
      new Set(this.data.objects.map((o) => o.lugar))
    ).sort((a, b) => a.localeCompare(b, 'es'));

    let filtered = this.data.objects.map((o) => this.toObjectView(o, role));

    if (q) {
      filtered = filtered.filter(
        (o) =>
          o.codigo.toLowerCase().includes(q) ||
          o.descripcion.toLowerCase().includes(q) ||
          o.lugar.toLowerCase().includes(q) ||
          o.categoriaNombre.toLowerCase().includes(q)
      );
    }

    if (categoriaId && categoriaId !== 'all') {
      filtered = filtered.filter((o) => o.categoriaId === categoriaId);
    }

    if (lugar && lugar !== 'all') {
      filtered = filtered.filter((o) => o.lugar.toLowerCase() === lugar);
    }

    if (fechaDesde) {
      filtered = filtered.filter((o) => o.fecha >= fechaDesde);
    }

    if (fechaHasta) {
      filtered = filtered.filter((o) => o.fecha <= fechaHasta);
    }

    if (estado && estado !== 'all') {
      filtered = filtered.filter((o) => o.estado === estado);
    }

    const sortBy = params.sortBy || 'fecha';
    const sortDir = params.sortDir === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'codigo':
          return a.codigo.localeCompare(b.codigo, 'es') * sortDir;
        case 'descripcion':
          return a.descripcion.localeCompare(b.descripcion, 'es') * sortDir;
        case 'estado':
          return a.estado.localeCompare(b.estado, 'es') * sortDir;
        case 'updatedAt':
          return a.updatedAt.localeCompare(b.updatedAt) * sortDir;
        case 'fecha':
        default: {
          const dateCmp = a.fecha.localeCompare(b.fecha);
          if (dateCmp !== 0) return dateCmp * sortDir;
          return a.codigo.localeCompare(b.codigo, 'es') * sortDir;
        }
      }
    });

    const total = filtered.length;
    const pageSize = Math.min(Math.max(Number(params.pageSize) || 6, 1), 50);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(Number(params.page) || 1, 1), totalPages);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      availableLocations,
    };
  }

  public createObject(
    input: {
      codigo?: string;
      descripcion?: string;
      categoriaId?: string;
      lugar?: string;
      fecha?: string;
      estado?: ObjectStatus;
      notasInternas?: string;
    },
    actorRole: UserRole
  ): OperationResult<FoundObjectAdminView> {
    const codigo = (input.codigo ?? '').trim().toUpperCase();
    const descripcion = (input.descripcion ?? '').trim();
    const categoriaId = (input.categoriaId ?? '').trim();
    const lugar = (input.lugar ?? '').trim();
    const fecha = (input.fecha ?? '').trim();
    const notasInternas = (input.notasInternas ?? '').trim();

    if (!codigo || !descripcion || !categoriaId || !lugar || !fecha) {
      const reason = 'Todos los campos obligatorios (código, descripción, categoría, lugar y fecha) deben completarse.';
      this.recordAudit(actorRole, 'Alta de objeto', 'Objeto', 'RECHAZADA', 'OBJ_CAMPOS_INCOMPLETOS', reason);
      return { ok: false, ruleCode: 'OBJ_CAMPOS_INCOMPLETOS', message: 'Operación rechazada', reason };
    }

    if (input.estado === 'Devuelto') {
      const reason =
        'Un hallazgo nuevo no puede registrarse directamente como "Devuelto". Primero debe ingresar como "Pendiente de retiro" y devolverse tras un reclamo con comprobación verificada.';
      this.recordAudit(actorRole, `Alta de objeto ${codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_DEVOLUCION_DIRECTA_PROHIBIDA', reason);
      return {
        ok: false,
        ruleCode: 'OBJ_DEVOLUCION_DIRECTA_PROHIBIDA',
        message: 'Operación rechazada',
        reason,
      };
    }

    const cat = this.data.categories.find((c) => c.id === categoriaId);
    if (!cat) {
      const reason = `La categoría seleccionada ("${categoriaId}") no existe en el catálogo.`;
      this.recordAudit(actorRole, `Alta de objeto ${codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CATEGORIA_INVALIDA', reason);
      return { ok: false, ruleCode: 'OBJ_CATEGORIA_INVALIDA', message: 'Operación rechazada', reason };
    }

    const duplicate = this.data.objects.some((o) => o.codigo.toLowerCase() === codigo.toLowerCase());
    if (duplicate) {
      const reason = `El código "${codigo}" ya pertenece a otro objeto registrado. Cada hallazgo requiere un código único.`;
      this.recordAudit(actorRole, `Alta de objeto ${codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CODIGO_DUPLICADO', reason);
      return { ok: false, ruleCode: 'OBJ_CODIGO_DUPLICADO', message: 'Operación rechazada', reason };
    }

    const now = new Date().toISOString();
    const record: FoundObjectRecord = {
      id: `obj-${crypto.randomUUID().slice(0, 8)}`,
      codigo,
      descripcion,
      categoriaId,
      lugar,
      fecha,
      estado: 'Pendiente de retiro',
      notasInternas,
      devueltoAt: null,
      reclamoGanadorId: null,
      createdAt: now,
      updatedAt: now,
    };

    this.data.objects.push(record);
    this.persist();

    const reason = `Hallazgo ${codigo} registrado en categoría "${cat.nombre}" (lugar: ${lugar}) con estado inicial "Pendiente de retiro".`;
    this.recordAudit(actorRole, `Alta de objeto ${codigo}`, 'Objeto', 'ACEPTADA', 'OBJ_CREADO', reason);
    return {
      ok: true,
      ruleCode: 'OBJ_CREADO',
      message: 'Objeto registrado',
      reason,
      data: this.toObjectView(record, 'admin') as FoundObjectAdminView,
    };
  }

  public updateObject(
    id: string,
    input: {
      codigo?: string;
      descripcion?: string;
      categoriaId?: string;
      lugar?: string;
      fecha?: string;
      estado?: ObjectStatus;
      notasInternas?: string;
    },
    actorRole: UserRole
  ): OperationResult<FoundObjectAdminView> {
    const existing = this.data.objects.find((o) => o.id === id);
    if (!existing) {
      const reason = `No se encontró el objeto con identificador "${id}".`;
      this.recordAudit(actorRole, `Modificación de objeto ${id}`, 'Objeto', 'RECHAZADA', 'OBJ_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'OBJ_NO_ENCONTRADO', message: 'Operación rechazada', reason };
    }

    if (input.estado && input.estado !== existing.estado) {
      if (input.estado === 'Devuelto') {
        const reason =
          'No se permite marcar un objeto como "Devuelto" desde la edición directa. Debe aprobarse un reclamo con comprobación verificada en el módulo de Reclamos.';
        this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_REQUIERE_RECLAMO_VERIFICADO', reason);
        return {
          ok: false,
          ruleCode: 'OBJ_REQUIERE_RECLAMO_VERIFICADO',
          message: 'Operación rechazada',
          reason,
        };
      }
      if (existing.estado === 'Devuelto' && input.estado === 'Pendiente de retiro') {
        const reason = `El objeto ${existing.codigo} ya completó una devolución única y su estado histórico no puede revertirse a "Pendiente de retiro".`;
        this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_DEVOLUCION_INMUTABLE', reason);
        return {
          ok: false,
          ruleCode: 'OBJ_DEVOLUCION_INMUTABLE',
          message: 'Operación rechazada',
          reason,
        };
      }
    }

    const nextCodigo = (input.codigo ?? existing.codigo).trim().toUpperCase();
    if (existing.estado === 'Devuelto' && nextCodigo !== existing.codigo) {
      const reason = `El código del objeto ${existing.codigo} está bloqueado porque ya cuenta con una devolución formalizada.`;
      this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CODIGO_BLOQUEADO', reason);
      return { ok: false, ruleCode: 'OBJ_CODIGO_BLOQUEADO', message: 'Operación rechazada', reason };
    }

    const duplicate = this.data.objects.some(
      (o) => o.id !== id && o.codigo.toLowerCase() === nextCodigo.toLowerCase()
    );
    if (duplicate) {
      const reason = `Otro hallazgo ya tiene asignado el código "${nextCodigo}".`;
      this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CODIGO_DUPLICADO', reason);
      return { ok: false, ruleCode: 'OBJ_CODIGO_DUPLICADO', message: 'Operación rechazada', reason };
    }

    const nextCatId = (input.categoriaId ?? existing.categoriaId).trim();
    if (!this.data.categories.some((c) => c.id === nextCatId)) {
      const reason = `La categoría seleccionada ("${nextCatId}") no es válida.`;
      this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CATEGORIA_INVALIDA', reason);
      return { ok: false, ruleCode: 'OBJ_CATEGORIA_INVALIDA', message: 'Operación rechazada', reason };
    }

    existing.codigo = nextCodigo;
    existing.descripcion = (input.descripcion ?? existing.descripcion).trim();
    existing.categoriaId = nextCatId;
    existing.lugar = (input.lugar ?? existing.lugar).trim();
    existing.fecha = (input.fecha ?? existing.fecha).trim();
    existing.notasInternas = (input.notasInternas ?? existing.notasInternas).trim();
    existing.updatedAt = new Date().toISOString();
    this.persist();

    const reason = `Se actualizaron los metadatos del objeto ${existing.codigo} cumpliendo las reglas de integridad.`;
    this.recordAudit(actorRole, `Modificación de objeto ${existing.codigo}`, 'Objeto', 'ACEPTADA', 'OBJ_ACTUALIZADO', reason);
    return {
      ok: true,
      ruleCode: 'OBJ_ACTUALIZADO',
      message: 'Objeto actualizado',
      reason,
      data: this.toObjectView(existing, 'admin') as FoundObjectAdminView,
    };
  }

  public deleteObject(id: string, actorRole: UserRole): OperationResult<{ id: string }> {
    const idx = this.data.objects.findIndex((o) => o.id === id);
    if (idx === -1) {
      const reason = `No se encontró el objeto con identificador "${id}".`;
      this.recordAudit(actorRole, `Baja de objeto ${id}`, 'Objeto', 'RECHAZADA', 'OBJ_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'OBJ_NO_ENCONTRADO', message: 'Operación rechazada', reason };
    }

    const obj = this.data.objects[idx];
    if (obj.estado === 'Devuelto') {
      const reason = `No se permite eliminar el objeto ${obj.codigo} porque registra una devolución cerrada para trazabilidad y auditoría.`;
      this.recordAudit(actorRole, `Baja de objeto ${obj.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_DEVUELTO_PROTEGIDO', reason);
      return { ok: false, ruleCode: 'OBJ_DEVUELTO_PROTEGIDO', message: 'Operación rechazada', reason };
    }

    const linkedClaims = this.data.claims.filter((c) => c.objetoId === obj.id);
    if (linkedClaims.length > 0) {
      const reason = `El objeto ${obj.codigo} posee ${linkedClaims.length} reclamo(s) vinculado(s). Gestione o elimine los reclamos antes de darlo de baja.`;
      this.recordAudit(actorRole, `Baja de objeto ${obj.codigo}`, 'Objeto', 'RECHAZADA', 'OBJ_CON_RECLAMOS', reason);
      return { ok: false, ruleCode: 'OBJ_CON_RECLAMOS', message: 'Operación rechazada', reason };
    }

    this.data.objects.splice(idx, 1);
    this.persist();

    const reason = `El objeto ${obj.codigo} no presentaba reclamos ni devoluciones y fue eliminado del inventario.`;
    this.recordAudit(actorRole, `Baja de objeto ${obj.codigo}`, 'Objeto', 'ACEPTADA', 'OBJ_ELIMINADO', reason);
    return {
      ok: true,
      ruleCode: 'OBJ_ELIMINADO',
      message: 'Objeto eliminado',
      reason,
      data: { id },
    };
  }

  private toClaimView(claim: ClaimRecord): ClaimAdminView {
    const obj = this.data.objects.find((o) => o.id === claim.objetoId);
    return {
      ...claim,
      objetoCodigo: obj ? obj.codigo : 'Desconocido',
      objetoDescripcion: obj ? obj.descripcion : 'Objeto no disponible',
      objetoEstado: obj ? obj.estado : 'Pendiente de retiro',
    };
  }

  public listClaims(filters: { objetoId?: string; estado?: string; q?: string }): ClaimAdminView[] {
    const q = (filters.q ?? '').trim().toLowerCase();
    let result = this.data.claims.map((c) => this.toClaimView(c));

    if (filters.objetoId && filters.objetoId !== 'all') {
      result = result.filter((c) => c.objetoId === filters.objetoId);
    }

    if (filters.estado && filters.estado !== 'all') {
      result = result.filter((c) => c.estado === filters.estado);
    }

    if (q) {
      result = result.filter(
        (c) =>
          c.reclamanteFicticio.toLowerCase().includes(q) ||
          c.comprobacion.toLowerCase().includes(q) ||
          c.objetoCodigo.toLowerCase().includes(q) ||
          c.objetoDescripcion.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  public createClaim(
    input: {
      objetoId?: string;
      reclamanteFicticio?: string;
      comprobacion?: string;
      comprobacionVerificada?: boolean;
      fecha?: string;
    },
    actorRole: UserRole
  ): OperationResult<ClaimAdminView> {
    const objetoId = (input.objetoId ?? '').trim();
    const reclamanteFicticio = (input.reclamanteFicticio ?? '').trim();
    const comprobacion = (input.comprobacion ?? '').trim();
    const comprobacionVerificada = Boolean(input.comprobacionVerificada);
    const fecha = (input.fecha ?? '').trim();

    if (!objetoId || !reclamanteFicticio || !fecha) {
      const reason = 'Debe seleccionar un objeto, indicar el reclamante ficticio y especificar la fecha del reclamo.';
      this.recordAudit(actorRole, 'Alta de reclamo', 'Reclamo', 'RECHAZADA', 'REC_CAMPOS_INCOMPLETOS', reason);
      return { ok: false, ruleCode: 'REC_CAMPOS_INCOMPLETOS', message: 'Operación rechazada', reason };
    }

    const obj = this.data.objects.find((o) => o.id === objetoId);
    if (!obj) {
      const reason = `El objeto seleccionado ("${objetoId}") no existe.`;
      this.recordAudit(actorRole, 'Alta de reclamo', 'Reclamo', 'RECHAZADA', 'REC_OBJETO_INEXISTENTE', reason);
      return { ok: false, ruleCode: 'REC_OBJETO_INEXISTENTE', message: 'Operación rechazada', reason };
    }

    if (obj.estado === 'Devuelto') {
      const reason = `El objeto ${obj.codigo} ya fue devuelto anteriormente (${obj.devueltoAt ? obj.devueltoAt.slice(0, 10) : 'fecha registrada'}). No se admiten nuevos reclamos ni una segunda devolución.`;
      this.recordAudit(actorRole, `Alta de reclamo sobre ${obj.codigo}`, 'Reclamo', 'RECHAZADA', 'REC_OBJETO_YA_DEVUELTO', reason);
      return {
        ok: false,
        ruleCode: 'REC_OBJETO_YA_DEVUELTO',
        message: 'Operación rechazada',
        reason,
      };
    }

    if (comprobacionVerificada && comprobacion.length < 5) {
      const reason = 'Para marcar una comprobación como verificada debe describir primero la evidencia aportada (mínimo 5 caracteres).';
      this.recordAudit(actorRole, `Alta de reclamo sobre ${obj.codigo}`, 'Reclamo', 'RECHAZADA', 'REC_COMPROBACION_INSUFICIENTE', reason);
      return {
        ok: false,
        ruleCode: 'REC_COMPROBACION_INSUFICIENTE',
        message: 'Operación rechazada',
        reason,
      };
    }

    const existingPendingCount = this.data.claims.filter(
      (c) => c.objetoId === obj.id && c.estado === 'Pendiente'
    ).length;

    const now = new Date().toISOString();
    const record: ClaimRecord = {
      id: `rec-${crypto.randomUUID().slice(0, 8)}`,
      objetoId: obj.id,
      reclamanteFicticio,
      comprobacion: comprobacion || 'Sin comprobación adjunta todavía.',
      comprobacionVerificada,
      fecha,
      estado: 'Pendiente',
      motivoResolucion: comprobacionVerificada
        ? 'Comprobación verificada; habilitado para devolución única.'
        : 'Reclamo pendiente: exige comprobación verificada antes de devolver.',
      createdAt: now,
      updatedAt: now,
    };

    this.data.claims.push(record);
    this.persist();

    const reason =
      existingPendingCount > 0
        ? `Reclamo registrado para ${obj.codigo}. El objeto admite múltiples reclamos pendientes (ahora ${existingPendingCount + 1} abiertos), pero solo permitirá una única devolución.`
        : `Reclamo registrado en estado "Pendiente" para ${obj.codigo}. ${
            comprobacionVerificada
              ? 'Cuenta con comprobación verificada.'
              : 'Deberá verificarse la comprobación antes de devolver.'
          }`;
    this.recordAudit(actorRole, `Alta de reclamo sobre ${obj.codigo}`, 'Reclamo', 'ACEPTADA', 'REC_CREADO', reason);

    return {
      ok: true,
      ruleCode: 'REC_CREADO',
      message: 'Reclamo registrado',
      reason,
      data: this.toClaimView(record),
    };
  }

  public updateClaim(
    id: string,
    input: {
      reclamanteFicticio?: string;
      comprobacion?: string;
      comprobacionVerificada?: boolean;
      fecha?: string;
      estado?: ClaimStatus;
      motivoResolucion?: string;
    },
    actorRole: UserRole
  ): OperationResult<ClaimAdminView> {
    const claim = this.data.claims.find((c) => c.id === id);
    if (!claim) {
      const reason = `No se encontró el reclamo "${id}".`;
      this.recordAudit(actorRole, `Modificación de reclamo ${id}`, 'Reclamo', 'RECHAZADA', 'REC_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'REC_NO_ENCONTRADO', message: 'Operación rechazada', reason };
    }

    const obj = this.data.objects.find((o) => o.id === claim.objetoId);
    const codigo = obj ? obj.codigo : claim.objetoId;

    if (claim.estado === 'Aprobado') {
      const reason = `El reclamo ${claim.id} respalda la devolución única del objeto ${codigo} y no puede modificarse.`;
      this.recordAudit(actorRole, `Modificación de reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_APROBADO_INMUTABLE', reason);
      return { ok: false, ruleCode: 'REC_APROBADO_INMUTABLE', message: 'Operación rechazada', reason };
    }

    if (input.estado === 'Aprobado') {
      const reason = 'Para aprobar y ejecutar la devolución utilice la acción explícita "Aprobar y devolver", que valida la comprobación y bloquea segundas devoluciones.';
      this.recordAudit(actorRole, `Modificación de reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_USAR_ENDPOINT_DEVOLUCION', reason);
      return { ok: false, ruleCode: 'REC_USAR_ENDPOINT_DEVOLUCION', message: 'Operación rechazada', reason };
    }

    const nextComprobacion = (input.comprobacion ?? claim.comprobacion).trim();
    const nextVerificada =
      input.comprobacionVerificada !== undefined
        ? Boolean(input.comprobacionVerificada)
        : claim.comprobacionVerificada;

    if (nextVerificada && (nextComprobacion.length < 5 || nextComprobacion === 'Sin comprobación adjunta todavía.')) {
      const reason = 'No es posible validar la comprobación sin detallar la evidencia real (factura, serie, documento o seña particular verificable).';
      this.recordAudit(actorRole, `Validación de reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_COMPROBACION_INSUFICIENTE', reason);
      return { ok: false, ruleCode: 'REC_COMPROBACION_INSUFICIENTE', message: 'Operación rechazada', reason };
    }

    claim.reclamanteFicticio = (input.reclamanteFicticio ?? claim.reclamanteFicticio).trim();
    claim.comprobacion = nextComprobacion;
    claim.comprobacionVerificada = nextVerificada;
    claim.fecha = (input.fecha ?? claim.fecha).trim();
    if (input.estado === 'Rechazado') {
      claim.estado = 'Rechazado';
      claim.motivoResolucion =
        (input.motivoResolucion ?? '').trim() || 'Reclamo rechazado manualmente por el administrador.';
    } else if (input.estado === 'Pendiente') {
      if (obj && obj.estado === 'Devuelto') {
        const reason = `No se puede reabrir el reclamo ${claim.id} porque el objeto ${codigo} ya fue devuelto.`;
        this.recordAudit(actorRole, `Reapertura de reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_OBJETO_YA_DEVUELTO', reason);
        return { ok: false, ruleCode: 'REC_OBJETO_YA_DEVUELTO', message: 'Operación rechazada', reason };
      }
      claim.estado = 'Pendiente';
      claim.motivoResolucion = nextVerificada
        ? 'Comprobación verificada; habilitado para devolución única.'
        : 'Pendiente de comprobación verificada.';
    } else {
      claim.motivoResolucion = nextVerificada
        ? 'Comprobación verificada; listo para formalizar devolución.'
        : 'Pendiente de comprobación verificada.';
    }

    claim.updatedAt = new Date().toISOString();
    this.persist();

    const reason =
      claim.estado === 'Rechazado'
        ? `Reclamo ${claim.id} sobre ${codigo} marcado como "Rechazado".`
        : `Reclamo ${claim.id} actualizado (${nextVerificada ? 'comprobación verificada' : 'pendiente de comprobación'}).`;
    this.recordAudit(actorRole, `Modificación de reclamo ${claim.id}`, 'Reclamo', 'ACEPTADA', 'REC_ACTUALIZADO', reason);

    return {
      ok: true,
      ruleCode: 'REC_ACTUALIZADO',
      message: 'Reclamo actualizado',
      reason,
      data: this.toClaimView(claim),
    };
  }

  public executeReturn(claimId: string, actorRole: UserRole): OperationResult<ClaimAdminView> {
    const claim = this.data.claims.find((c) => c.id === claimId);
    if (!claim) {
      const reason = `No se encontró el reclamo "${claimId}".`;
      this.recordAudit(actorRole, `Devolución desde reclamo ${claimId}`, 'Reclamo', 'RECHAZADA', 'REC_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'REC_NO_ENCONTRADO', message: 'Devolución rechazada', reason };
    }

    const obj = this.data.objects.find((o) => o.id === claim.objetoId);
    if (!obj) {
      const reason = `El objeto asociado al reclamo ${claimId} no existe.`;
      this.recordAudit(actorRole, `Devolución desde reclamo ${claimId}`, 'Reclamo', 'RECHAZADA', 'OBJ_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'OBJ_NO_ENCONTRADO', message: 'Devolución rechazada', reason };
    }

    // Rule 1: Prevent returning the same object twice
    if (obj.estado === 'Devuelto') {
      const fechaDev = obj.devueltoAt ? obj.devueltoAt.slice(0, 10) : 'fecha previa';
      const reason = `El objeto ${obj.codigo} ya fue devuelto el ${fechaDev} (reclamo ganador ${obj.reclamoGanadorId}). Se impide devolver de nuevo el mismo objeto.`;
      this.recordAudit(actorRole, `Intento de segunda devolución (${obj.codigo})`, 'Reclamo', 'RECHAZADA', 'DEVOLUCION_DUPLICADA_BLOQUEADA', reason);
      return {
        ok: false,
        ruleCode: 'DEVOLUCION_DUPLICADA_BLOQUEADA',
        message: 'Devolución rechazada',
        reason,
      };
    }

    // Rule 2: Must be pending
    if (claim.estado !== 'Pendiente') {
      const reason = `El reclamo ${claim.id} está en estado "${claim.estado}". Solo se puede procesar una devolución desde un reclamo "Pendiente".`;
      this.recordAudit(actorRole, `Devolución desde reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_ESTADO_NO_PENDIENTE', reason);
      return {
        ok: false,
        ruleCode: 'REC_ESTADO_NO_PENDIENTE',
        message: 'Devolución rechazada',
        reason,
      };
    }

    // Rule 3: Require verified proof before returning
    const hasProofText =
      claim.comprobacion.trim().length >= 5 &&
      claim.comprobacion.trim() !== 'Sin comprobación adjunta todavía.';
    if (!claim.comprobacionVerificada || !hasProofText) {
      const reason = `Se exige comprobación verificada antes de devolver el objeto ${obj.codigo}. Registre la evidencia del reclamante y marque "Comprobación verificada" antes de reintentar.`;
      this.recordAudit(actorRole, `Devolución sin comprobación (${obj.codigo})`, 'Reclamo', 'RECHAZADA', 'COMPROBACION_REQUERIDA', reason);
      return {
        ok: false,
        ruleCode: 'COMPROBACION_REQUERIDA',
        message: 'Devolución rechazada',
        reason,
      };
    }

    // Execute unique return atomically
    const now = new Date().toISOString();
    claim.estado = 'Aprobado';
    claim.motivoResolucion = `Devolución única aprobada el ${now.slice(0, 10)} tras validar comprobación.`;
    claim.updatedAt = now;

    obj.estado = 'Devuelto';
    obj.devueltoAt = now;
    obj.reclamoGanadorId = claim.id;
    obj.updatedAt = now;

    // Automatically reject other pending claims on the same object
    let closedCompetingCount = 0;
    for (const other of this.data.claims) {
      if (other.objetoId === obj.id && other.id !== claim.id && other.estado === 'Pendiente') {
        other.estado = 'Rechazado';
        other.motivoResolucion = `Cerrado automáticamente: el objeto ${obj.codigo} fue devuelto al reclamo ${claim.id}.`;
        other.updatedAt = now;
        closedCompetingCount += 1;
      }
    }

    this.persist();

    const competingNote =
      closedCompetingCount > 0
        ? ` Se cerraron automáticamente ${closedCompetingCount} reclamo(s) pendiente(s) concurrente(s).`
        : '';
    const reason = `Devolución aceptada para ${obj.codigo} a favor de "${claim.reclamanteFicticio}" tras verificar la comprobación. El objeto queda bloqueado contra nuevas devoluciones.${competingNote}`;
    this.recordAudit(actorRole, `Devolución única de ${obj.codigo}`, 'Reclamo', 'ACEPTADA', 'DEVOLUCION_UNICA_APROBADA', reason);

    return {
      ok: true,
      ruleCode: 'DEVOLUCION_UNICA_APROBADA',
      message: 'Devolución formalizada',
      reason,
      data: this.toClaimView(claim),
    };
  }

  public deleteClaim(id: string, actorRole: UserRole): OperationResult<{ id: string }> {
    const idx = this.data.claims.findIndex((c) => c.id === id);
    if (idx === -1) {
      const reason = `No se encontró el reclamo "${id}".`;
      this.recordAudit(actorRole, `Baja de reclamo ${id}`, 'Reclamo', 'RECHAZADA', 'REC_NO_ENCONTRADO', reason);
      return { ok: false, ruleCode: 'REC_NO_ENCONTRADO', message: 'Operación rechazada', reason };
    }

    const claim = this.data.claims[idx];
    if (claim.estado === 'Aprobado') {
      const reason = `El reclamo ${claim.id} respalda una devolución aprobada y no puede eliminarse del historial.`;
      this.recordAudit(actorRole, `Baja de reclamo ${claim.id}`, 'Reclamo', 'RECHAZADA', 'REC_APROBADO_PROTEGIDO', reason);
      return { ok: false, ruleCode: 'REC_APROBADO_PROTEGIDO', message: 'Operación rechazada', reason };
    }

    this.data.claims.splice(idx, 1);
    this.persist();

    const reason = `El reclamo ${claim.id} (${claim.estado}) fue eliminado correctamente.`;
    this.recordAudit(actorRole, `Baja de reclamo ${claim.id}`, 'Reclamo', 'ACEPTADA', 'REC_ELIMINADO', reason);
    return {
      ok: true,
      ruleCode: 'REC_ELIMINADO',
      message: 'Reclamo eliminado',
      reason,
      data: { id },
    };
  }

  public listAudit(limit = 30): AuditEntry[] {
    return this.data.audit.slice(0, limit);
  }
}

export const repository = new CustodiaRepository();
