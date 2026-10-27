export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;

export const addMs = (d: Date, ms: number): Date => new Date(d.getTime() + ms);
