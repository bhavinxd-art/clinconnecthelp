import { Link } from "@tanstack/react-router";
import type { Job } from "@/lib/airtable.functions";
import { MapPin, Building2, CalendarDays, BadgeCheck } from "lucide-react";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      to="/jobs/$id"
      params={{ id: job.id }}
      className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> {job.company}
          </p>
        </div>
        {job.verified && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/20 px-2 py-1 text-xs font-medium text-accent-foreground">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(job.postedDate)}</span>
        {job.category && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
            {job.category}
          </span>
        )}
      </div>
    </Link>
  );
}
