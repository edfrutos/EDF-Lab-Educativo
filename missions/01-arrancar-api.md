# Misión 01: arrancar la API

## Objetivo

Arrancar el backend Express y comprobar que responde.

## Pasos

```bash
cd api
PORT=3100 npm start
```

Abre:

```txt
http://localhost:3100/health
```

## Resultado esperado

```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

## Reto extra

Arranca la API en otro puerto usando `PORT=3200`.
