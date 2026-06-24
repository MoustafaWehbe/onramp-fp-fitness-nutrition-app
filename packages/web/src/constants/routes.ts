export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  settings: "/settings",
  programs: "/programs",
  programDetail: (slug = ":slug") => `/programs/${slug}`,
} as const;

export const LANDING_SECTIONS = {
  how: "#how",
  programs: "#programs",
  coach: "#coach",
} as const;

export const GUEST_NAV_LINKS = [
  { href: LANDING_SECTIONS.how, label: "How it works" },
  { href: LANDING_SECTIONS.programs, label: "Programs" },
  { href: LANDING_SECTIONS.coach, label: "AI Coach" },
] as const;

export const GUEST_FOOTER_LINKS = [
  { href: LANDING_SECTIONS.programs, label: "Programs" },
  { href: LANDING_SECTIONS.coach, label: "AI Coach" },
] as const;
