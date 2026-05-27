# Debugging

Problemas habituales y cómo diagnosticarlos.

## Puerto ocupado

Síntoma:

```txt
EADDRINUSE
```

Diagnóstico:

```bash
lsof -nP -iTCP:3100 -sTCP:LISTEN
```

## API apagada

Síntoma:

El dashboard muestra error de conexión.

Solución:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

## Node incorrecto

Diagnóstico:

```bash
which node
which npm
node --version
npm --version
```

Debe apuntar a `~/.nvm/versions/node/...`.
