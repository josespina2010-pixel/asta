import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { repository } from './server/repository.ts';
import type { UserRole } from './src/types/custodia.ts';

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY || 'CUSTODIA-ADMIN-2026';
const TOKEN_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface SessionPayload {
  role: UserRole;
  issuedAt: number;
}

interface AuthedRequest extends Request {
  userRole?: UserRole;
}

function signToken(role: UserRole): string {
  const payload: SessionPayload = { role, issuedAt: Date.now() };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as SessionPayload;
    if (parsed.role === 'admin' || parsed.role === 'consulta') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function attachRole(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    const verified = verifyToken(token);
    if (verified) {
      req.userRole = verified.role;
      next();
      return;
    }
  }
  req.userRole = 'consulta';
  next();
}

function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      ok: false,
      ruleCode: 'AUTORIZACION_DENEGADA',
      message: 'Acceso denegado',
      reason:
        'Operación rechazada (403): El usuario de consulta solo está autorizado para revisar información pública aprobada y no puede ver datos de reclamantes ni ejecutar cambios administrativos.',
    });
    return;
  }
  next();
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use(attachRole);

  // Health & Web Service Contract Discovery
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      service: 'Áurea Custodia API',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /api/dashboard',
        'GET /api/categories',
        'POST|PUT|DELETE /api/categories',
        'GET /api/objects',
        'POST|PUT|DELETE /api/objects',
        'GET|POST|PUT|DELETE /api/claims (Admin)',
        'POST /api/claims/:id/return (Admin)',
        'GET /api/audit (Admin)',
      ],
    });
  });

  // Authentication & Role Switch
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const requestedRole = req.body?.role === 'admin' ? 'admin' : 'consulta';
    if (requestedRole === 'admin') {
      const accessKey = String(req.body?.accessKey ?? '').trim();
      if (accessKey !== ADMIN_ACCESS_KEY) {
        res.status(401).json({
          ok: false,
          ruleCode: 'CREDENCIAL_ADMIN_INVALIDA',
          message: 'Autenticación rechazada',
          reason:
            'La clave de acceso administrativo es incorrecta. El usuario permanece en modo Consulta autorizada.',
        });
        return;
      }
      const token = signToken('admin');
      res.json({
        ok: true,
        ruleCode: 'SESION_ADMIN_ACTIVA',
        message: 'Sesión administrativa iniciada',
        reason:
          'Acceso concedido como Administrador. Habilitado para operar altas, modificaciones, bajas, reclamos y devoluciones.',
        data: { role: 'admin', token },
      });
      return;
    }

    const token = signToken('consulta');
    res.json({
      ok: true,
      ruleCode: 'SESION_CONSULTA_ACTIVA',
      message: 'Modo Consulta activo',
      reason:
        'Sesión establecida como Usuario de Consulta. Solo se expone información autorizada sin datos privados de reclamantes.',
      data: { role: 'consulta', token },
    });
  });

  app.get('/api/auth/session', (req: AuthedRequest, res: Response) => {
    const role: UserRole = req.userRole ?? 'consulta';
    res.json({
      ok: true,
      data: {
        role,
        permissions:
          role === 'admin'
            ? ['dashboard:read', 'categories:write', 'objects:write', 'claims:read', 'claims:write', 'returns:execute', 'audit:read']
            : ['dashboard:read', 'categories:read', 'objects:public_read'],
      },
    });
  });

  // Dashboard
  app.get('/api/dashboard', (_req: Request, res: Response) => {
    res.json({ ok: true, data: repository.getDashboardMetrics() });
  });

  // Categories
  app.get('/api/categories', (_req: Request, res: Response) => {
    res.json({ ok: true, data: repository.listCategories() });
  });

  app.post('/api/categories', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.createCategory(req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 201 : 400).json(result);
  });

  app.put('/api/categories/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.updateCategory(String(req.params.id), req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 400).json(result);
  });

  app.delete('/api/categories/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.deleteCategory(String(req.params.id), req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 409).json(result);
  });

  // Objects (Combined search + filters + sorting + pagination, with RBAC projection)
  app.get('/api/objects', (req: AuthedRequest, res: Response) => {
    const role: UserRole = req.userRole ?? 'consulta';
    const data = repository.queryObjects(
      {
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        categoriaId: typeof req.query.categoriaId === 'string' ? req.query.categoriaId : undefined,
        lugar: typeof req.query.lugar === 'string' ? req.query.lugar : undefined,
        fechaDesde: typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : undefined,
        fechaHasta: typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : undefined,
        estado: typeof req.query.estado === 'string' ? req.query.estado : undefined,
        sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined,
        sortDir: typeof req.query.sortDir === 'string' ? req.query.sortDir : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : 6,
      },
      role
    );
    res.json({ ok: true, role, data });
  });

  app.post('/api/objects', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.createObject(req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 201 : 400).json(result);
  });

  app.put('/api/objects/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.updateObject(String(req.params.id), req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 400).json(result);
  });

  app.delete('/api/objects/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.deleteObject(String(req.params.id), req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 409).json(result);
  });

  // Claims (Admin ONLY — Consulta users receive HTTP 403)
  app.get('/api/claims', requireAdmin, (req: Request, res: Response) => {
    const data = repository.listClaims({
      objetoId: typeof req.query.objetoId === 'string' ? req.query.objetoId : undefined,
      estado: typeof req.query.estado === 'string' ? req.query.estado : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
    });
    res.json({ ok: true, data });
  });

  app.post('/api/claims', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.createClaim(req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 201 : 400).json(result);
  });

  app.put('/api/claims/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.updateClaim(String(req.params.id), req.body ?? {}, req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 400).json(result);
  });

  app.post('/api/claims/:id/return', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.executeReturn(String(req.params.id), req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 409).json(result);
  });

  app.delete('/api/claims/:id', requireAdmin, (req: AuthedRequest, res: Response) => {
    const result = repository.deleteClaim(String(req.params.id), req.userRole ?? 'admin');
    res.status(result.ok ? 200 : 409).json(result);
  });

  // Audit Log (Admin ONLY)
  app.get('/api/audit', requireAdmin, (_req: Request, res: Response) => {
    res.json({ ok: true, data: repository.listAudit(40) });
  });

  // Serve Frontend via Vite (dev) or static dist/ (prod)
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.npm_lifecycle_event === 'start' && fs.existsSync(distPath)) ||
    process.argv.includes('--prod');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Áurea Custodia Web Service listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
