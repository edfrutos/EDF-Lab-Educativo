# Misión 05: mejorar el dashboard

## Objetivo

Practicar el flujo CRUD completo desde el dashboard:

- crear un usuario con `POST /users`,
- editarlo con `PUT /users/:id`,
- eliminarlo con `DELETE /users/:id`,
- observar cómo el navegador, la API y la tabla se sincronizan.

## Pasos

1. Arranca la API:

   ```bash
   cd api
   PORT=3100 npm start
   ```

2. Abre el dashboard desde la carpeta `dashboard/`.

3. En el formulario `Gestionar usuarios`, escribe un nombre y un email.

4. Pulsa `Crear usuario`.

5. Comprueba que aparece el feedback:

   ```txt
   POST /users -> usuario creado
   ```

6. Busca el usuario nuevo en la tabla y pulsa `Editar`.

7. Cambia el nombre o el email y pulsa `Guardar cambios`.

8. Comprueba que aparece el feedback:

   ```txt
   PUT /users/:id -> usuario actualizado
   ```

9. Pulsa `Eliminar` en ese mismo usuario.

10. Acepta la confirmación del navegador.

11. Comprueba que aparece el feedback:

    ```txt
    DELETE /users/:id -> usuario eliminado
    ```

12. Recarga los datos y observa que la tabla refleja el estado actual de la API en memoria.

## Resultado esperado

- El usuario creado aparece en la tabla.
- Al editarlo, la fila se actualiza después de guardar.
- Al eliminarlo, la fila desaparece después de confirmar.
- El dashboard muestra qué método y endpoint se usaron en cada operación.

## Reglas

1. No añadir frameworks todavía.
2. Mantener HTML, CSS y JS separados.
3. Documentar el cambio en `NOTEBOOK.md`.
4. No mostrar JSON crudo como solución principal: primero debe entenderse el flujo formulario -> API -> tabla.

## Reto extra

Añade un pequeño contador de usuarios encima de la tabla. Debe actualizarse después de `Crear usuario`, `Guardar cambios`, `Eliminar` y `Recargar datos`.
