# Puesta en marcha

## Prerrequisitos

Antes de arrancar el laboratorio, asegúrate de tener:

- Node.js y npm disponibles para ejecutar la API,
- Python 3 disponible para servir el dashboard estático,
- el puerto `3100` libre para la API,
- el puerto `5173` libre para el dashboard.

## 1. Arrancar API

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
PORT=3100 npm start
```

Si acabas de copiar el proyecto y faltan dependencias en `api/`, ejecuta antes:

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/api
npm install
```

## 2. Arrancar dashboard

```bash
cd /Users/edefrutos/Desktop/EDF-Lab-Educativo/dashboard
python3 -m http.server 5173
```

## 3. Verificar que la API responde

En otra terminal puedes comprobar el endpoint de salud:

```bash
curl http://localhost:3100/health
```

Resultado esperado:

```json
{"status":"healthy","timestamp":"..."}
```

## 4. Abrir navegador

```txt
http://localhost:5173
```

## 5. Comprobaciones visuales

El dashboard debe mostrar:

- API conectada,
- estado `healthy`,
- versión `1.0.0`,
- tabla de usuarios.

## Si algo falla

Revisa después:

1. [`06-debugging.md`](./06-debugging.md) para errores de puertos o procesos.
2. [`05-cors-explicado.md`](./05-cors-explicado.md) si el navegador bloquea las peticiones.
3. [`01-arquitectura.md`](./01-arquitectura.md) si necesitas recordar el flujo entre frontend y backend.
