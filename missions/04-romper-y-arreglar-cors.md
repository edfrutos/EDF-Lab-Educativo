# Misión 04: romper y arreglar CORS

## Objetivo

Entender CORS observando el error real.

## Pasos

1. Abre `api/index.js`.
2. Comenta temporalmente:

```js
app.use(cors());
```

3. Reinicia la API.
4. Recarga el dashboard.
5. Observa la consola del navegador.
6. Vuelve a activar `app.use(cors())`.

## Resultado esperado

Sin CORS, el navegador bloqueará la lectura de la respuesta.

Con CORS, el dashboard volverá a funcionar.

## Reto extra

Configura CORS para permitir solo:

```txt
http://localhost:5173
```