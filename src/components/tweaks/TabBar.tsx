type TabBarProps<T extends string> = {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
};

export function TabBar<T extends string>({ tabs, active, onChange }: TabBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={[
            "rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
            active === tab.id
              ? "bg-accent-muted text-accent shadow-[inset_0_0_0_1px_#22d3ee33]"
              : "text-text-secondary hover:text-text",
          ].join(" ")}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 font-mono text-[10px] opacity-60">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
