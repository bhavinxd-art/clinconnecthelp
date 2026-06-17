import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getJob } from "@/lib/airtable.functions";
import { ArrowLeft, MapPin, Building2, CalendarDays, BadgeCheck, ExternalLink, Banknote, GraduationCap } from "lucide-react";

const jobQuery = (id: string) =>
  queryOptions({
    queryKey: ["job", id],
    queryFn: () => getJob({ data: { id } }),
  });

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(jobQuery(params.id)),
  head: () => ({ meta: [{ title: "Job details — ClinConnect" }] }),
  component: JobDetail,
  errorComponent: ErrorView,
  notFoundComponent: () => <NotFound />,
});

function JobDetail() {
  const { id } = Route.useParams();
  const { data: job } = useSuspenseQuery(jobQuery(id));

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <article className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-base text-muted-foreground">
              <Building2 className="h-4 w-4" /> {job.company}
            </p>
          </div>
          {job.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Meta icon={<MapPin className="h-4 w-4" />} label="Location" value={job.location} />
          <Meta icon={<CalendarDays className="h-4 w-4" />} label="Posted" value={formatDate(job.postedDate)} />
          {job.category && <Meta icon={<GraduationCap className="h-4 w-4" />} label="Job type" value={job.category} />}
          {job.stipend && <Meta icon={<Banknote className="h-4 w-4" />} label="Stipend" value={job.stipend} />}
        </div>

        {job.eligibility && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Eligibility</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{job.eligibility}</p>
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {job.applyUrl ? (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Apply now <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">No application link provided.</span>
          )}
          {job.source && <span className="text-xs text-muted-foreground">Source: {job.source}</span>}
        </div>
      </article>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Couldn't load this job</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={() => { router.invalidate(); reset(); }}
        className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Job not found</h1>
      <Link to="/jobs" className="mt-4 inline-block text-sm text-primary hover:underline">Back to jobs</Link>
    </div>
  );
}
