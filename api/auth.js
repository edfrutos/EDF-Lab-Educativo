'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const COOKIE_NAME = 'edf_session';
const REFRESH_COOKIE_NAME = 'edf_refresh';
const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,http://localhost:5174,http://localhost:5175';
const DEFAULT_JWT_EXPIRES_IN = '24h';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const accountsDb = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

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

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS;
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function signSessionToken(account) {
  return jwt.sign(
    { sub: account.id, email: account.email },
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
}

async function loginHandler(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || email.trim() === '' || typeof password !== 'string' || password === '') {
    return res.status(400).json({ error: 'Los campos "email" y "password" son obligatorios.' });
  }

  const account = await Promise.resolve(accountsDb.findAccountByEmail(email.trim()));
  if (!account) {
    return res.status(403).json({ error: 'Credenciales inválidas' });
  }

  const passwordMatches = await bcrypt.compare(password, account.password_hash);
  if (!passwordMatches) {
    return res.status(403).json({ error: 'Credenciales inválidas' });
  }

  const token = signSessionToken(account);
  const refreshToken = signRefreshToken(account);
  await persistRefreshToken(account.id, refreshToken);
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  return res.json({ message: 'Sesión iniciada', email: account.email });
}

async function changePasswordHandler(req, res) {
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

  const nextSessionToken = signSessionToken(account);
  const nextRefreshToken = signRefreshToken(account);
  await persistRefreshToken(account.id, nextRefreshToken);

  res.cookie(COOKIE_NAME, nextSessionToken, getCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, nextRefreshToken, getRefreshCookieOptions());
  return res.json({ message: 'Sesión renovada' });
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
  getAllowedOrigins,
  getCookieOptions,
  getRefreshCookieOptions,
  requireAuth,
  loginHandler,
  changePasswordHandler,
  refreshHandler,
  logoutHandler,
  createLoginRateLimiter
};
