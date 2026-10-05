-- El formulario de la app envía los datos necesarios para crear el perfil.
-- El alta manual desde Supabase Dashboard solo crea email/contraseña y no
-- debe fallar por no tener datos personales ni completar esos datos con valores falsos.
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_metadata jsonb := new.raw_user_meta_data;
begin
  if nullif(v_metadata ->> 'nombre', '') is null
    or nullif(v_metadata ->> 'apellido', '') is null
    or nullif(v_metadata ->> 'fecha_nacimiento', '') is null
    or nullif(v_metadata ->> 'tipo_sangre', '') is null
    or nullif(v_metadata ->> 'color_ojos', '') is null
    or nullif(v_metadata ->> 'dias_vacaciones', '') is null then
    return new;
  end if;

  insert into public.profiles (
    id,
    email,
    nombre,
    apellido,
    fecha_nacimiento,
    tipo_sangre,
    color_ojos,
    dias_vacaciones
  )
  values (
    new.id,
    new.email,
    v_metadata ->> 'nombre',
    v_metadata ->> 'apellido',
    (v_metadata ->> 'fecha_nacimiento')::date,
    v_metadata ->> 'tipo_sangre',
    v_metadata ->> 'color_ojos',
    (v_metadata ->> 'dias_vacaciones')::integer
  );

  return new;
end;
$$;
