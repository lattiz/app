/* global module */
// @nestjs/schedule v12 ships ESM only, which Jest's CommonJS runtime cannot load.
// Unit tests never run the scheduler, so its decorators are inert here.
const noopDecorator = () => () => undefined;

const CronExpression = {
  EVERY_MINUTE: 'EVERY_MINUTE',
  EVERY_HOUR: 'EVERY_HOUR',
};

module.exports = {
  Cron: noopDecorator,
  Interval: noopDecorator,
  Timeout: noopDecorator,
  CronExpression,
  ScheduleModule: { forRoot: () => ({ module: class ScheduleModuleStub {} }) },
};
