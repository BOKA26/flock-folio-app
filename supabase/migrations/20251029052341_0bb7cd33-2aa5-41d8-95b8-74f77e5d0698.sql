-- Activer l'extension pgvector pour les embeddings
create extension if not exists vector;

-- Table des documents bruts chargés par l'église
create table if not exists public.kb_documents (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  title text not null,
  source_type text not null default 'text',
  source_url text,
  language text default 'fr',
  created_at timestamp with time zone default now()
);

-- Table des chunks (morceaux de texte indexables)
create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  document_id uuid not null references public.kb_documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(3072),
  created_at timestamp with time zone default now()
);

-- Table FAQ prioritaire
create table if not exists public.kb_faq (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references public.churches(id) on delete cascade,
  question text not null,
  answer text not null,
  tags text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Activer RLS sur toutes les tables
alter table public.kb_documents enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.kb_faq enable row level security;

-- Politiques RLS pour kb_documents
create policy "Users can view documents of their church"
  on public.kb_documents for select
  using (church_id = get_user_church_id(auth.uid()));

create policy "Admins and operateurs can insert documents"
  on public.kb_documents for insert
  with check (
    church_id = get_user_church_id(auth.uid()) 
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

create policy "Admins and operateurs can update documents"
  on public.kb_documents for update
  using (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

create policy "Admins and operateurs can delete documents"
  on public.kb_documents for delete
  using (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

-- Politiques RLS pour kb_chunks
create policy "Users can view chunks of their church"
  on public.kb_chunks for select
  using (church_id = get_user_church_id(auth.uid()));

create policy "Admins and operateurs can insert chunks"
  on public.kb_chunks for insert
  with check (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

create policy "Admins and operateurs can delete chunks"
  on public.kb_chunks for delete
  using (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

-- Politiques RLS pour kb_faq
create policy "Users can view FAQ of their church"
  on public.kb_faq for select
  using (church_id = get_user_church_id(auth.uid()));

create policy "Admins and operateurs can insert FAQ"
  on public.kb_faq for insert
  with check (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

create policy "Admins and operateurs can update FAQ"
  on public.kb_faq for update
  using (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

create policy "Admins and operateurs can delete FAQ"
  on public.kb_faq for delete
  using (
    church_id = get_user_church_id(auth.uid())
    AND (has_role(auth.uid(), church_id, 'admin'::app_role) OR has_role(auth.uid(), church_id, 'operateur'::app_role))
  );

-- Fonction de recherche vectorielle (similarité cosinus)
create or replace function public.match_chunks(
  query_embedding vector(3072),
  match_count int,
  filter_church_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
security definer
set search_path = public
as $$
  select 
    c.id, 
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.kb_chunks c
  where c.church_id = filter_church_id
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;