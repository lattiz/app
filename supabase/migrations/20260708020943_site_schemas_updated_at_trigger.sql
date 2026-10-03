CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_schemas_set_updated_at ON public.site_schemas;
CREATE TRIGGER site_schemas_set_updated_at
  BEFORE UPDATE ON public.site_schemas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();;
