-- FOX Sports (not Fox Soccer) publishes World Cup extended highlights
insert into sources (name, slug, source_type, youtube_channel_id, is_active)
values ('FOX Sports', 'fox-sports', 'youtube', 'UCwNqHDsnBCKT-olwJwIFyfg', true)
on conflict (slug) do update
  set youtube_channel_id = excluded.youtube_channel_id,
      name = excluded.name,
      is_active = true;
