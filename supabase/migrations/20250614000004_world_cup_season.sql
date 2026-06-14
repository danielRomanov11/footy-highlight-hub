-- World Cup 2026 season for browse/archive pages
insert into seasons (competition_id, label, start_date, end_date)
select c.id, '2026', '2026-06-01'::date, '2026-07-31'::date
from competitions c
where c.slug = 'world-cup'
on conflict (competition_id, label) do nothing;

-- Ensure FOX Sports source exists (US World Cup highlights)
insert into sources (name, slug, source_type, youtube_channel_id, is_active)
values ('FOX Sports', 'fox-sports', 'youtube', 'UCwNqHDsnBCKT-olwJwIFyfg', true)
on conflict (slug) do update
  set youtube_channel_id = excluded.youtube_channel_id,
      name = excluded.name,
      is_active = true;
