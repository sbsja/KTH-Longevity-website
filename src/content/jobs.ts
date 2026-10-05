import type { JobListing } from "./types";

/**
 * The job board. Add a record only for an opportunity the board has approved
 * for publication, with a verified public application link. Listings whose
 * deadline has passed, or whose status is "closed", move to the expired list
 * automatically; delete them when they are no longer worth showing.
 *
 * There are no approved listings yet (October 2026). The sponsor spreadsheet
 * and the autumn 2026 team recruitment form are not vacancies and are not
 * reproduced here. See docs/CONTENT-SOURCES.md.
 */
export const jobs: JobListing[] = [];

export const jobsIntro = {
  title: "Opportunities to work on ageing",
  lede: "Roles in the association and positions at organisations working on longevity, posted here once they are confirmed with whoever is offering them.",
};

export type JobState = "open" | "expired";

/** A listing is open until its deadline has passed (inclusive) or it is closed by hand. */
export function jobState(job: JobListing, today: Date = new Date()): JobState {
  if (job.status === "closed") return "expired";
  if (!job.deadline) return "open";
  const end = new Date(`${job.deadline}T23:59:59`);
  return end.getTime() >= today.getTime() ? "open" : "expired";
}

export function splitJobs(all: JobListing[], today: Date = new Date()): { open: JobListing[]; expired: JobListing[] } {
  const open = all.filter((j) => jobState(j, today) === "open").sort(byDeadlineThenPosted);
  const expired = all.filter((j) => jobState(j, today) === "expired").sort((a, b) => (b.deadline ?? b.postedOn).localeCompare(a.deadline ?? a.postedOn));
  return { open, expired };
}

function byDeadlineThenPosted(a: JobListing, b: JobListing): number {
  // Soonest deadline first; listings without a deadline after those with one; newest posting first among equals.
  if (a.deadline && b.deadline && a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline);
  if (a.deadline && !b.deadline) return -1;
  if (!a.deadline && b.deadline) return 1;
  return b.postedOn.localeCompare(a.postedOn);
}

export function formatJobDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
