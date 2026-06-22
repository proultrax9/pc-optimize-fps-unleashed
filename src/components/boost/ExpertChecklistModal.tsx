import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldOff,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExpertGuide } from "../../data/expert-guides";
import { toAdvisorScanPayload } from "../../data/expert-guides";
import { api } from "../../lib/api";
import { useI18n } from "../../i18n/I18nProvider";
import type { AdvisorFinding, GuideAdvisorResult, StepVerification } from "../../types/api";

type ExpertChecklistModalProps = {
  open: boolean;
  guides: ExpertGuide[];
  focusId?: string | null;
  onClose: () => void;
};

function statusStyles(status: string) {
  switch (status) {
    case "pass":
    case "verified":
      return "border-success/30 bg-success/10 text-success";
    case "warn":
    case "pending":
      return "border-warning/30 bg-warning/10 text-warning";
    case "failed":
      return "border-danger/30 bg-danger/10 text-danger";
    default:
      return "border-border bg-elevated text-text-secondary";
  }
}

function stepStatusLabel(
  status: string,
  t: (key: string) => string,
) {
  switch (status) {
    case "verified":
      return t("guideUi.statusVerified");
    case "pending":
      return t("guideUi.statusPending");
    case "failed":
      return t("guideUi.statusFailed");
    default:
      return t("guideUi.statusManual");
  }
}

function AdvisorScanBlock({
  scanning,
  results,
  t,
}: {
  scanning: boolean;
  results: GuideAdvisorResult | undefined;
  t: (key: string) => string;
}) {
  if (scanning) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-3 text-[12px] text-accent">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("guideUi.scanning")}
      </div>
    );
  }

  if (!results || results.findings.length === 0) return null;

  return (
    <div className="mb-4 space-y-2 rounded-lg border border-accent/20 bg-accent/5 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-accent">
        <ScanLine className="h-3.5 w-3.5" />
        {t("guideUi.liveScan")}
      </div>
      {results.findings.map((finding) => (
        <AdvisorFindingRow key={finding.label} finding={finding} />
      ))}
    </div>
  );
}

function AdvisorFindingRow({ finding }: { finding: AdvisorFinding }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-text">{finding.label}</p>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-medium uppercase ${statusStyles(finding.status)}`}
        >
          {finding.value}
        </span>
      </div>
      {finding.recommendation && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
          {finding.recommendation}
        </p>
      )}
    </div>
  );
}

function stepVerificationFor(
  results: GuideAdvisorResult | undefined,
  stepIndex: number,
): StepVerification | undefined {
  return results?.steps.find((s) => s.stepIndex === stepIndex);
}

