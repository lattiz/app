import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('metrics DTOs', () => {
  it('does not expose tenant emails or names', () => {
    const source = readFileSync(
      join(__dirname, 'admin-metrics.dto.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/\bemail\b/i);
    expect(source).not.toMatch(/\bslug\b/);
    expect(source).not.toMatch(/tenantName|displayName|fullName/);
  });
});
