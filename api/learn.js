'use strict';

const { listMissionsForClient, findMission } = require('./learn-missions');

const db = require('./db');

function requireLearner(req, res, next) {
  if (req.auth?.role !== 'learner' || !req.auth?.tenantId) {
    return res.status(403).json({ error: 'Esta ruta solo está disponible para alumnos registrados.' });
  }
  return next();
}

async function getProgressMap(learnerId) {
  const rows = await Promise.resolve(db.listLearningProgress(learnerId));
  const progress = {};

  for (const row of rows) {
    if (!progress[row.mission_id]) {
      progress[row.mission_id] = {};
    }
    progress[row.mission_id][row.step_id] = row.completed_at;
  }

  return progress;
}

async function markStepComplete(learnerId, missionId, stepId) {
  await Promise.resolve(db.upsertLearningProgress(learnerId, missionId, stepId));
}

async function runStepCheck(req, missionId, stepId) {
  const learnerId = req.auth.sub;
  const tenantId = req.auth.tenantId;

  switch (`${missionId}:${stepId}`) {
    case 'connect:session':
      return req.auth.role === 'learner';
    case 'connect:health':
      return true;
    case 'json:meta':
      return true;
    case 'json:users': {
      const users = await Promise.resolve(db.getAllUsers(tenantId));
      return users.length > 0;
    }
    case 'crud:create': {
      const learner = await Promise.resolve(db.findLearnerById(learnerId));
      if (!learner) {
        return false;
      }
      const users = await Promise.resolve(db.getAllUsers(tenantId));
      return users.length > learner.seeded_user_count;
    }
    default:
      return false;
  }
}

async function missionsHandler(req, res) {
  const progress = await getProgressMap(req.auth.sub);
  const missions = listMissionsForClient().map((mission) => ({
    ...mission,
    steps: mission.steps.map((step) => ({
      ...step,
      completed: Boolean(progress[mission.id]?.[step.id])
    }))
  }));

  res.json({
    tenantSlug: req.auth.tenantSlug,
    sandboxPath: `/lab/${req.auth.tenantSlug}/`,
    missions
  });
}

async function checkStepHandler(req, res) {
  const { missionId, stepId } = req.params;
  const mission = findMission(missionId);

  if (!mission || !mission.steps.some((step) => step.id === stepId)) {
    return res.status(404).json({ error: 'Paso de misión no encontrado.' });
  }

  const passed = await runStepCheck(req, missionId, stepId);

  if (!passed) {
    return res.status(400).json({
      error: 'El paso aún no se cumple. Sigue las instrucciones e inténtalo de nuevo.',
      missionId,
      stepId,
      passed: false
    });
  }

  await markStepComplete(req.auth.sub, missionId, stepId);

  return res.json({
    message: 'Paso completado.',
    missionId,
    stepId,
    passed: true
  });
}

module.exports = {
  requireLearner,
  missionsHandler,
  checkStepHandler
};
