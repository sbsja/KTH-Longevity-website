import { describe, expect, it } from "vitest";
import { formatJobDate, jobState, jobs, splitJobs } from "@/content/jobs";
import type { JobListing } from "@/content/types";

const base: JobListing = {
  id: "x",
  title: "Research assistant",
  organisation: "Example Lab",
  location: "Stockholm",
  type: "Research position",
  applyUrl: "https://example.test/apply",
  postedOn: "2026-10-01",
};

describe("job board", () => {
  it("has no listings until the board approves some", () => {
    expect(jobs).toEqual([]);
  });
  it("treats a listing as open through its deadline day and expired after it", () => {
    const job = { ...base, deadline: "2026-10-20" };
    expect(jobState(job, new Date("2026-10-20T12:00:00"))).toBe("open");
    expect(jobState(job, new Date("2026-10-21T00:00:01"))).toBe("expired");
    expect(jobState(base, new Date("2030-01-01"))).toBe("open");
    expect(jobState({ ...base, status: "closed" }, new Date("2026-10-01"))).toBe("expired");
  });
  it("splits and orders listings: soonest deadline first, open-ended last, newest closed first", () => {
    const today = new Date("2026-10-05T10:00:00");
    const all: JobListing[] = [
      { ...base, id: "a", deadline: "2026-11-01" },
      { ...base, id: "b", deadline: "2026-10-10" },
      { ...base, id: "c", postedOn: "2026-10-03" },
      { ...base, id: "d", deadline: "2026-09-30" },
      { ...base, id: "e", deadline: "2026-09-15" },
    ];
    const { open, expired } = splitJobs(all, today);
    expect(open.map((j) => j.id)).toEqual(["b", "a", "c"]);
    expect(expired.map((j) => j.id)).toEqual(["d", "e"]);
  });
  it("formats dates in British English", () => {
    expect(formatJobDate("2026-10-20")).toBe("20 October 2026");
  });
});
