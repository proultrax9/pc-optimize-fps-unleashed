export type Locale = "en" | "th";

export type Messages = {
  brand: { subtitle: string };
  nav: {
    performance: string;
    tools: string;
    overview: string;
    scanner: string;
    tweaks: string;
    boost: string;
    cleaner: string;
    rollback: string;
    games: string;
    network: string;
    settings: string;
  };
  common: {
    admin: string;
    restart: string;
    restorePoint: string;
    advisor: string;
    openGuide: string;
    active: string;
    live: string;
    syncing: string;
    save: string;
    saved: string;
    more: string;
    risk: string;
  };
  risk: { safe: string; medium: string; high: string; extreme: string };
  categories: {
    windows: string;
    gpu: string;
    cpu: string;
    network: string;
    advanced: string;
  };
  pages: Record<string, { title: string; subtitle: string; [key: string]: string }>;
  tweaks: Record<string, { name: string; desc: string }>;
  boost: Record<string, { name: string; tagline: string; warning: string }>;
  guides: Record<
    string,
    { title: string; summary: string; warning?: string; steps: string[] }
  >;
  guideUi: Record<string, string>;
  verify: Record<string, Record<string, string>>;
};
