import { supabase } from "./supabase";

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

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend: string | null;
  eligibility: string | null;
  apply_url: string;
  posted_date: string;
  verified: boolean;
  active: boolean;
  source: string | null;
};

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    category: row.category,
    stipend: row.stipend,
    eligibility: row.eligibility,
    applyUrl: row.apply_url,
    postedDate: row.posted_date,
    verified: row.verified,
    active: row.active,
    source: row.source,
  };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("active", true)
    .order("posted_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch jobs:", error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }

  return data.map(mapJob);
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Failed to fetch job:", error);
    throw new Error(`Failed to fetch job: ${error.message}`);
  }

  return data ? mapJob(data) : null;
}
