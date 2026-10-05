import { expect, test } from "@playwright/test";

/**
 * Forms. The default build has no delivery endpoint configured, so the honest
 * "not available yet" state is what visitors see after a valid submit. The
 * configured path is exercised by setting FORMS_E2E=1 against a build made with
 * NEXT_PUBLIC_CONTACT_FORM_ENDPOINT / NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT set
 * to https://forms.example.test/... ; the network is then mocked with page.route,
 * so this proves the interface, not real delivery.
 */
const configured = !!process.env.FORMS_E2E;

test.describe("contact form", () => {
  test("validates on submit, links each error to its field and focuses the summary", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.getByTestId("contact-form");
    await form.getByRole("button", { name: "Send message" }).click();
    const summary = form.getByRole("alert");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("5 things to fix");
    await expect(page.getByLabel("Email", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email-error")).toContainText("Enter the email address");
    await page.getByLabel("Email", { exact: true }).fill("not-an-email");
    await page.getByLabel("Name", { exact: true }).fill("Ada");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#email-error")).toContainText("name@example.com");
    // An error disappears as soon as its field changes
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await expect(page.locator("#email-error")).toHaveCount(0);
    await expect(page).toHaveURL(/\/contact\/$/);
  });

  test("never claims success without a delivery service", async ({ page }) => {
    test.skip(configured, "unconfigured build only");
    await page.goto("/contact/");
    await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel("Subject", { exact: true }).fill("Giving a talk");
    await page.getByLabel("Message", { exact: true }).fill("I would like to present my work on ageing clocks at one of your evenings.");
    await page.getByLabel(/may use my name and email/).check();
    await page.getByRole("button", { name: "Send message" }).click();
    const alert = page.getByTestId("contact-form").getByRole("alert");
    await expect(alert).toContainText("not available yet");
    await expect(alert).toBeFocused();
    await expect(page.getByText("Message sent")).toHaveCount(0);
    const mail = alert.getByRole("link", { name: "Send it by email instead" });
    const href = (await mail.getAttribute("href")) ?? "";
    expect(href.startsWith("mailto:kthlongevity@gmail.com?")).toBe(true);
    expect(decodeURIComponent(href)).toContain("subject=Giving a talk");
    expect(decodeURIComponent(href)).toContain("ageing clocks");
    // The message is still there
    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(/ageing clocks/);
  });

  test("shows pending, then success or the provider's error, with a mocked endpoint", async ({ page }) => {
    test.skip(!configured, "needs a build with NEXT_PUBLIC_CONTACT_FORM_ENDPOINT set to https://forms.example.test/contact");
    let mode: "ok" | "reject" | "fail" = "ok";
    let received: unknown = null;
    await page.route("https://forms.example.test/contact", async (route) => {
      received = route.request().postDataJSON();
      await new Promise((r) => setTimeout(r, 400));
      if (mode === "ok") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      if (mode === "reject") return route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ errors: [{ message: "Email is not valid" }] }) });
      return route.abort("failed");
    });
    const fill = async () => {
      await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
      await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
      await page.getByLabel("Subject", { exact: true }).fill("Collaboration or sponsorship");
      await page.getByLabel("Message", { exact: true }).fill("We would like to host an evening about ageing research.");
      await page.getByLabel(/may use my name and email/).check();
    };

    await page.goto("/contact/");
    await fill();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("button", { name: "Sending…" })).toHaveAttribute("aria-busy", "true");
    await expect(page.getByText("Message sent")).toBeVisible();
    expect(received).toMatchObject({ name: "Ada Lovelace", email: "ada@example.com", subject: "Collaboration or sponsorship", _replyto: "ada@example.com" });

    mode = "reject";
    await page.goto("/contact/");
    await fill();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByTestId("contact-form").getByRole("alert")).toContainText("Email is not valid");
    await expect(page.getByText("Message sent")).toHaveCount(0);

    mode = "fail";
    await page.getByRole("button", { name: "Try again" }).click();
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByTestId("contact-form").getByRole("alert")).toContainText("could not be sent");
  });
});

test.describe("newsletter form", () => {
  test("asks only for an email (name optional) and explicit consent, and validates", async ({ page }) => {
    await page.goto("/newsletter/");
    const form = page.getByTestId("newsletter-form");
    await expect(form.getByLabel(/^Name/)).toBeVisible();
    await expect(form.getByText("(optional)")).toBeVisible();
    await form.getByRole("button", { name: "Subscribe" }).click();
    const summary = form.getByRole("alert");
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("2 things to fix");
    await expect(page.locator("#newsletter-consent-error")).toContainText("Tick the box");
    await expect(page.locator("main")).not.toContainText(/every (week|month)|weekly|monthly/i);
  });

  test("does not claim a subscription without a provider", async ({ page }) => {
    test.skip(configured, "unconfigured build only");
    await page.goto("/newsletter/");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel(/send me KTH Longevity updates/).check();
    await page.getByRole("button", { name: "Subscribe" }).click();
    const alert = page.getByTestId("newsletter-form").getByRole("alert");
    await expect(alert).toContainText("not available yet");
    await expect(page.getByText(/You are on the list|One more step/)).toHaveCount(0);
    await expect(alert.getByRole("link", { name: "Subscribe by email instead" })).toHaveAttribute("href", /^mailto:kthlongevity@gmail\.com/);
  });

  test("reports the provider's answer with a mocked endpoint", async ({ page }) => {
    test.skip(!configured, "needs a build with NEXT_PUBLIC_NEWSLETTER_FORM_ENDPOINT set to https://forms.example.test/newsletter");
    let ok = true;
    await page.route("https://forms.example.test/newsletter", (route) =>
      ok
        ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
        : route.fulfill({ status: 500, contentType: "text/plain", body: "boom" }),
    );
    await page.goto("/newsletter/");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel(/send me KTH Longevity updates/).check();
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/You are on the list|One more step/)).toBeVisible();

    ok = false;
    await page.goto("/newsletter/");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel(/send me KTH Longevity updates/).check();
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByTestId("newsletter-form").getByRole("alert")).toContainText("status 500");
  });
});
