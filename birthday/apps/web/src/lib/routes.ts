/** Centralized route paths so navigation targets live in one place. */
export const ROUTES = {
  LANDING: "/",
  PARTY: "/party",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
