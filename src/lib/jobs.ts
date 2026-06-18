// Static client-side Airtable fetcher.
// Requires three Vite env vars (set in .env locally and as GitHub Actions
// build-time secrets when deploying to GitHub Pages):
//   VITE_AIRTABLE_TOKEN     – Personal Access Token, scope: data.records:read, this base only
//   VITE_AIRTABLE_BASE_ID   – e.g. appXXXXXXXXXXXXXX
//   VITE_AIRTABLE_TABLE     – table name or id (e.g. "Jobs")
//
// SECURITY NOTE: The token ships in the built JS bundle and is readable by
// anyone who visits the site. Always use a read-only PAT scoped to this base.

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend: string | null;
  eligibility: string | null;
  applyUrl: string;
  postedDate: string;
  verified: boolean;
  active: boolean;
  source: string | null;
};

type AirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
};

type AirtableResponse = {
  records: AirtableRecord[];
  offset?: string;
};

const TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN as string | undefined;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string | undefined;
const TABLE = (import.meta.env.VITE_AIRTABLE_TABLE as string | undefined) ?? "Jobs";

function assertConfig() {
  if (!TOKEN || !BASE_ID) {
    throw new Error(
      "Airtable is not configured. Set VITE_AIRTABLE_TOKEN and VITE_AIRTABLE_BASE_ID in your environment.",
    );
  }
}

function str(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join(", ");
  return String(v);
}

function nullable(v: unknown): string | null {
  const s = str(v).trim();
  return s ? s : null;
}

function bool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "yes", "1", "checked"].includes(v.toLowerCase());
  return Boolean(v);
}

function pick(fields: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (k in fields && fields[k] != null && fields[k] !== "") return fields[k];
  }
  return undefined;
}

function mapRecord(rec: AirtableRecord): Job {
  const f = rec.fields;
  return {
    id: rec.id,
    title: str(pick(f, ["Title", "title", "Job Title"])),
    company: str(pick(f, ["Company", "company", "Organization"])),
    location: str(pick(f, ["Location", "location"])),
    category: str(pick(f, ["Category", "category", "Type"])),
    stipend: nullable(pick(f, ["Stipend", "stipend", "Salary", "Compensation"])),
    eligibility: nullable(pick(f, ["Eligibility", "eligibility", "Requirements"])),
    applyUrl: str(pick(f, ["Apply URL", "ApplyURL", "applyUrl", "Apply Link", "Link", "URL"])),
    postedDate: str(pick(f, ["Posted Date", "PostedDate", "postedDate", "Posted", "Date"])) || rec.createdTime,
    verified: bool(pick(f, ["Verified", "verified"])),
    active: pick(f, ["Active", "active"]) === undefined ? true : bool(pick(f, ["Active", "active"])),
    source: nullable(pick(f, ["Source", "source"])),
  };
}

async function fetchAllRecords(): Promise<AirtableRecord[]> {
  assertConfig();
  const all: AirtableRecord[] = [];
  let offset: string | undefined;
  const base = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
  do {
    const url = new URL(base);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Airtable request failed (${res.status}): ${text}`);
    }
    const json = (await res.json()) as AirtableResponse;
    all.push(...json.records);
    offset = json.offset;
  } while (offset);
  return all;
}

export async function fetchJobs(): Promise<Job[]> {
  const records = await fetchAllRecords();
  return records
    .map(mapRecord)
    .filter((j) => j.active && j.title)
    .sort((a, b) => (b.postedDate || "").localeCompare(a.postedDate || ""));
}

export async function fetchJobById(id: string): Promise<Job | null> {
  assertConfig();
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${id}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Airtable request failed (${res.status}): ${text}`);
  }
  const rec = (await res.json()) as AirtableRecord;
  const job = mapRecord(rec);
  return job.active ? job : null;
}
