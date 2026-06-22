import { Construction } from "lucide-react";
import { PageHeader } from "../components/dashboard/StatCard";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={description} />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface py-20 text-center">
        <Construction className="mb-4 h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-text">Coming soon</p>
        <p className="mt-1 max-w-sm text-[12px] text-text-secondary">
          This module is defined in the architecture spec and will be implemented
          in the next development phase.
        </p>
      </div>
    </div>
  );
}
