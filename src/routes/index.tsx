import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { listJobs } from "@/lib/airtable.functions";
import { JobCard } from "@/components/JobCard";
import { Search, ShieldCheck, Stethoscope, ArrowRight, CheckCircle2 } from "lucide-react";
import heroDoctor from "@/assets/hero-doctor.jpg";

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
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary-soft/40 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Clinical Research Jobs Portal
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Your Gateway to <span className="text-accent">Clinical Research</span> Careers
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Explore jobs, internships, and opportunities from hospitals, CROs, SMOs, and research organizations across India.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <Search className="h-4 w-4" /> Browse Jobs
              </Link>
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 rounded-lg border border-accent bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90"
              >
                Post a Job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
              <Stat label="Open roles" value={stats.total} />
              <Stat label="Verified" value={stats.verified} />
              <Stat label="Categories" value={stats.categories} />
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-accent/20 via-primary/10 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
              <img
                src={heroDoctor}
                alt="Clinical research professional"
                className="aspect-square w-full object-cover"
                width={1024}
                height={1024}
              />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-card p-4 shadow-lg sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Stethoscope className="h-5 w-5" />
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-primary">Verified employers</p>
                  <p className="text-xs text-muted-foreground">Hospitals · CROs · SMOs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
