'use strict';

const MISSIONS = [
  {
    id: 'connect',
    title: 'Conecta con tu sandbox',
    summary: 'Comprueba que tu sesión de alumno y la API responden.',
    steps: [
      { id: 'session', title: 'Sesión de alumno activa' },
      { id: 'health', title: 'GET /health responde correctamente' }
    ]
  },
  {
    id: 'json',
    title: 'Explora JSON',
    summary: 'Lee metadatos de la API y la lista de usuarios de tu sandbox.',
    steps: [
      { id: 'meta', title: 'GET / devuelve versión y endpoints' },
      { id: 'users', title: 'GET /users muestra datos de tu tenant' }
    ]
  },
  {
    id: 'crud',
    title: 'Crea un usuario',
    summary: 'Usa el formulario CRUD para añadir un usuario nuevo en tu sandbox.',
    steps: [
      { id: 'create', title: 'POST /users — al menos un usuario creado por ti' }
    ]
  }
];

function listMissionsForClient() {
  return MISSIONS.map(({ id, title, summary, steps }) => ({
    id,
    title,
    summary,
    steps: steps.map((step) => ({ id: step.id, title: step.title }))
  }));
}

function findMission(missionId) {
  return MISSIONS.find((mission) => mission.id === missionId) || null;
}

module.exports = {
  MISSIONS,
  listMissionsForClient,
  findMission
};
