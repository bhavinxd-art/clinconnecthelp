import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent/30"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ClinConnect — Healthcare jobs & internships" },
      { name: "description", content: "Find verified healthcare roles, internships and clinical opportunities on ClinConnect." },
      { property: "og:title", content: "ClinConnect" },
      { property: "og:description", content: "Verified healthcare jobs and internships." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
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
          <Link to="/post-job" className="ml-1 rounded-md bg-primary px-3 py-2 text-primary-foreground hover:opacity-90">Post a job</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">C</span>
              <span className="font-display text-lg font-bold tracking-tight">ClinConnect</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              India's dedicated clinical research job platform for pharmacy, life sciences, biotechnology and healthcare professionals.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a href="#" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="mailto:clinconnecthelp@gmail.com" aria-label="Email" className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </a>
            </div>
          </div>

          <FooterCol title="For Students" links={[
            { to: "/jobs", label: "Browse Jobs" },
            { to: "/jobs", label: "Job Categories" },
            { to: "/about", label: "Career Guide" },
          ]} />

          <FooterCol title="For Recruiters" links={[
            { to: "/post-job", label: "Post a Job" },
            { to: "/post-job", label: "Pricing" },
            { href: "mailto:clinconnecthelp@gmail.com", label: "Contact Us" },
          ]} />

          <FooterCol title="Legal" links={[
            { to: "/disclaimer", label: "Privacy Policy" },
            { to: "/disclaimer", label: "Terms of Use" },
          ]} />
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} ClinConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

type FooterLink = { label: string; to?: string; href?: string };
function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} className="text-muted-foreground hover:text-foreground">{l.label}</Link>
            ) : (
              <a href={l.href} className="text-muted-foreground hover:text-foreground">{l.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1"><Outlet /></main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
