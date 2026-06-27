'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const COOKIE_NAME = 'edf_session';
const REFRESH_COOKIE_NAME = 'edf_refresh';
const OAUTH_STATE_COOKIE_NAME = 'edf_oauth_state';
const DEFAULT_ADMIN_EMAIL = 'admin@lab.local';
const DEFAULT_CORS_ORIGINS =
  'http://localhost:5173,http://localhost:5174,http://localhost:5175,' +
  'http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175';
const DEFAULT_JWT_EXPIRES_IN = '24h';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const OAUTH_STATE_COOKIE_MAX_AGE_MS = 5 * 60 * 1000;

const accountsDb = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

const {
  registerLearnerAccount,
  findLearnerByEmail,
  DuplicateLearnerEmailError
} = require('./db');

const FATAL_JWT_SECRET_MESSAGE =
  '[fatal] JWT_SECRET es obligatorio cuando NODE_ENV=production. Copia api/.env.example a api/.env y define una clave larga.';

function getJwtSecret() {
  if (process.env.JWT_SECRET?.trim()) {
    return process.env.JWT_SECRET.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    console.error(FATAL_JWT_SECRET_MESSAGE);
    process.exit(1);
  }
  console.warn('[auth] JWT_SECRET no definido — usando valor solo para desarrollo local');
  return 'dev-only-change-in-production';
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS
  };
}

function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS
  };
}

function getOAuthStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE_MS
  };
}

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS;
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function signSessionToken(principal) {
  const payload = {
    sub: principal.id,
    email: principal.email,
    role: principal.role || 'operator'
  };

  if (principal.tenantId) {
    payload.tenantId = principal.tenantId;
  }
  if (principal.tenantSlug) {
    payload.tenantSlug = principal.tenantSlug;
  }

  return jwt.sign(
    payload,
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN }
  );
}

function verifySessionToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function requireAuth(req, res, next) {
  if (process.env.AUTH_DISABLED === '1') {
    return next();
  }

  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Sesión no válida o expirada. Inicia sesión.' });
  }

  try {
    req.auth = verifySessionToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión no válida o expirada. Inicia sesión.' });
  }
}

