alter table public.ventas
  add column if not exists descuento_porcentaje integer not null default 0
    check (descuento_porcentaje between 0 and 100),
  add column if not exists descuento_importe numeric(10, 2) not null default 0
    check (descuento_importe >= 0);

create or replace function public.confirmar_compra(
  p_funcion_id bigint,
  p_butacas jsonb,
  p_forma_pago smallint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_precio_base numeric(10, 2);
  v_subtotal numeric(10, 2);
  v_descuento_porcentaje integer := 0;
  v_descuento_importe numeric(10, 2) := 0;
  v_precio_final numeric(10, 2);
  v_venta_id bigint;
  v_entradas jsonb;
  v_usuario_id uuid := auth.uid();
begin
  if p_butacas is null or jsonb_typeof(p_butacas) <> 'array' then
    raise exception 'Debe seleccionar al menos una butaca.' using errcode = '22023';
  end if;

  if jsonb_array_length(p_butacas) = 0 then
    raise exception 'Debe seleccionar al menos una butaca.' using errcode = '22023';
  end if;

  if p_forma_pago is null or p_forma_pago not in (1, 2, 3, 4, 9) then
    raise exception 'El medio de pago no es válido.' using errcode = '22023';
  end if;

  select precio_entrada into v_precio_base
  from public.funciones
  where id = p_funcion_id;

  if not found then
    raise exception 'La función no existe.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_butacas) as b(fila text, asiento integer)
    where b.fila is null
      or b.asiento is null
      or b.fila not in ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J/K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T')
      or b.asiento < 1
      or b.asiento > case when b.fila = 'J/K' then 14 else 28 end
  ) then
    raise exception 'La selección contiene una butaca inválida.' using errcode = '22023';
  end if;

  if exists (
    select b.fila, b.asiento
    from jsonb_to_recordset(p_butacas) as b(fila text, asiento integer)
    group by b.fila, b.asiento
    having count(*) > 1
  ) then
    raise exception 'La selección contiene butacas repetidas.' using errcode = '22023';
  end if;

  select coalesce(sum(
    v_precio_base * case when b.fila in ('R', 'S', 'T') then 1.5 else 1 end
  ), 0)
  into v_subtotal
  from jsonb_to_recordset(p_butacas) as b(fila text, asiento integer);

  -- Bloqueamos el perfil mientras verificamos y consumimos el beneficio.
  if v_usuario_id is not null then
    select descuento_bienvenida_porcentaje
    into v_descuento_porcentaje
    from public.profiles
    where id = v_usuario_id and not descuento_bienvenida_usado
    for update;

    if not found then
      v_descuento_porcentaje := 0;
    end if;
  end if;

  v_descuento_importe := round(v_subtotal * v_descuento_porcentaje / 100, 2);
  v_precio_final := v_subtotal - v_descuento_importe;

  insert into public.ventas (
    cliente_id, subtotal, descuento_porcentaje, descuento_importe,
    precio_final, forma_pago, esta_pagado
  )
  values (
    v_usuario_id, v_subtotal, v_descuento_porcentaje, v_descuento_importe,
    v_precio_final, p_forma_pago, true
  )
  returning id into v_venta_id;

  with entradas_guardadas as (
    insert into public.entradas (venta_id, funcion_id, fila, asiento, precio, estado_entrada)
    select
      v_venta_id,
      p_funcion_id,
      b.fila,
      b.asiento,
      v_precio_base * case when b.fila in ('R', 'S', 'T') then 1.5 else 1 end,
      'emitida'
    from jsonb_to_recordset(p_butacas) as b(fila text, asiento integer)
    returning id, fila, asiento, precio
  )
  select jsonb_agg(jsonb_build_object(
    'id', id,
    'fila', fila,
    'asiento', asiento,
    'precio', precio
  ) order by id)
  into v_entradas
  from entradas_guardadas;

  -- Se marca usado solo después de insertar toda la venta y sus entradas.
  if v_descuento_porcentaje > 0 then
    update public.profiles
    set descuento_bienvenida_usado = true
    where id = v_usuario_id;
  end if;

  return jsonb_build_object(
    'venta_id', v_venta_id,
    'subtotal', v_subtotal,
    'descuento_porcentaje', v_descuento_porcentaje,
    'descuento_importe', v_descuento_importe,
    'precio_final', v_precio_final,
    'entradas', v_entradas
  );
end;
$$;

notify pgrst, 'reload schema';
