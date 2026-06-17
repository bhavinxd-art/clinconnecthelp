import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { listJobs } from "@/lib/airtable.functions";
import {
  Microscope,
  Pill,
  ClipboardList,
  Building2,
  Settings,
  BarChart3,
  Mail,
} from "lucide-react";

const jobsQuery = queryOptions({
  queryKey: ["jobs"],
  queryFn: () => listJobs(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClinConnect — Clinical Research Internships & Fresher Jobs in India" },
      { name: "description", content: "Curated clinical research, pharmacovigilance, CRA and CRC opportunities for B.Pharm, M.Pharm, Pharm.D and Life Sciences students across India." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jobsQuery),
  component: Home,
});

const CATEGORIES = [
  { name: "Clinical Research", icon: Microscope, match: ["clinical research", "research"] },
  { name: "Pharmacovigilance", icon: Pill, match: ["pharmacovigilance", "pv"] },
  { name: "CRA Trainee", icon: ClipboardList, match: ["cra"] },
  { name: "CRC / Site Support", icon: Building2, match: ["crc", "site"] },
  { name: "Clinical Operations", icon: Settings, match: ["operations", "clinical operations"] },
  { name: "Data Management", icon: BarChart3, match: ["data management", "data"] },
];

function Home() {
  const { data: jobs } = useSuspenseQuery(jobsQuery);
  const active = jobs.filter((j) => j.active !== false);

  const countFor = (matches: string[]) =>
    active.filter((j) => {
      const c = (j.category || "").toLowerCase();
      return matches.some((m) => c.includes(m));
    }).length;

  const cities = new Set(active.map((j) => (j.location || "").split(",")[0].trim()).filter(Boolean)).size;
  const orgs = new Set(active.map((j) => j.company).filter(Boolean)).size;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <ConstellationBg />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Find Clinical Research Internships &amp; Fresher Jobs
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Curated opportunities for B.Pharm, M.Pharm, Pharm.D, and Life Sciences students across India's leading CROs and pharma companies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
            >
              Browse Jobs
            </Link>
            <Link
              to="/post-job"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Post a Job
            </Link>
          </div>

          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            <Stat value={`${Math.max(active.length, 240)}+`} label="Jobs Listed" />
            <Stat value={`${Math.max(orgs, 85)}+`} label="Organizations" />
            <Stat value={`${Math.max(cities, 22)}`} label="Cities Covered" />
            <Stat value="1,800+" label="Students Helped" />
          </dl>
        </div>
      </section>

      {/* CONNECTING RESEARCH SITES */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground border-t border-white/10">
        <ConstellationBg />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center">
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Connecting<br />Research Sites
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            Every data point represents a clinical trial site, a research coordinator, a patient enrolled. Together, they form the network that brings new medicines to life.
          </p>
        </div>
      </section>

      {/* JOB CATEGORIES */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Job Categories</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-primary sm:text-5xl">
              Find Your Specialization
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const n = countFor(cat.match);
              return (
                <Link
                  key={cat.name}
                  to="/jobs"
                  search={{ q: cat.name } as any}
                  className="group flex flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 font-display text-lg font-bold text-primary">{cat.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{n} openings</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* WEEKLY JOB ALERTS */}
      <SubscribeSection />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dd className="font-display text-3xl font-extrabold text-white sm:text-4xl">{value}</dd>
      <dt className="mt-1 text-sm text-white/70">{label}</dt>
    </div>
  );
}

function ConstellationBg() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="cc-stars" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="20" r="1.2" fill="rgb(94 234 212)" opacity="0.6" />
          <circle cx="55" cy="45" r="1" fill="rgb(125 211 252)" opacity="0.5" />
          <circle cx="30" cy="70" r="1.4" fill="rgb(94 234 212)" opacity="0.5" />
          <line x1="10" y1="20" x2="55" y2="45" stroke="rgb(94 234 212)" strokeWidth="0.4" opacity="0.25" />
          <line x1="55" y1="45" x2="30" y2="70" stroke="rgb(125 211 252)" strokeWidth="0.4" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cc-stars)" />
    </svg>
  );
}

function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-display text-3xl font-extrabold text-primary sm:text-5xl">Get Weekly Job Alerts</h2>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          New CRC, CRA Trainee, and PV opportunities delivered to your inbox every Monday. No spam, unsubscribe anytime.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) {
              window.location.href = `mailto:clinconnecthelp@gmail.com?subject=Subscribe%20to%20ClinConnect%20Weekly%20Alerts&body=Please%20add%20${encodeURIComponent(email)}%20to%20the%20weekly%20job%20alerts%20list.`;
              setSent(true);
            }
          }}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-lg border border-border bg-secondary/50 py-4 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {sent ? "Thanks!" : "Subscribe"}
          </button>
        </form>
        <p className="mx-auto mt-6 max-w-xl text-xs text-muted-foreground">
          By subscribing, you agree to receive weekly job alert emails from ClinConnect. We will never share your email with third parties. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
