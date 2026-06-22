type HardwareDetailRowProps = {
  label: string;
  value: string;
  loading?: boolean;
};

export function HardwareDetailRow({ label, value, loading }: HardwareDetailRowProps) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-text">{label}</p>
      {loading ? (
        <div className="mt-2 h-10 animate-pulse rounded-lg bg-elevated" />
      ) : (
        <div className="mt-2 rounded-lg border border-border bg-elevated px-3 py-2.5">
          <p className="font-mono text-[13px] text-text-secondary">{value || "—"}</p>
        </div>
      )}
    </div>
  );
}

type HardwareDetailsPanelProps = {
  loading?: boolean;
  fields: Array<{ label: string; value: string }>;
};

export function HardwareDetailsPanel({ loading, fields }: HardwareDetailsPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted">
        System Details
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <HardwareDetailRow
            key={field.label}
            label={field.label}
            value={field.value}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}
