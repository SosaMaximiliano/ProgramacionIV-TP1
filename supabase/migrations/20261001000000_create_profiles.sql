create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text not null,
  apellido text not null,
  fecha_nacimiento date not null,
  tipo_sangre text not null,
  color_ojos text not null,
  dias_vacaciones integer not null check (dias_vacaciones >= 0),
  descuento_bienvenida_porcentaje integer not null default 20
    check (descuento_bienvenida_porcentaje between 0 and 100),
  descuento_bienvenida_usado boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (nombre, apellido, fecha_nacimiento, tipo_sangre, color_ojos, dias_vacaciones)
  on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own personal profile" on public.profiles;
create policy "Users can update their own personal profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'apellido',
    (new.raw_user_meta_data ->> 'fecha_nacimiento')::date,
    new.raw_user_meta_data ->> 'tipo_sangre',
    new.raw_user_meta_data ->> 'color_ojos',
    (new.raw_user_meta_data ->> 'dias_vacaciones')::integer
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();
