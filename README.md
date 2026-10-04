# Documento de Especificación de Requerimientos de Software (ERS)

## Guía del proyecto

La aplicación Angular vive en `src/`. Dentro de `src/app`, el código se organiza por responsabilidad:

| Ubicación | Contenido |
| --- | --- |
| `core/models/` | Modelos y tipos centrales del dominio (películas, funciones, salas, butacas, ventas y entradas). |
| `core/services/` | Servicios compartidos para consultar y gestionar esos datos. |
| `features/` | Pantallas y flujos agrupados por funcionalidad: `auth`, `peliculas`, `compra`, `venta`, `home` y `error`. |
| `features/peliculas/pages/` | Vistas de cartelera y detalle de película. |
| `features/peliculas/components/` | Componentes propios de la funcionalidad de películas, como la tarjeta. |
| `shared/components/` | Componentes reutilizables en distintas funcionalidades: navegación, pie, carga y modal. |
| `public/` | Recursos estáticos servidos tal cual, como el favicon. |
| `documentation/` | Documentación técnica HTML generada con Compodoc; no es código de la aplicación. |

### Convención de nombres

- Los componentes usan el patrón `<nombre>.component.ts`, `<nombre>.component.html` y `<nombre>.component.css`.
- Las pruebas quedan junto al componente, en `<nombre>.spec.ts`.
- Los servicios usan `<nombre>.service.ts`; los modelos usan `<nombre>.model.ts`.
- Las rutas de una funcionalidad usan `<nombre>.routes.ts`.
- Los nombres de carpetas y archivos se escriben en minúsculas y con guiones para separar palabras.

Para agregar una pantalla, ubicala en la carpeta de su funcionalidad dentro de `features/`. Si su servicio o modelo será compartido por varias funcionalidades, colocalo en `core/`; si solo se usa en una, mantenelo junto a esa funcionalidad.

### Conectar Supabase en desarrollo

1. En el proyecto de Supabase, abrí **SQL Editor** y ejecutá, en orden, `supabase/migrations/20261001000000_create_profiles.sql`, `supabase/migrations/20261001000100_create_catalog.sql`, `supabase/migrations/20261001000200_update_sample_showtime_dates.sql` y `supabase/migrations/20261001000300_expand_catalog.sql`.
2. En **Connect** o **Settings → API Keys**, copiá la Project URL y la Publishable key.
3. Pegá esos valores en `src/environments/environment.ts` como `supabaseUrl` y `supabasePublishableKey`.

La clave Publishable está pensada para el navegador; el acceso queda limitado por las políticas RLS de la base. No uses una clave Secret o `service_role` en Angular. El catálogo, las salas y las funciones ya se leen desde Supabase. Las ventas y el canje del descuento todavía necesitan migrarse para que el 20 % se aplique y consuma junto con el pago. Las imágenes locales de la cartelera están en `public/images/peliculas/`; sus fuentes se documentan en `public/images/peliculas/FUENTES.md`.

## Documento de Especificación de Requerimientos de Software (ERS)

**Proyecto:** Sistema de Gestión y Venta de Entradas para Cine

**Materia:** Programación IV - TP 1

---

## 1. Módulo de Autenticación y Perfil de Usuario

### 1.1. Tipos de Usuarios / Roles

1. **Usuario Anónimo (Cliente Invitado):** Puede explorar la cartelera y realizar compras directo sin registrarse.

2. **Usuario Registrado (Cliente):** Disfruta de beneficios como cupones de bienvenida, programa de puntos, crédito por cancelaciones e historial de compras/reseñas.

3. **Empleado:** Encargado de la validación y control de entradas en puerta y despacho en el Candy Bar.

4. **Administrador:** Control total sobre películas, funciones, productos, precios, cupones, usuarios y métricas.

### 1.2. Registro e Información de Perfil

- Campos obligatorios de registro: Email, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y cantidad de días de vacaciones al año.

- **Beneficio de Registro:** Asignación automática de un cupón de descuento para la primera compra (porcentaje configurable por el administrador).

- Panel de Perfil de Usuario:

- Saldo de **puntos acumulados** e historial de canjes.

- Saldo de **crédito en cuenta** acumulado por cancelaciones.

- Configuración y gestión de datos personales.

---

## 2. Módulo de Catálogo de Películas y Cartelera

### 2.1. Gestión de Películas (Administración)

- Cada película debe contar con:

- Nombre, sinopsis, imagen/póster y duración exacta.

- Lista de géneros asociados (puede tener varios).

- Restricción de edad (Apta para todo público, +13, +18).

### 2.2. Visualización y Filtros en Cartelera (Cliente)

- **Destacados:** Visualización de las 3 películas más vendidas en la pantalla principal.

- **Buscador y Filtros:** Búsqueda dinámica por nombre y filtrado multi-género.

- **Formatos e Idioma:** Filtros o indicadores de formato (2D, 3D, 4D, 5D) e idioma (Castellano o Subtitulada).

- **Sección "Próximamente":**
- Muestra de películas con estreno programado para las próximas semanas.

