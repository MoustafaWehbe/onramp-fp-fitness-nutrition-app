export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  progress: "/progress",
  aiAssistant: "/ai-assistant",
  myPlan: "/my-plan",
  dailyLog: "/daily-log",
  settings: "/settings",
  programs: "/programs",
  requestCoach: "/request-coach",
  profile: "/onboarding",
  programDetail: (slug = ":slug") => `/programs/${slug}`,
  coachRequests: "/coach/requests",
  coachPrograms: "/coach/programs",
  coachProgramBuilder: (programId = ":programId") =>
    `/coach/programs/${programId}`,
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
