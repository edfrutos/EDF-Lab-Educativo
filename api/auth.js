'use strict';

const jwt = require('jsonwebtoken');

const TOKEN_EXPIRES_IN_SECONDS = 3600;

function isAuthEnabled() {
  return process.env.AUTH_ENABLED === 'true';
}

function validateAuthConfig() {
  if (!isAuthEnabled()) {
    return;
  }

  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.AUTH_USER) missing.push('AUTH_USER');
  if (!process.env.AUTH_PASSWORD) missing.push('AUTH_PASSWORD');

  if (missing.length > 0) {
    throw new Error(
      `AUTH_ENABLED=true pero faltan variables de entorno: ${missing.join(', ')}. ` +
        'Consulta api/.env.example.'
    );
  }
}

function signToken(username) {
  return jwt.sign({ sub: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function loginHandler(req, res) {
  if (!isAuthEnabled()) {
    return res.status(404).json({
      error: 'La autenticación no está activada (AUTH_ENABLED=false).'
    });
  }

  const { username, password } = req.body ?? {};

  if (typeof username !== 'string' || username.trim() === '') {
    return res.status(400).json({ error: 'El campo "username" es obligatorio.' });
  }

  if (typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'El campo "password" es obligatorio.' });
  }

  if (username !== process.env.AUTH_USER || password !== process.env.AUTH_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }

  const token = signToken(username);
  return res.status(200).json({ token, expiresIn: TOKEN_EXPIRES_IN_SECONDS });
}

function requireAuth(req, res, next) {
  if (!isAuthEnabled()) {
    return next();
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyToken(token);
    req.user = { username: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o caducado.' });
  }
}

module.exports = {
  isAuthEnabled,
  validateAuthConfig,
  signToken,
  verifyToken,
  loginHandler,
  requireAuth,
  TOKEN_EXPIRES_IN_SECONDS
};