export function ExpertChecklistModal({
  open,
  guides,
  focusId,
  onClose,
}: ExpertChecklistModalProps) {
  const { t } = useI18n();
  const [checked, setChecked] = useState<Record<string, Set<number>>>({});
  const [scanResults, setScanResults] = useState<GuideAdvisorResult[]>([]);
  const [scanning, setScanning] = useState(false);
  const [riskWaived, setRiskWaived] = useState(false);
  const [waiving, setWaiving] = useState(false);

  const scanMap = useMemo(
    () => Object.fromEntries(scanResults.map((r) => [r.guideId, r])),
    [scanResults],
  );

  const runScan = useCallback(async () => {
    if (guides.length === 0) return;
    setScanning(true);
    try {
      const results = await api.runAdvisorScan(toAdvisorScanPayload(guides));
      setScanResults(results);

      setChecked((prev) => {
        const next = { ...prev };
        for (const result of results) {
          const set = new Set(next[result.guideId] ?? []);
          for (const step of result.steps) {
            if (step.status === "verified") {
              set.add(step.stepIndex);
            }
          }
          next[result.guideId] = set;
        }
        return next;
      });
    } finally {
      setScanning(false);
    }
  }, [guides]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !focusId) return;
    const el = document.getElementById(`guide-${focusId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open, focusId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void api.getExpertRiskStatus().then((status) => {
      if (!cancelled) setRiskWaived(status.waived);
    });
    void runScan();
    return () => {
      cancelled = true;
    };
  }, [open, runScan]);

  const handleWaiveRisk = async () => {
    const ok = window.confirm(t("guideUi.waiveConfirm"));
    if (!ok) return;

    setWaiving(true);
    try {
      const result = await api.waiveExpertRisk();
      if (result.success) {
        setRiskWaived(true);
        setChecked((prev) => {
          const next = { ...prev };
          for (const guide of guides) {
            next[guide.id] = new Set(guide.steps.map((_, i) => i));
          }
          return next;
        });
      } else {
        window.alert(result.message);
      }
    } finally {
      setWaiving(false);
    }
  };

  const handleDone = () => {
    if (!riskWaived && !allClear) {
      const ok = window.confirm(t("guideUi.closeConfirm"));
      if (!ok) return;
    }
    onClose();
  };

  if (!open) return null;

  const toggleStep = (guideId: string, stepIndex: number) => {
    setChecked((prev) => {
      const next = { ...prev };
      const set = new Set(next[guideId] ?? []);
      if (set.has(stepIndex)) set.delete(stepIndex);
      else set.add(stepIndex);
      next[guideId] = set;
      return next;
    });
  };

  const totalSteps = guides.reduce((n, g) => n + g.steps.length, 0);
  const doneSteps = guides.reduce((n, g) => n + (checked[g.id]?.size ?? 0), 0);
  const verifiableTotal = guides.reduce(
    (n, g) => n + g.steps.filter((s) => s.verifyKey).length,
    0,
  );
  const verifiablePassed = scanResults.reduce(
    (n, r) => n + r.steps.filter((s) => s.status === "verified").length,
    0,
  );
  const verifiableFailed = scanResults.reduce(
    (n, r) => n + r.steps.filter((s) => s.status === "failed" || s.status === "pending").length,
    0,
  );

  const manualTotal = totalSteps - verifiableTotal;
  const manualDone = guides.reduce((n, g) => {
    return (
      n +
      g.steps.reduce((acc, step, idx) => {
        if (step.verifyKey) return acc;
        return acc + (checked[g.id]?.has(idx) ? 1 : 0);
      }, 0)
    );
  }, 0);

  const allClear =
    riskWaived ||
    (verifiableFailed === 0 && manualDone === manualTotal && verifiablePassed === verifiableTotal);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expert-checklist-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              {t("guideUi.mode")}
            </p>
            <h2 id="expert-checklist-title" className="mt-1 text-lg font-bold text-text">
              {t("guideUi.title")}
            </h2>
            <p className="mt-1 text-[12px] text-text-secondary">{t("guideUi.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void runScan()}
              disabled={scanning}
              className="rounded-md border border-border bg-elevated p-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              aria-label="Refresh scan"
              title="สแกนใหม่"
            >
              <RefreshCw className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-elevated p-2 text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
              aria-label="Close checklist"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border bg-card/50 px-5 py-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{
                width: totalSteps ? `${(doneSteps / totalSteps) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] text-muted">
            {scanning
              ? t("guideUi.scanningProgress")
              : t("guideUi.progress", {
                  verified: verifiablePassed,
                  total: verifiableTotal,
                  done: doneSteps,
                  steps: totalSteps,
                })}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {riskWaived && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-3">
              <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <p className="text-[12px] leading-relaxed text-danger">{t("guideUi.riskWaivedBanner")}</p>
            </div>
          )}

          <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/25 bg-warning/5 px-3 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-[12px] leading-relaxed text-text-secondary">{t("guideUi.warnBanner")}</p>
          </div>

          <div className="space-y-4">
            {guides.map((guide, guideIndex) => {
              const done = checked[guide.id]?.size ?? 0;
              const guideScan = scanMap[guide.id];
              return (
                <section
                  key={guide.id}
                  id={`guide-${guide.id}`}
                  className="rounded-lg border border-border bg-card"
                >
                  <div className="border-b border-border px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[14px] font-semibold text-text">
                        {guideIndex + 1}. {guide.title}
                      </h3>
                      <span className="rounded border border-border bg-elevated px-2 py-0.5 text-[10px] font-medium text-muted">
                        {guide.risk} {t("common.risk")}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-text-secondary">{guide.summary}</p>
                    {guide.warning && (
                      <p className="mt-2 text-[11px] text-warning">{guide.warning}</p>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <AdvisorScanBlock scanning={scanning} results={guideScan} t={t} />
                  </div>

                  <p className="border-t border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
                    {t("guideUi.manualSteps")}
                  </p>

                  <ol className="divide-y divide-border">
                    {guide.steps.map((step, stepIndex) => {
                      const isDone = checked[guide.id]?.has(stepIndex) ?? false;
                      const verification = stepVerificationFor(guideScan, stepIndex);
                      const autoVerified = verification?.status === "verified";
                      const showVerify = Boolean(step.verifyKey && verification);

                      return (
                        <li key={stepIndex}>
                          <button
                            type="button"
                            onClick={() => toggleStep(guide.id, stepIndex)}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-card-hover"
                          >
                            <span
                              className={[
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                                isDone || autoVerified
                                  ? "border-accent bg-accent text-void"
                                  : "border-border bg-elevated text-transparent",
                              ].join(" ")}
                            >
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={[
                                  "block text-[12px] leading-relaxed",
                                  isDone || autoVerified
                                    ? "text-muted line-through"
                                    : "text-text-secondary",
                                ].join(" ")}
                              >
                                <span className="font-mono text-[10px] text-muted">
                                  {stepIndex + 1}.{" "}
                                </span>
                                {step.text}
                              </span>
                              {showVerify && verification && (
                                <span className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded border px-2 py-0.5 text-[10px] font-medium ${statusStyles(verification.status)}`}
                                  >
                                    {stepStatusLabel(verification.status, t)}
                                  </span>
                                  <span className="text-[10px] text-muted">
                                    {t(
                                      `verify.${verification.verifyKey}.${verification.status}`,
                                      undefined,
                                      verification.detail,
                                    )}
                                  </span>
                                </span>
                              )}
                              {step.verifyKey && !verification && !scanning && (
                                <span className="mt-1 block text-[10px] text-muted">
                                  {t("guideUi.waitingScan")}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>

                  <p className="border-t border-border px-4 py-2 text-[10px] text-muted">
                    {t("guideUi.stepsCompleted", {
                      done,
                      total: guide.steps.length,
                    })}
                    {guideScan &&
                      ` · ${guideScan.steps.filter((s) => s.status === "verified").length} ${t("guideUi.autoVerified")}`}
                  </p>
                </section>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 border-t border-border px-5 py-3">
          {!riskWaived && verifiableFailed > 0 && (
            <p className="text-center text-[11px] text-warning">
              {t("guideUi.pendingCount", { count: verifiableFailed })}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleWaiveRisk()}
            disabled={waiving || riskWaived}
            className="w-full rounded-md border border-danger/40 bg-danger/10 py-2.5 text-[12px] font-semibold text-danger transition-opacity hover:bg-danger/15 disabled:opacity-50"
          >
            {riskWaived
              ? t("guideUi.waiveBtnDone")
              : waiving
                ? t("guideUi.saving")
                : t("guideUi.waiveBtn")}
          </button>
          <button
            type="button"
            onClick={handleDone}
            className={[
              "w-full rounded-md py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90",
              allClear ? "bg-accent text-void" : "border border-border bg-elevated text-text-secondary",
            ].join(" ")}
          >
            {allClear ? t("guideUi.doneClear") : t("guideUi.donePartial")}
          </button>
        </div>
      </div>
    </div>
  );
}
