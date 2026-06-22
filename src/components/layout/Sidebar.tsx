import { NavLink } from "react-router-dom";
import {
  Flame,
  Gamepad2,
  Globe,
  LayoutDashboard,
  RotateCcw,
  ScanSearch,
  Settings,
  SlidersHorizontal,
  Trash2,
  Zap,
} from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function NavItem({ path, label, icon: Icon }: { path: string; label: string; icon: typeof Zap }) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-accent-muted text-accent shadow-[inset_0_0_0_1px_#22d3ee33]"
            : "text-text-secondary hover:bg-elevated hover:text-text",
        ].join(" ")
      }
    >
      <Icon className="h-[15px] w-[15px] shrink-0 opacity-70 group-hover:opacity-100" />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const { t } = useI18n();

  const navMain = [
    { path: "/", label: t("nav.overview"), icon: LayoutDashboard },
    { path: "/scanner", label: t("nav.scanner"), icon: ScanSearch },
    { path: "/tweaks", label: t("nav.tweaks"), icon: SlidersHorizontal },
    { path: "/boost", label: t("nav.boost"), icon: Zap },
  ] as const;

  const navTools = [
    { path: "/cleaner", label: t("nav.cleaner"), icon: Trash2 },
    { path: "/restore", label: t("nav.rollback"), icon: RotateCcw },
    { path: "/games", label: t("nav.games"), icon: Gamepad2 },
    { path: "/network", label: t("nav.network"), icon: Globe },
  ] as const;

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-elevated glow-accent">
            <Flame className="h-4 w-4 text-accent" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold tracking-tight text-text">FPS Unleashed</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
              {t("brand.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3">
        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
            {t("nav.performance")}
          </p>
          <div className="flex flex-col gap-0.5">
            {navMain.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
            {t("nav.tools")}
          </p>
          <div className="flex flex-col gap-0.5">
            {navTools.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <LanguageSwitcher />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all",
              isActive
                ? "bg-accent-muted text-accent"
                : "text-text-secondary hover:bg-elevated hover:text-text",
            ].join(" ")
          }
        >
          <Settings className="h-[15px] w-[15px]" />
          {t("nav.settings")}
        </NavLink>
        <p className="mt-2 px-3 font-mono text-[10px] text-muted">build 0.1.0</p>
      </div>
    </aside>
  );
}
