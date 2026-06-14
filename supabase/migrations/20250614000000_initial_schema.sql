-- Footy Highlight Hub initial schema

create type source_type as enum ('youtube', 'website');
create type embed_type as enum ('youtube', 'iframe', 'link_only');
create type content_type as enum ('highlight', 'full_match');
create type highlight_variant as enum ('standard', 'extended');
create type season_format as enum ('academic_year', 'calendar_year');

create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  source_type source_type not null,
  youtube_channel_id text,
  website_list_url text,
  scraper_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text,
  logo_url text,
  season_format season_format not null default 'academic_year',
  created_at timestamptz not null default now()
);

create table seasons (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  label text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  unique (competition_id, label)
);

create table videos (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id) on delete cascade,
  external_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  source_url text not null,
  embed_type embed_type not null default 'youtube',
  embed_url text,
  content_type content_type not null,
  highlight_variant highlight_variant,
  competition_id uuid references competitions(id) on delete set null,
  season_id uuid references seasons(id) on delete set null,
  match_date date,
  published_at timestamptz not null,
  home_team text,
  away_team text,
  calendar_month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id)
);

create index videos_content_published_idx on videos (content_type, published_at desc);
create index videos_competition_season_month_idx on videos (competition_id, season_id, calendar_month);
create index videos_calendar_month_idx on videos (calendar_month);
create index videos_external_youtube_idx on videos (external_id) where embed_type = 'youtube';

-- RLS
alter table sources enable row level security;
alter table competitions enable row level security;
alter table seasons enable row level security;
alter table videos enable row level security;

create policy "Public read active sources"
  on sources for select
  using (is_active = true);

create policy "Public read competitions"
  on competitions for select
  using (true);

create policy "Public read seasons"
  on seasons for select
  using (true);

create policy "Public read videos"
  on videos for select
  using (true);

-- Grants for Supabase API roles (anon reads, service_role writes via cron)
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select on table public.sources to anon, authenticated;
grant select on table public.competitions to anon, authenticated;
grant select on table public.seasons to anon, authenticated;
grant select on table public.videos to anon, authenticated;

grant all on table public.sources to service_role;
grant all on table public.competitions to service_role;
grant all on table public.seasons to service_role;
grant all on table public.videos to service_role;

grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- Seed competitions
insert into competitions (name, slug, country, season_format) values
  ('Premier League', 'premier-league', 'England', 'academic_year'),
  ('UEFA Champions League', 'champions-league', 'Europe', 'academic_year'),
  ('UEFA Europa League', 'europa-league', 'Europe', 'academic_year'),
  ('LaLiga', 'laliga', 'Spain', 'academic_year'),
  ('Bundesliga', 'bundesliga', 'Germany', 'academic_year'),
  ('Serie A', 'serie-a', 'Italy', 'academic_year'),
  ('Ligue 1', 'ligue-1', 'France', 'academic_year'),
  ('MLS', 'mls', 'USA', 'calendar_year'),
  ('FIFA World Cup', 'world-cup', null, 'calendar_year'),
  ('UEFA European Championship', 'euro', 'Europe', 'calendar_year'),
  ('International', 'international', null, 'calendar_year');

-- Seed current seasons (2024/25 academic, 2026 calendar examples)
insert into seasons (competition_id, label, start_date, end_date)
select c.id, '2024/25', '2024-08-01'::date, '2025-05-31'::date
from competitions c
where c.season_format = 'academic_year';

insert into seasons (competition_id, label, start_date, end_date)
select c.id, '2025', '2025-02-22'::date, '2025-12-31'::date
from competitions c
where c.slug = 'mls';

insert into seasons (competition_id, label, start_date, end_date)
select c.id, '2026', '2026-06-01'::date, '2026-07-31'::date
from competitions c
where c.slug = 'world-cup';

-- Seed YouTube sources (official channels)
insert into sources (name, slug, source_type, youtube_channel_id, is_active) values
  ('FIFA', 'fifa', 'youtube', 'UCpcTrCXblq78GZrTUTLWeBw', true),
  ('UEFA', 'uefa', 'youtube', 'UCyGa1YEx9ST66rYrJTGIKOw', true),
  ('Fox Soccer', 'fox-soccer', 'youtube', 'UCooTLkxcpnTNx6vfOovfBFA', true),
  ('FOX Sports', 'fox-sports', 'youtube', 'UCwNqHDsnBCKT-olwJwIFyfg', true),
  ('Premier League', 'premier-league', 'youtube', 'UCG5qGWdu8nIRZqJ_GgDwQ-w', true),
  ('LaLiga', 'laliga', 'youtube', 'UCTv-XvfzLX3i4IGWAm4sbmA', true),
  ('Bundesliga', 'bundesliga', 'youtube', 'UC6UL29enLNe4mqwTfAyeNuw', true),
  ('Serie A', 'serie-a', 'youtube', 'UCBJeMCIeLQos7wacox4hmLQ', true),
  ('Ligue 1', 'ligue-1', 'youtube', 'UCQsH5XtIc9hONE1BQjucM0g', true),
  ('MLS', 'mls', 'youtube', 'UCSZbXT5TLLW_i-5W8FZpFsg', true);

-- Seed website sources
insert into sources (name, slug, source_type, website_list_url, scraper_key, is_active) values
  ('FIFA.com', 'fifa-website', 'website', 'https://www.fifa.com/fifaplus/en/videos', 'fifa', true),
  ('UEFA.com', 'uefa-website', 'website', 'https://www.uefa.com/uefachampionsleague/video/', 'uefa', true);
