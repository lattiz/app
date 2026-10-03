DROP TRIGGER IF EXISTS domains_set_updated_at ON public.domains;
CREATE TRIGGER domains_set_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS domain_jobs_set_updated_at ON public.domain_jobs;
CREATE TRIGGER domain_jobs_set_updated_at
  BEFORE UPDATE ON public.domain_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();;
