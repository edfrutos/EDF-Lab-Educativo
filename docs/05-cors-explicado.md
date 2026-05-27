# CORS explicado

CORS significa Cross-Origin Resource Sharing.

## El problema

El dashboard corre en:

```txt
http://localhost:5173
```

La API corre en:

```txt
http://localhost:3100
```

Como el puerto es distinto, el navegador considera que son orígenes distintos.

## La solución

La API usa:

```js
const cors = require('cors');
app.use(cors());
```

Así el navegador permite que el dashboard lea las respuestas de la API.

## Reto educativo

Quita temporalmente `app.use(cors())`, recarga el dashboard y observa el error en la consola del navegador.