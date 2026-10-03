
-- handle_new_user is a trigger-only function; triggers invoke it regardless
-- of role grants, so it never needs to be callable directly over PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
;
