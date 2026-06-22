import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";

export function OptimizeBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent" />
      <div className="relative flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent-muted">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Ready to boost?</p>
            <p className="text-[12px] text-text-secondary">
              Run a system scan first, then apply Safe or Competitive boost.
            </p>
          </div>
        </div>
        <Link
          to="/boost"
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-void transition-opacity hover:opacity-90"
        >
          Start Boost
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
