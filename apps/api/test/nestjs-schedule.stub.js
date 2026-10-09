/* global module */
// @nestjs/schedule v12 ships ESM only, which Jest's CommonJS runtime cannot load.
// Unit tests never run the scheduler, so its decorators are inert here.
const noopDecorator = () => () => undefined;

module.exports = {
  Cron: noopDecorator,
  Interval: noopDecorator,
  Timeout: noopDecorator,
  ScheduleModule: { forRoot: () => ({ module: class ScheduleModuleStub {} }) },
};
