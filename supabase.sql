-- Execute este SQL no Supabase > SQL Editor.
-- Ele cria o perfil de cada jogador e permite que o próprio jogador
-- leia/atualize apenas o seu progresso.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0 and xp < 5),
  best_score integer not null default 0 check (best_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Players can read own profile" on public.profiles;
create policy "Players can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Players can insert own profile" on public.profiles;
create policy "Players can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Players can update own profile" on public.profiles;
create policy "Players can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Cria automaticamente o perfil quando um usuário novo é criado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();
