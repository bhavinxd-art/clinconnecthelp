import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { subscribeNewsletter } from "@/lib/airtable.functions";

export function NewsletterSection() {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await subscribe({ data: { email } });
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              <Mail className="h-3.5 w-3.5" /> Weekly digest
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl">
              Get Weekly Job Alerts
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              New CRC, CRA Trainee, CTA, Pharmacovigilance and Clinical Research opportunities delivered directly to your inbox every week. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {status === "ok" ? (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
            <p className="font-medium text-foreground">Thanks for subscribing to ClinConnect Job Alerts.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Subscribe
            </button>
          </form>
        )}

        {status === "error" && (
          <div className="mt-3 flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || "Could not subscribe. Please try again."}</span>
          </div>
        )}
      </div>
    </section>
  );
}
