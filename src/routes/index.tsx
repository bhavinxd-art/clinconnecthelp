import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listJobs } from "@/lib/airtable.functions";
import { JobCard } from "@/components/JobCard";
import { Search, ShieldCheck, Stethoscope, Sparkles } from "lucide-react";

const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: () => listJobs(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClinConnect — Healthcare jobs, internships & clinical roles" },
      { name: "description", content: "Discover verified healthcare and clinical opportunities. Search, filter and apply in one place." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  component: Home,
});

function Home() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const featured = jobs.filter((j) => j.active !== false).slice(0, 6);
  const stats = {
    total: jobs.length,
    verified: jobs.filter((j) => j.verified).length,
    categories: new Set(jobs.map((j) => j.category).filter(Boolean)).size,
  };

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-16 sm:pt-24">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Curated for healthcare students & professionals
        </div>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
          Your Gateway to <span className="text-primary">Clinical Research</span> Careers
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Explore jobs, internships, and opportunities from hospitals, CROs, SMOs, and research organizations across India.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Search className="h-4 w-4" /> Browse all jobs
          </Link>
          <Link
            to="/jobs"
            search={{ category: "Intern" }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary"
          >
            <Stethoscope className="h-4 w-4" /> Internships
          </Link>
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-4 sm:max-w-md">
          <Stat label="Open roles" value={stats.total} />
          <Stat label="Verified" value={stats.verified} />
          <Stat label="Categories" value={stats.categories} />
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Latest opportunities</h2>
            <p className="text-sm text-muted-foreground">A snapshot from our verified employer network.</p>
          </div>
          <Link to="/jobs" className="text-sm font-medium text-primary hover:underline">View all →</Link>
        </div>
        {featured.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="flex items-start gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold">Every posting, verified.</h3>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                We cross-check organizations, listing sources and last-verified dates before a role goes live — so you spend less time second-guessing and more time applying.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-display text-2xl font-bold text-foreground">{value}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
      No jobs available yet. Check back soon.
    </div>
  );
}
