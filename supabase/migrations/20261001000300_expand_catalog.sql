-- Actualiza las rutas rotas de las películas existentes y suma cinco clásicos.
insert into public.peliculas (id, nombre, imagen, sinopsis, duracion, genero, clasificacion_edad, fecha_estreno, esta_disponible)
values
  (1, 'Interestelar', '/images/peliculas/interestelar.svg', 'Un grupo de astronautas busca un nuevo hogar para la humanidad.', 169, 'Ciencia ficción', 13, null, true),
  (2, 'El Padrino', '/images/peliculas/el-padrino.svg', 'La historia de una poderosa familia dedicada al crimen organizado.', 175, 'Drama', 18, null, false),
  (3, 'El Padrino II', '/images/peliculas/el-padrino-ii.svg', 'La continuación de la historia de la familia Corleone.', 200, 'Drama', 18, null, false),
  (4, 'Casablanca', '/images/peliculas/casablanca.jpg', 'En Casablanca, un antiguo amor reaparece en medio de la Segunda Guerra Mundial.', 102, 'Drama, Romance', 13, null, true),
  (5, 'Metropolis', '/images/peliculas/metropolis.jpg', 'En una ciudad futurista, una joven intenta unir a los trabajadores y a quienes gobiernan.', 153, 'Ciencia ficción', 13, null, true),
  (6, 'The General', '/images/peliculas/the-general.jpg', 'Un maquinista persigue el tren que se llevó a su locomotora y a su amada.', 75, 'Comedia, Aventura', 0, null, true),
  (7, 'El gabinete del Dr. Caligari', '/images/peliculas/caligari.jpg', 'Un misterioso hipnotizador y su sonámbulo protagonizan una serie de sucesos inquietantes.', 76, 'Terror, Suspenso', 13, null, true),
  (8, 'Underworld', '/images/peliculas/underworld.jpg', 'Un drama criminal ambientado en el submundo de Chicago.', 80, 'Crimen, Drama', 13, null, true)
on conflict (id) do update set
  nombre = excluded.nombre,
  imagen = excluded.imagen,
  sinopsis = excluded.sinopsis,
  duracion = excluded.duracion,
  genero = excluded.genero,
  clasificacion_edad = excluded.clasificacion_edad,
  fecha_estreno = excluded.fecha_estreno,
  esta_disponible = excluded.esta_disponible;

-- Agrega funciones para que los nuevos títulos tengan horarios de ejemplo.
insert into public.funciones (id, pelicula_id, sala_id, fecha, hora, precio_entrada)
values
  (5, 5, 1, current_date + 1, '17:00', 5000),
  (6, 4, 2, current_date + 1, '17:00', 5000),
  (7, 6, 1, current_date + 1, '19:45', 5000),
  (8, 7, 2, current_date + 1, '20:00', 5000),
  (9, 8, 1, current_date + 1, '22:00', 5000)
on conflict (id) do update set
  pelicula_id = excluded.pelicula_id,
  sala_id = excluded.sala_id,
  fecha = excluded.fecha,
  hora = excluded.hora,
  precio_entrada = excluded.precio_entrada;

select setval(pg_get_serial_sequence('public.peliculas', 'id'), coalesce((select max(id) from public.peliculas), 1));
select setval(pg_get_serial_sequence('public.funciones', 'id'), coalesce((select max(id) from public.funciones), 1));
