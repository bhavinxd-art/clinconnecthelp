import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/airtable";
const RESEND_GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const BASE_ID = "appqe7gxENsyISP8t";
const TABLE_ID = "tblRLuzNBNm1OBJ4R";
const NEWSLETTER_TABLE = "Newsletter Subscribers";
const NOTIFY_EMAIL = "clinconnecthelp@gmail.com";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend: string;
  eligibility: string;
  applyUrl: string;
  postedDate: string;
  verified: boolean;
  active: boolean;
  source: string;
};

type AirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
};

function mapRecord(r: AirtableRecord): Job {
  const f = r.fields;
  const s = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    id: r.id,
    title: s(f["Role"]) || "Untitled role",
    company: s(f["Organization"]) || "—",
    location: s(f["Location"]) || "Remote / Unspecified",
    category: s(f["Job type"]) || "Other",
    stipend: s(f["Stipend"]),
    eligibility: s(f["Eligibility"]),
    applyUrl: s(f["Contact / Link"]),
    postedDate: s(f["Date posted"]) || r.createdTime.slice(0, 10),
    verified: Boolean(f["Verified"]),
    active: Boolean(f["Active"]),
    source: s(f["Source"]),
  };
}

async function airtableFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<unknown> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const airtableKey = process.env.AIRTABLE_API_KEY;
  if (!lovableKey || !airtableKey) {
    throw new Error("Airtable connection is not configured");
  }
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": airtableKey,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Airtable request failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function sendNotificationEmail(subject: string, html: string): Promise<void> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!lovableKey || !resendKey) {
    // Email notifications are optional — log and continue.
    console.warn("[email] RESEND_API_KEY not configured; skipping notification");
    return;
  }
  try {
    const res = await fetch(`${RESEND_GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ClinConnect <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] send failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] send error", err);
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!
  ));
}

export const listJobs = createServerFn({ method: "GET" }).handler(async () => {
  const data = (await airtableFetch(
    `/v0/${BASE_ID}/${TABLE_ID}?pageSize=100`,
  )) as { records: AirtableRecord[] };
  return data.records.map(mapRecord);
});

export const getJob = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const r = (await airtableFetch(
      `/v0/${BASE_ID}/${TABLE_ID}/${encodeURIComponent(data.id)}`,
    )) as AirtableRecord;
    return mapRecord(r);
  });

const submissionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  company: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(60),
  eligibility: z.string().trim().max(500).optional().default(""),
  stipend: z.string().trim().max(120).optional().default(""),
  applyUrl: z.string().trim().url().max(500),
  contactEmail: z.string().trim().email().max(200),
  contactName: z.string().trim().min(1).max(120),
});

export const submitJob = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => submissionSchema.parse(d))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    await airtableFetch(`/v0/${BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      body: {
        records: [
          {
            fields: {
              "Role": data.title,
              "Organization": data.company,
              "Location": data.location,
              "Job type": data.category,
              "Stipend": data.stipend,
              "Eligibility": data.eligibility,
              "Contact / Link": data.applyUrl,
              "Date posted": today,
              "Source": `Submitted by ${data.contactName} <${data.contactEmail}>`,
              "Verified": false,
              "Active": false,
            },
          },
        ],
      },
    });

    const rows: [string, string][] = [
      ["Job Title", data.title],
      ["Company", data.company],
      ["Location", data.location],
      ["Job Type", data.category],
      ["Stipend / Salary", data.stipend || "—"],
      ["Eligibility / Description", data.eligibility || "—"],
      ["Application Link", data.applyUrl],
      ["Contact Name", data.contactName],
      ["Contact Email", data.contactEmail],
      ["Submission Date", today],
    ];
    const html = `
      <h2 style="font-family:sans-serif;color:#0f172a">New Job Submission Received</h2>
      <p style="font-family:sans-serif;color:#334155">A new job was submitted via ClinConnect.</p>
      <table style="font-family:sans-serif;border-collapse:collapse;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#64748b;vertical-align:top"><strong>${escapeHtml(k)}</strong></td><td style="padding:6px 0;color:#0f172a">${escapeHtml(v)}</td></tr>`).join("")}
      </table>
    `;
    await sendNotificationEmail("New Job Submission Received", html);
    return { ok: true as const };
  });

const newsletterSchema = z.object({
  email: z.string().trim().email().max(200),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => newsletterSchema.parse(d))
  .handler(async ({ data }) => {
    const today = new Date().toISOString().slice(0, 10);
    await airtableFetch(`/v0/${BASE_ID}/${encodeURIComponent(NEWSLETTER_TABLE)}`, {
      method: "POST",
      body: {
        records: [
          {
            fields: {
              "Email": data.email,
              "Date Subscribed": today,
            },
          },
        ],
      },
    });
    const html = `
      <h2 style="font-family:sans-serif;color:#0f172a">New ClinConnect Newsletter Subscriber</h2>
      <p style="font-family:sans-serif;color:#334155">New newsletter subscription received.</p>
      <p style="font-family:sans-serif;font-size:14px"><strong>Email:</strong> ${escapeHtml(data.email)}<br/><strong>Date:</strong> ${today}</p>
    `;
    await sendNotificationEmail("New ClinConnect Newsletter Subscriber", html);
    return { ok: true as const };
  });
