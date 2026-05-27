# Misión 06: corrupción y restauración

## Objetivo

Observar cómo la API detecta un archivo `api/data/users.json` corrupto al arrancar, lo restaura automáticamente con los datos semilla y avisa en consola.

## Pasos

1. Para la API si está en marcha (`Ctrl+C`).

2. Corrompe el archivo con texto inválido:
   ```bash
   echo "esto no es JSON válido" > api/data/users.json
   ```

3. Arranca la API y observa la consola:
   ```bash
   cd api && PORT=3100 npm start
   ```

4. Busca el aviso en la salida de consola:
   ```
   [warn] data/users.json corrupto — restaurando semilla
   ```

5. Pide la lista de usuarios:
   ```bash
   curl -s http://localhost:3100/users
   ```

## Resultado esperado

La API arranca sin errores fatales. La consola muestra `[warn] data/users.json corrupto — restaurando semilla`. `GET /users` devuelve los dos usuarios semilla (John Doe y Jane Smith). El archivo `api/data/users.json` ha sido sobreescrito con la semilla válida.

## Reto extra

Borra el archivo por completo en lugar de corromperlo:
```bash
rm api/data/users.json
```
Arranca la API y observa el mensaje diferente en consola:
```
[info] data/users.json no encontrado — creando con semilla
```
¿Qué diferencia ves entre el aviso `[warn]` y el aviso `[info]`? ¿Por qué son mensajes distintos si el resultado es el mismo?
