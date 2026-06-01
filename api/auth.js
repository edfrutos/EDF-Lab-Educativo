'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'edf_session';
const DEFAULT_CORS_ORIGINS = 'http://localhost:5173,http://localhost:5174,http://localhost:5175';
const DEFAULT_JWT_EXPIRES_IN = '24h';
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const accountsDb = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
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
  res.cookie(COOKIE_NAME, token, getCookieOptions());
  return res.json({ message: 'Sesión iniciada', email: account.email });
}

function logoutHandler(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({ message: 'Sesión cerrada' });
}

module.exports = {
  COOKIE_NAME,
  getAllowedOrigins,
  getCookieOptions,
  requireAuth,
  loginHandler,
  logoutHandler
};
