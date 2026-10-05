import { describe, expect, it, vi } from "vitest";
import { isEmail, submitForm, validateContact, validateNewsletter } from "@/lib/forms";

const okContact = { name: "Ada", email: "ada@example.com", subject: "Hello", message: "A message with enough words in it." };

describe("validation", () => {
  it("accepts ordinary addresses and rejects malformed ones", () => {
    expect(isEmail("student@kth.se")).toBe(true);
    expect(isEmail("first.last+tag@example.co.uk")).toBe(true);
    expect(isEmail("not an email")).toBe(false);
    expect(isEmail("missing@tld")).toBe(false);
    expect(isEmail("@example.com")).toBe(false);
  });
  it("names every missing contact field with a specific message", () => {
    const errors = validateContact({ name: " ", email: "", subject: "", message: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name", "subject"]);
    expect(validateContact({ ...okContact, email: "nope" }).email).toMatch(/name@example\.com/);
    expect(validateContact({ ...okContact, message: "short" }).message).toMatch(/a little more/);
    expect(validateContact(okContact)).toEqual({});
  });
  it("requires an address and explicit consent for the newsletter, name optional", () => {
    expect(validateNewsletter({ email: "", name: "", consent: false })).toEqual({
      email: expect.stringMatching(/Enter the email/),
      consent: expect.stringMatching(/Tick the box/),
    });
    expect(validateNewsletter({ email: "a@b.co", name: "", consent: true })).toEqual({});
  });
});

function response(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("submitForm", () => {
  it("reports an unconfigured endpoint without touching the network", async () => {
    const fetchImpl = vi.fn();
    const outcome = await submitForm(null, { email: "a@b.co" }, { fetchImpl });
    expect(outcome).toEqual({ ok: false, reason: "unconfigured", message: expect.any(String) });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("posts JSON with an Accept header and treats 2xx as success", async () => {
    const fetchImpl = vi.fn(async () => response(200, { ok: true, message: "Thanks!" }));
    const outcome = await submitForm("https://forms.example.test/f/abc", { name: "Ada", email: "ada@example.com" }, { fetchImpl });
    expect(outcome).toEqual({ ok: true, message: "Thanks!" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://forms.example.test/f/abc");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Accept).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({ name: "Ada", email: "ada@example.com" });
  });
  it("can post form-encoded bodies for providers that need them", async () => {
    const fetchImpl = vi.fn(async () => response(200));
    await submitForm("https://forms.example.test/f/abc", { email: "ada@example.com", name: "Ada Lovelace" }, { fetchImpl, encoding: "form" });
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.body).toBeInstanceOf(URLSearchParams);
    expect(String(init.body)).toBe("email=ada%40example.com&name=Ada+Lovelace");
  });
  it("surfaces the provider's message on rejection and a status otherwise", async () => {
    const rejected = await submitForm("https://x.test/f", {}, { fetchImpl: vi.fn(async () => response(422, { errors: [{ message: "Email is not valid" }] })) });
    expect(rejected).toEqual({ ok: false, reason: "rejected", message: "Email is not valid" });
    const plain = await submitForm("https://x.test/f", {}, { fetchImpl: vi.fn(async () => response(500)) });
    expect(plain).toEqual({ ok: false, reason: "rejected", message: "The service answered with status 500." });
  });
  it("never reports success on a network failure", async () => {
    const outcome = await submitForm("https://x.test/f", {}, {
      fetchImpl: vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    });
    expect(outcome.ok).toBe(false);
    expect(outcome).toMatchObject({ reason: "network" });
  });
});
