# Misión 03: consumir JSON

## Objetivo

Entender cómo el dashboard obtiene datos desde la API.

## Archivo clave

```txt
dashboard/app.js
```

## Fragmento clave

```js
const response = await fetch(url);
return response.json();
```

## Pasos

1. Arranca la API.
2. Arranca el dashboard.
3. Abre DevTools del navegador.
4. Mira la pestaña Network.
5. Recarga la página.

## Resultado esperado

Verás peticiones a:

```txt
/
/users
/health
```

También puedes probar manualmente:

```bash
curl http://localhost:3100/users/1
```

## Reto extra

Muestra en pantalla el JSON crudo recibido de `/users`.
