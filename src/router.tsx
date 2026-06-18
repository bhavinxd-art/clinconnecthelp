import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
  createHashHistory,
  useSearch,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { queryOptions, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { fetchJobs, fetchJobById, type Job } from "./lib/jobs";
import { JobCard } from "./components/JobCard";
import { Search, ShieldCheck, Stethoscope, Sparkles, ArrowLeft, MapPin, Building2, CalendarDays, BadgeCheck, ExternalLink, Banknote, GraduationCap, Loader as Loader2, X, Target } from "lucide-react";

// Root layout route
const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">C</span>
          <span className="font-display text-lg font-bold tracking-tight">ClinConnect</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" activeOptions={{ exact: true }} activeProps={{ className: "rounded-md px-3 py-2 text-foreground bg-secondary" }}>Home</Link>
          <Link to="/jobs" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-foreground bg-secondary" }}>Jobs</Link>
          <Link to="/about" className="rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 text-foreground bg-secondary" }}>About</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} ClinConnect. Verified healthcare opportunities.</span>
        <nav className="flex flex-wrap gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
          <a href="mailto:clinconnecthelp@gmail.com" className="hover:text-foreground">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeComponent,
});

function HomeComponent() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-32 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading opportunities...</p>
      </div>
    );
  }

  if (error || !jobs) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-32 text-center">
        <p className="text-sm text-muted-foreground">Failed to load jobs. Please try again.</p>
      </div>
    );
  }

  const featured = jobs.slice(0, 6);
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
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
            <Search className="h-4 w-4" /> Browse all jobs
          </Link>
          <Link to="/jobs" search={{ category: "Intern" }} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium hover:bg-secondary">
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
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No jobs available yet. Check back soon.</div>
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

// Jobs list route
const jobsSearchSchema = z.object({
  q: z.string().optional().default(""),
  location: z.string().optional().default(""),
  category: z.string().optional().default(""),
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs",
  validateSearch: zodValidator(jobsSearchSchema),
  component: JobsComponent,
});

function JobsComponent() {
  const search = useSearch({ from: "/jobs" }) as z.infer<typeof jobsSearchSchema>;
  const router = useRouter();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const locations = jobs ? Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))).sort() : [];
  const categories = jobs ? Array.from(new Set(jobs.map((j) => j.category).filter(Boolean))).sort() : [];

  const filtered = jobs ? jobs.filter((j) => {
    const q = search.q?.toLowerCase() || "";
    if (search.location && j.location !== search.location) return false;
    if (search.category && j.category !== search.category) return false;
    if (q) {
      const hay = `${j.title} ${j.company} ${j.eligibility ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }) : [];

  const hasFilters = Boolean(search.q || search.location || search.category);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-32 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading opportunities...</p>
      </div>
    );
  }

  if (error || !jobs) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-32 text-center">
        <p className="text-sm text-muted-foreground">Failed to load jobs. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Browse jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">{filtered.length} of {jobs.length} roles{hasFilters ? " matching your filters" : ""}.</p>
      </header>
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_200px_200px_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search.q || ""}
            onChange={(e) => router.navigate({ to: "/jobs", search: { ...search, q: e.target.value } })}
            placeholder="Search role, company or eligibility…"
            className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <select
          value={search.location || ""}
          onChange={(e) => router.navigate({ to: "/jobs", search: { ...search, location: e.target.value } })}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All locations</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={search.category || ""}
          onChange={(e) => router.navigate({ to: "/jobs", search: { ...search, category: e.target.value } })}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => router.navigate({ to: "/jobs", search: { q: "", location: "", category: "" } })}
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

// Job detail route
const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs/$id",
  component: JobDetailComponent,
});

function JobDetailComponent() {
  const { id } = useParams({ from: "/jobs/$id" });

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJobById(id),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Job not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error ? "Failed to load job details." : "This job may have been removed."}</p>
        <Link to="/jobs" className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Back to jobs</Link>
      </div>
    );
  }

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
            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
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
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">{icon} {label}</div>
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

// About route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" /> About ClinConnect
      </span>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Bringing clinical opportunities into one place.</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>ClinConnect was created to make finding clinical research opportunities easier. As a pharmacy student interested in clinical research, I found that jobs and internships were scattered across many websites, LinkedIn posts, WhatsApp groups, and company pages.</p>
        <p>ClinConnect brings these opportunities together in one place so that students and professionals can find them more easily — without endlessly hopping between tabs and groups.</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><Target className="h-5 w-5" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Our mission</h2>
          <p className="mt-2 text-sm text-muted-foreground">Reduce the friction of discovering clinical research roles so candidates can spend their time preparing, not searching.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary"><Stethoscope className="h-5 w-5" /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Our vision</h2>
          <p className="mt-2 text-sm text-muted-foreground">A trusted, community-driven hub where every verified clinical opportunity — internship, residency or full-time — is one search away.</p>
        </div>
      </div>
      <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">Want to contribute?</h3>
        <p className="mt-2 text-sm text-muted-foreground">We're always looking to expand our listings. Reach out if you know of clinical opportunities we should include.</p>
        <a href="mailto:clinconnecthelp@gmail.com" className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">Contact us</a>
      </div>
    </div>
  );
}

// Disclaimer route
const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/disclaimer",
  component: DisclaimerComponent,
});

function DisclaimerComponent() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Legal
      </span>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Disclaimer</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">1. Informational purpose only</h2>
          <p className="mt-2">ClinConnect is an independent platform that aggregates publicly available clinical research and healthcare job listings. Content on this website is provided for general informational purposes only and does not constitute professional, legal, medical, or career advice.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">2. No employment relationship</h2>
          <p className="mt-2">ClinConnect is <strong>not</strong> a recruiter, employer, employment agency, or representative of any organization listed on this site. We do not participate in hiring decisions and have no authority to make offers on behalf of any company.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">3. Verification & accuracy</h2>
          <p className="mt-2">While we make reasonable efforts to verify the existence and source of listed opportunities, we cannot guarantee that any posting is accurate, current, complete, or legitimate. Roles may be filled, modified, or withdrawn by the employer at any time without notice to us.</p>
          <p className="mt-2">Always independently verify the employer, application process, and any requested information directly with the hiring organization before sharing personal details, paying any fee, or accepting an offer.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">4. Beware of fraud</h2>
          <p className="mt-2">Genuine healthcare and clinical research employers will never ask candidates to pay money, share banking credentials, or purchase equipment as a condition of applying or being hired. If something feels wrong, do not proceed and report the listing to us.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">5. External links</h2>
          <p className="mt-2">Apply links and contact details on ClinConnect direct you to third-party websites. We are not responsible for the content, privacy practices, or terms of those external sites.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">6. Limitation of liability</h2>
          <p className="mt-2">To the maximum extent permitted by law, ClinConnect and its operators disclaim all liability for any loss, damage, or harm arising from your use of, or reliance on, information provided on this site, including but not limited to lost opportunities, financial loss, or harm caused by interactions with third parties listed here.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">7. Contact</h2>
          <p className="mt-2">Questions, corrections, or requests to remove a listing? Email <a className="text-primary underline" href="mailto:clinconnecthelp@gmail.com">clinconnecthelp@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}

// Build route tree and export router
const routeTree = rootRoute.addChildren([indexRoute, jobsRoute, jobDetailRoute, aboutRoute, disclaimerRoute]);

export const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