- Botón para **activar alertas/notificaciones** cuando las entradas salgan a la venta.

- **Sección "Mis Películas":** Historial visual con imágenes, fechas pasadas y calificaciones asignadas por el usuario.

### 2.3. Reseñas y Calificaciones

- Puntuación promedio por estrellas visible en la ficha de cada película.

- Módulo de comentarios cortos y calificaciones individuales visibles antes de comprar las entradas.

---

## 3. Módulo de Configuración de Salas, Funciones y Asientos

### 3.1. Estructura de las Salas

- Matriz general de 20 filas identicadas con letras (A a T).

- Distribución física por columnas:

- **Filas generales:** 3 bloques/columnas (4, 20 y 4 butacas).

- **Filas J y K reemplazadas por una única fila accesible:** Distribución de 2, 10 y 2 butacas, resaltada de forma visual distintiva.

- **Filas R, S y T (Butacas VIP):** Ubicadas en las últimas 3 filas. Tienen un valor diferencial elevado y una marcación visual destacada.

### 3.2. Asignación Automática de Funciones

- Configuración de proyecciones indicando días de la semana y horarios fijados.

- **Algoritmo de asignación automática de salas:** Debe asignar sala disponible evitando superposiciones de horario.

- **Margen operativo obligatoria:** Garantizar un mínimo de 30 minutos libres tras finalizar una función antes de iniciar la siguiente en la misma sala.

---

## 4. Módulo de Venta de Entradas y Candy Bar

### 4.1. Proceso de Selección y Mapa en Tiempo Real

- **Mapa interactivo de butacas:** Actualización en tiempo real de ocupación para evitar selecciones duplicadas de asientos de forma simultánea.

- **Control de edad:** Bloqueo de venta para menores de 13 o 18 años según la calificación de la película. Advertencia explícita en el ticket solicitando acompañamiento de un adulto.

### 4.2. Módulo de Candy Bar y Combos

- **Productos:** Creación, categorización (bebidas, pochoclos, golosinas) y asignación de precios.

- **Combos Especiales:** Creación de paquetes (Entrada + Candy) a precio fijo.

- Adquisición unificada en el mismo flujo de compra de la entrada.

### 4.3. Cupones, Preventas y Medios de Pago

- **Cupones de Descuento:**
- Descuento personalizable para la primera compra de usuarios registrados.

- Cupones segmentados por reglas (ej. mayores de 50 años).

- **Sistema de Preventa:**
- Apertura de venta 7 días antes del estreno a precio promocional configurable por película.

- Retorno automático al precio estándar finalizado el plazo.

- **Medios de Pago y Crédito:** Combinación de pago convencional con saldo/crédito acumulado en cuenta.

### 4.4. Generación de Comprobantes

- Generación de PDF con resumen de compra, funciones, ubicaciones, ítems de Candy Bar y un **código QR único unificado**.

---

## 5. Módulo de Cancelaciones y Programa de Fidelización

### 5.1. Cancelación de Compras

- Permitido hasta **2 horas antes** del inicio de la función.

- **Devolución:** Saldo acreditado directamente en la cuenta del usuario para futuras compras (no se realiza reintegro monetario).

### 5.2. Programa de Puntos (Fidelización)

- **Acumulación:** 1 peso gastado = 1 punto acumulado (exclusivo para usuarios registrados).

- **Canje:** Catálogo de recompensas configurables (entradas gratis o productos del candy por cantidad de puntos).

- Puntos personales e intransferibles.

---

## 6. Módulo de Empleados y Validación de QRs

### 6.1. Validación en Puerta y Candy Bar

- Interfaz para escaneo de códigos QR o ingreso manual de código alfanumérico.

- Cambio de estado automático del ticket a "Validado" / "Entregado" para anular reutilizaciones.

---

## 7. Módulo de Administración, Reportes y Auditoría

### 7.1. Reportes y Métricas

- Módulo estadístico en tiempo real de facturación diaria y volumen de entradas vendidas.

- Gráficos comparativos de películas más vistas (semanal/mensual) y productos más vendidos del Candy Bar.

- Exportación de informes en formatos **PDF** y **Excel**.

### 7.2. Registro de Actividades (Audit Log)

- Auditoría detallada con marca de tiempo (fecha y hora) e identificación del usuario para:
- Creación y modificación de funciones y precios.

- Validaciones de QR realizadas por empleados.

- Cambios administrativos en la plataforma.

---

## 8. Requerimientos No Funcionales y UI/UX

1. **Diseño Visual e Interfaz (UI/UX):**

- Estilo visual propio, cuidado e intuitivo.

- Optimización en la entrada de datos: componentes eficientes para fechas y horas evitando calendarios complejos o menús desplegables extensos.

2. **Tecnología y Persistencia:**

- Desarrollo del frontend en **Angular** incorporando arquitectura **PWA** (Progressive Web App).

- Integración de backend/base de datos con **Supabase**.

3. **Despliegue y Código:**

- Aplicación alojada con URL funcional, repositorio público en GitHub y documentación en `README.md` detallando arquitectura y decisiones técnicas.
