-- Actualiza las funciones de ejemplo para que sigan disponibles desde hoy.
-- Conserva los horarios, las salas, las películas y los precios originales.
update public.funciones
set fecha = current_date
where id in (1, 2, 3, 4);
