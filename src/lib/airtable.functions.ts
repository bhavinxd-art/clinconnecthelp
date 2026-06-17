import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/airtable";
const BASE_ID = "appqe7gxENsyISP8t";
const TABLE_ID = "tblRLuzNBNm1OBJ4R";

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

async function airtableFetch(path: string): Promise<unknown> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const airtableKey = process.env.AIRTABLE_API_KEY;
  if (!lovableKey || !airtableKey) {
    throw new Error("Airtable connection is not configured");
  }
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": airtableKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Airtable request failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
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
