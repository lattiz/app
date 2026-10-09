/** Loads the raw `app_settings` snapshot. Tests supply a fake; Drizzle is the production adapter. */
export interface SettingsStorePort {
  loadAll(): Promise<ReadonlyMap<string, unknown>>;
}

export const SETTINGS_STORE = Symbol('SETTINGS_STORE');
