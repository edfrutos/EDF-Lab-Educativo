'use strict';

const backend = process.env.DATABASE_URL
  ? require('./db-pg')
  : require('./db-sqlite');

module.exports = {
  DuplicateEmailError: backend.DuplicateEmailError,
  DuplicateLearnerEmailError: backend.DuplicateLearnerEmailError,
  initDb: backend.initDb,
  getAllUsers: backend.getAllUsers,
  getUserById: backend.getUserById,
  createUser: backend.createUser,
  updateUser: backend.updateUser,
  deleteUser: backend.deleteUser,
  findLearnerByEmail: backend.findLearnerByEmail,
  findLearnerById: backend.findLearnerById,
  registerLearnerAccount: backend.registerLearnerAccount,
  listLearningProgress: backend.listLearningProgress,
  upsertLearningProgress: backend.upsertLearningProgress
};
