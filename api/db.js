'use strict';

const backend = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

module.exports = {
  DuplicateEmailError: backend.DuplicateEmailError,
  initDb: backend.initDb,
  getAllUsers: backend.getAllUsers,
  getUserById: backend.getUserById,
  createUser: backend.createUser,
  updateUser: backend.updateUser,
  deleteUser: backend.deleteUser,
};