function signRefreshToken(account) {
  return jwt.sign(
    { sub: account.id, type: 'refresh', jti: crypto.randomUUID() },
    getJwtSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function persistRefreshToken(accountId, refreshToken) {
  await Promise.resolve(accountsDb.upsertRefreshToken(accountId, hashRefreshToken(refreshToken)));
}

function clearAuthCookies(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}

function issueSessionCookies(res, account) {
  const sessionToken = signSessionToken({
    id: account.id,
    email: account.email,
    role: 'operator'
  });
  const refreshToken = signRefreshToken(account);
  return persistRefreshToken(account.id, refreshToken).then(() => {
    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  });
}

function issueLearnerSession(res, learner) {
  const sessionToken = signSessionToken({
    id: learner.id,
    email: learner.email,
    role: 'learner',
    tenantId: learner.tenant_id,
    tenantSlug: learner.tenant_slug
  });
  res.cookie(COOKIE_NAME, sessionToken, getCookieOptions());
}

function buildTenantSlug(email) {
  const base = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20) || 'alumno';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

function buildSandboxRedirect(tenantSlug) {
  return {
    sandboxPath: `/lab/${tenantSlug}/`,
    sandboxQuery: `/?sandbox=${encodeURIComponent(tenantSlug)}`
  };
}

async function registerHandler(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || email.trim() === '' || typeof password !== 'string' || password === '') {
    return res.status(400).json({ error: 'Los campos "email" y "password" son obligatorios.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingOperator = await Promise.resolve(accountsDb.findAccountByEmail(normalizedEmail));
  const existingLearner = await Promise.resolve(findLearnerByEmail(normalizedEmail));
  if (existingOperator || existingLearner) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email.' });
  }

  const tenantId = crypto.randomUUID();
  const tenantSlug = buildTenantSlug(normalizedEmail);
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const learner = await registerLearnerAccount(normalizedEmail, passwordHash, tenantId, tenantSlug);
    issueLearnerSession(res, learner);
    const redirect = buildSandboxRedirect(tenantSlug);
    return res.status(201).json({
      message: 'Cuenta de alumno creada. Redirigiendo a tu sandbox.',
      email: learner.email,
      role: 'learner',
      tenantSlug: learner.tenant_slug,
      ...redirect
    });
  } catch (err) {
    if (err instanceof DuplicateLearnerEmailError) {
      return res.status(409).json({ error: err.message });
    }
    console.error('[error] registerLearnerAccount:', err.message);
    return res.status(500).json({ error: 'No se pudo crear la cuenta de alumno.' });
  }
}

async function meHandler(req, res) {
  const role = req.auth.role || 'operator';
  const body = {
    email: req.auth.email,
    role
  };

  if (role === 'learner' && req.auth.tenantSlug) {
    const redirect = buildSandboxRedirect(req.auth.tenantSlug);
    body.tenantSlug = req.auth.tenantSlug;
    body.tenantId = req.auth.tenantId;
    Object.assign(body, redirect);
  }

  return res.json(body);
}

async function loginHandler(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || email.trim() === '' || typeof password !== 'string' || password === '') {
    return res.status(400).json({ error: 'Los campos "email" y "password" son obligatorios.' });
  }

  const normalizedEmail = email.trim();
  const account = await Promise.resolve(accountsDb.findAccountByEmail(normalizedEmail));
  if (account) {
    const passwordMatches = await bcrypt.compare(password, account.password_hash);
    if (!passwordMatches) {
      return res.status(403).json({ error: 'Credenciales inválidas' });
    }

    await issueSessionCookies(res, account);
    return res.json({ message: 'Sesión iniciada', email: account.email, role: 'operator' });
  }

  const learner = await Promise.resolve(findLearnerByEmail(normalizedEmail.toLowerCase()));
  if (!learner) {
    return res.status(403).json({ error: 'Credenciales inválidas' });
  }

  const learnerPasswordMatches = await bcrypt.compare(password, learner.password_hash);
  if (!learnerPasswordMatches) {
    return res.status(403).json({ error: 'Credenciales inválidas' });
  }

  issueLearnerSession(res, learner);
  const redirect = buildSandboxRedirect(learner.tenant_slug);
  return res.json({
    message: 'Sesión iniciada',
    email: learner.email,
    role: 'learner',
    tenantSlug: learner.tenant_slug,
    ...redirect
  });
}

async function changePasswordHandler(req, res) {
  if (req.auth?.role === 'learner') {
    return res.status(403).json({ error: 'Los alumnos no pueden cambiar contraseña desde este endpoint en v3.0a.' });
  }

  const accountId = Number(req.auth?.sub);
  if (!Number.isInteger(accountId) || accountId <= 0) {
    return res.status(401).json({ error: 'Sesión no válida o expirada. Inicia sesión.' });
  }

  const { currentPassword, newPassword } = req.body || {};
  if (
    typeof currentPassword !== 'string'
    || currentPassword === ''
    || typeof newPassword !== 'string'
    || newPassword === ''
  ) {
    return res.status(400).json({
      error: 'Los campos "currentPassword" y "newPassword" son obligatorios.'
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      error: 'La nueva contraseña debe tener al menos 8 caracteres.'
    });
  }

  const account = await Promise.resolve(accountsDb.findAccountById(accountId));
  if (!account) {
    return res.status(401).json({ error: 'Sesión no válida o expirada. Inicia sesión.' });
  }

  const currentPasswordMatches = await bcrypt.compare(currentPassword, account.password_hash);
  if (!currentPasswordMatches) {
    return res.status(403).json({ error: 'La contraseña actual es incorrecta.' });
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await Promise.resolve(accountsDb.updateAccountPassword(accountId, newPasswordHash));
  await Promise.resolve(accountsDb.deleteRefreshTokenByAccountId(accountId));

  return res.json({ message: 'Contraseña actualizada correctamente.' });
}

async function refreshHandler(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  if (payload.type !== 'refresh') {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  const accountId = Number(payload.sub);
  if (!Number.isInteger(accountId) || accountId <= 0) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  const storedHash = await Promise.resolve(accountsDb.getRefreshTokenHashByAccountId(accountId));
  const incomingHash = hashRefreshToken(refreshToken);
  if (!storedHash || storedHash !== incomingHash) {
    await Promise.resolve(accountsDb.deleteRefreshTokenByAccountId(accountId));
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  const account = await Promise.resolve(accountsDb.findAccountById(accountId));
  if (!account) {
    await Promise.resolve(accountsDb.deleteRefreshTokenByAccountId(accountId));
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Refresh token no válido o expirado. Inicia sesión.' });
  }

  await issueSessionCookies(res, account);
  return res.json({ message: 'Sesión renovada' });
}

function oauthStartHandler(req, res) {
  const provider = (req.query.provider || 'mock').toString();
  if (provider !== 'mock') {
    return res.status(400).json({ error: 'Proveedor OAuth no soportado en este laboratorio.' });
  }

  const state = crypto.randomUUID();
  res.cookie(OAUTH_STATE_COOKIE_NAME, state, getOAuthStateCookieOptions());
  return res.json({
    provider,
    state,
    authUrl: `/auth/oauth/callback?provider=mock&code=mock-admin&state=${encodeURIComponent(state)}`
  });
}

async function oauthCallbackHandler(req, res) {
  const provider = (req.query.provider || 'mock').toString();
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const expectedState = req.cookies[OAUTH_STATE_COOKIE_NAME];

  if (provider !== 'mock') {
    return res.status(400).json({ error: 'Proveedor OAuth no soportado en este laboratorio.' });
  }
  if (!expectedState || !state || state !== expectedState) {
    return res.status(400).json({ error: 'State OAuth inválido o ausente.' });
  }
  if (code !== 'mock-admin') {
    return res.status(403).json({ error: 'Código OAuth inválido.' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
  const account = await Promise.resolve(accountsDb.findAccountByEmail(adminEmail));
  if (!account) {
    return res.status(404).json({ error: 'Cuenta operador no disponible para OAuth mock.' });
  }

  await issueSessionCookies(res, account);
  res.clearCookie(OAUTH_STATE_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({ message: 'Sesión iniciada con OAuth mock', email: account.email });
}

async function logoutHandler(req, res) {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const accountId = Number(payload?.sub);
      if (Number.isInteger(accountId) && accountId > 0) {
        await Promise.resolve(accountsDb.deleteRefreshTokenByAccountId(accountId));
      }
    } catch {
      // Logout debe ser idempotente: limpiar cookies aunque el refresh no sea válido.
    }
  }
  clearAuthCookies(res);
  return res.json({ message: 'Sesión cerrada' });
}

function createLoginRateLimiter() {
  const windowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  const max = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10;
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      res.status(429).json({
        error: 'Demasiados intentos de inicio de sesión. Espera un momento e inténtalo de nuevo.'
      });
    }
  });
}

module.exports = {
  COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  getAllowedOrigins,
  getCookieOptions,
  getRefreshCookieOptions,
  getOAuthStateCookieOptions,
  requireAuth,
  registerHandler,
  meHandler,
  loginHandler,
  changePasswordHandler,
  refreshHandler,
  oauthStartHandler,
  oauthCallbackHandler,
  logoutHandler,
  createLoginRateLimiter
};
