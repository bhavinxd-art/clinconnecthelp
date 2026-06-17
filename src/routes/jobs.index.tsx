import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { listJobs } from "@/lib/airtable.functions";
import { JobCard } from "@/components/JobCard";
import { Search, X } from "lucide-react";

const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: () => listJobs(),
});

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  location: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/jobs/")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse jobs — ClinConnect" },
      { name: "description", content: "Search and filter verified healthcare jobs by location and category." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  component: JobsList,
});

function JobsList() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const { q, location, category } = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs" });

  const locations = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))).sort(),
    [jobs],
  );
  const categories = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.category).filter(Boolean))).sort(),
    [jobs],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (location && j.location !== location) return false;
      if (category && j.category !== category) return false;
      if (needle) {
        const hay = `${j.title} ${j.company} ${j.eligibility}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [jobs, q, location, category]);

  const update = (patch: Partial<{ q: string; location: string; category: string }>) =>
    navigate({ search: (prev: { q: string; location: string; category: string }) => ({ ...prev, ...patch }) });

  const hasFilters = Boolean(q || location || category);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Browse jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {filtered.length} of {jobs.length} roles
          {hasFilters ? " matching your filters" : ""}.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_200px_200px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search role, company or eligibility…"
            className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <select
          value={location}
          onChange={(e) => update({ location: e.target.value })}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => navigate({ search: { q: "", location: "", category: "" } })}
            className="inline-flex h-11 items-center justify-center gap-1 rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-secondary"
          >
            <X className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-medium">No matching roles</p>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </div>
    </div>
  );
}
