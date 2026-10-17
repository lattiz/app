import { DOMAIN_SOURCES } from './admin-tenants.dto';

describe('DOMAIN_SOURCES', () => {
  it('matches the domains.source check after the Openprovider migration', () => {
    expect(DOMAIN_SOURCES).toEqual(['lattiz_managed', 'user_provided']);
  });
});
