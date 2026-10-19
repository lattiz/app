import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminTenantFlagsPatchDto, DOMAIN_SOURCES } from './admin-tenants.dto';

describe('DOMAIN_SOURCES', () => {
  it('matches the domains.source check after the Openprovider migration', () => {
    expect(DOMAIN_SOURCES).toEqual(['lattiz_managed', 'user_provided']);
  });
});

describe('AdminTenantFlagsPatchDto', () => {
  async function errorsOf(plain: object): Promise<string[]> {
    const dto = plainToInstance(AdminTenantFlagsPatchDto, plain);
    const errors = await validate(dto);
    return errors.map((error) => error.property);
  }

  it('accepts up to 10 tags of 24 characters and notes of 2000', async () => {
    await expect(
      errorsOf({
        isInternal: true,
        tags: ['a'.repeat(24)],
        notes: 'n'.repeat(2000),
      }),
    ).resolves.toEqual([]);
  });

  it('rejects too many tags, a long tag and a long note', async () => {
    await expect(
      errorsOf({ tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }),
    ).resolves.toContain('tags');
    await expect(errorsOf({ tags: ['a'.repeat(25)] })).resolves.toContain(
      'tags',
    );
    await expect(errorsOf({ notes: 'n'.repeat(2001) })).resolves.toContain(
      'notes',
    );
    await expect(errorsOf({ tags: [''] })).resolves.toContain('tags');
  });
});
