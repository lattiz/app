import { ADMIN_AUDIT_KEY } from '../audit/admin-audit.decorator';
import { ADMIN_ROLES_KEY } from '../auth/admin-roles.decorator';
import { AdminTemplatesController } from './admin-templates.controller';
import type { AdminTemplatesService } from './admin-templates.service';

const ID = 'barberia-oxido-v1';

describe('AdminTemplatesController', () => {
  const templates = {
    update: jest.fn(),
    activate: jest.fn(),
    retire: jest.fn(),
    reorder: jest.fn(),
    replaceThumbnail: jest.fn(),
    remove: jest.fn(),
  };
  const controller = new AdminTemplatesController(
    templates as unknown as AdminTemplatesService,
  );

  it('keeps delete owner-only and audits the other mutations', () => {
    expect(
      Reflect.getMetadata(
        ADMIN_ROLES_KEY,
        AdminTemplatesController.prototype.remove,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        ADMIN_ROLES_KEY,
        AdminTemplatesController.prototype.activate,
      ),
    ).toEqual(['owner', 'operator']);
    expect(
      Reflect.getMetadata(
        ADMIN_AUDIT_KEY,
        AdminTemplatesController.prototype.retire,
      ),
    ).toEqual({
      action: 'template.retire',
      targetType: 'template',
      targetParam: 'id',
    });
    expect(
      Reflect.getMetadata(
        ADMIN_AUDIT_KEY,
        AdminTemplatesController.prototype.reorder,
      ),
    ).toEqual({ action: 'template.reorder', targetType: 'template' });
  });

  it('passes the retire reason and the delete snapshot to the audit', async () => {
    templates.retire.mockResolvedValue({
      reason: 'ya no la ofrecemos',
      before: { isActive: true, retiredAt: null },
      after: { isActive: false, retiredAt: '2026-06-01T00:00:00.000Z' },
      template: { id: ID },
    });
    const retireRequest = { adminAudit: undefined } as {
      adminAudit?: {
        reason?: string;
        before?: unknown;
        after?: unknown;
      };
    };
    await controller.retire(
      ID,
      { reason: 'ya no la ofrecemos' },
      retireRequest as never,
    );
    expect(retireRequest.adminAudit).toEqual({
      reason: 'ya no la ofrecemos',
      before: { isActive: true, retiredAt: null },
      after: { isActive: false, retiredAt: '2026-06-01T00:00:00.000Z' },
    });

    const before = {
      id: ID,
      name: 'Óxido',
      tier: 'basic',
      category: 'barberia',
      preview_url: null,
      thumbnail_url: null,
      kit_meta: null,
    };
    templates.remove.mockResolvedValue({ before });
    const deleteRequest = { adminAudit: undefined } as {
      adminAudit?: { before?: unknown; after?: unknown };
    };
    await controller.remove(ID, { confirmId: ID }, deleteRequest as never);
    expect(deleteRequest.adminAudit).toEqual({
      before,
      after: { deleted: true },
    });
    expect(deleteRequest.adminAudit?.before).not.toHaveProperty(
      'grapesjs_json',
    );
  });
});
