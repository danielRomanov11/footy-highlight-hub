-- Fix: grant API roles access to tables (required when creating tables via SQL)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT SELECT ON TABLE public.sources TO anon, authenticated;
GRANT SELECT ON TABLE public.competitions TO anon, authenticated;
GRANT SELECT ON TABLE public.seasons TO anon, authenticated;
GRANT SELECT ON TABLE public.videos TO anon, authenticated;

GRANT ALL ON TABLE public.sources TO service_role;
GRANT ALL ON TABLE public.competitions TO service_role;
GRANT ALL ON TABLE public.seasons TO service_role;
GRANT ALL ON TABLE public.videos TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
