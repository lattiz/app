import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { previewUrl } from '../../common/preview/preview-url';
import { type Database, DATABASE } from '../../database/database.module';
import type {
  SlugAvailabilityResponseDto,
  SlugProblem,
  TenantSlugResponseDto,
} from './dto/slug.response.dto';
import {
  isUnqueryableSlugInput,
  normalizeSlug,
  suggestionCandidates,
} from './tenant-slug';
import {
  SlugInvalidException,
  SlugReservedException,
  SlugTakenException,
  TenantNotFoundException,
} from './tenants.exceptions';

const UNIQUE_VIOLATION = '23505';
const CHECK_VIOLATION = '23514';

interface OwnTenantRow {
  id: string;
  slug: string;
  name: string;
}

interface SlugStateRow {
  problem: 'SLUG_INVALID' | 'SLUG_RESERVED' | null;
  taken: boolean;
}

/**
 * Site address (`{slug}.lattiz.app`) rules live in the database
 * (tenant_slug_problem and the tenants_slug_valid CHECK); this service never
 * re-implements them, so the API and the constraint cannot disagree.
 */
@Injectable()
export class TenantSlugService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async checkAvailability(
    userSub: string,
    rawSlug: string,
  ): Promise<SlugAvailabilityResponseDto> {
    const tenant = await this.getOwnTenant(userSub);
    const slug = normalizeSlug(rawSlug);
    const reason = await this.problemFor(tenant, slug);
    return { slug, available: reason === null, reason };
  }

  /** Idempotent for the address the tenant already has. */
  async claimSlug(
    userSub: string,
    rawSlug: string,
  ): Promise<TenantSlugResponseDto> {
    const tenant = await this.getOwnTenant(userSub);
    const slug = normalizeSlug(rawSlug);
    if (slug === tenant.slug) return this.toResponse(tenant.slug);

    const problem = await this.problemFor(tenant, slug);
    if (problem) throw exceptionFor(problem);

    try {
      await this.db.execute(
        sql`UPDATE public.tenants SET slug = ${slug} WHERE id = ${tenant.id}::uuid`,
      );
    } catch (error) {
      // The unique index decides races: the loser of two concurrent claims lands here.
      const code = pgErrorCode(error);
      if (code === UNIQUE_VIOLATION) throw new SlugTakenException();
      if (code === CHECK_VIOLATION) throw new SlugInvalidException();
      throw error;
    }
    return this.toResponse(slug);
  }

  /** First free address derived from the business name; always valid and available at read time. */
  async suggestSlug(userSub: string): Promise<TenantSlugResponseDto> {
    const tenant = await this.getOwnTenant(userSub);
    const candidates = suggestionCandidates(tenant.name);
    const rows = await this.query<{ slug: string }>(
      sql`SELECT c.slug
          FROM jsonb_array_elements_text(${JSON.stringify(candidates)}::jsonb)
               WITH ORDINALITY AS c(slug, n)
          WHERE public.tenant_slug_problem(c.slug) IS NULL
            AND NOT EXISTS (
              SELECT 1 FROM public.tenants t
              WHERE t.slug = c.slug AND t.id <> ${tenant.id}::uuid
            )
          ORDER BY c.n
          LIMIT 1`,
    );
    if (!rows[0]) throw new SlugTakenException();
    return this.toResponse(rows[0].slug);
  }

  private async problemFor(
    tenant: OwnTenantRow,
    slug: string,
  ): Promise<SlugProblem | null> {
    if (slug === tenant.slug) return null;
    if (isUnqueryableSlugInput(slug)) return 'SLUG_INVALID';

    const rows = await this.query<SlugStateRow>(
      sql`SELECT public.tenant_slug_problem(${slug}) AS problem,
                 EXISTS (
                   SELECT 1 FROM public.tenants WHERE slug = ${slug} AND id <> ${tenant.id}::uuid
                 ) AS taken`,
    );
    const state = rows[0];
    if (state.problem) return state.problem;
    return state.taken ? 'SLUG_TAKEN' : null;
  }

  private async getOwnTenant(userSub: string): Promise<OwnTenantRow> {
    const rows = await this.query<OwnTenantRow>(
      sql`SELECT id, slug, name FROM public.tenants
          WHERE user_id = ${userSub}::uuid
          LIMIT 1`,
    );
    if (!rows[0]) throw new TenantNotFoundException();
    return rows[0];
  }

  private toResponse(slug: string): TenantSlugResponseDto {
    return { slug, previewUrl: previewUrl(slug) };
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function exceptionFor(problem: SlugProblem): Error {
  if (problem === 'SLUG_RESERVED') return new SlugReservedException();
  if (problem === 'SLUG_TAKEN') return new SlugTakenException();
  return new SlugInvalidException();
}

/** drizzle wraps the driver error in `cause`; accept both shapes. */
function pgErrorCode(error: unknown): string | undefined {
  const direct = (error as { code?: unknown } | null)?.code;
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  const code = typeof cause === 'string' ? cause : direct;
  return typeof code === 'string' ? code : undefined;
}
