create table if not exists public.listings (
  id text primary key,
  data jsonb not null,
  publication_status text not null default 'pending'
    check (publication_status in ('pending', 'approved', 'deleted')),
  owner_email text,
  edit_token text,
  source_base_index integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_publication_status_idx
  on public.listings (publication_status);

create index if not exists listings_created_at_idx
  on public.listings (created_at desc);

alter table public.listings enable row level security;

drop policy if exists "Public can read approved listings" on public.listings;
create policy "Public can read approved listings"
  on public.listings
  for select
  using (publication_status = 'approved');

-- Las escrituras se hacen desde rutas server-side de Next.js usando
-- SUPABASE_SERVICE_ROLE_KEY. No expongas esa clave en el navegador.
