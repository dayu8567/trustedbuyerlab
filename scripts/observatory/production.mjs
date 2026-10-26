import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId =
  process.env.CLOUDFLARE_ZONE_ID ?? "d4f2313d85c52c5f7c54a9c4e8b30679";
const hostname = "trustedbuyerlab.com";
const region = process.env.OBSERVATORY_REGION ?? "us-central1";
const root = resolve(import.meta.dirname, "../..");

if (!accountId || !apiToken) {
  throw new Error("Missing Cloudflare credentials.");
}

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function api(method, path, body) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(
      `${method} ${path} (${response.status}): ${JSON.stringify(payload.errors ?? payload)}`,
    );
  }
  return payload.result;
}

async function waitForReport(testId) {
  const deadline = Date.now() + 15 * 60 * 1000;
  while (Date.now() < deadline) {
    const current = await api(
      "GET",
      `/zones/${zoneId}/speed_api/pages/${encodeURIComponent(hostname)}/tests/${testId}`,
    );
    if (
      current.desktopReport?.state === "COMPLETE" &&
      current.mobileReport?.state === "COMPLETE"
    ) {
      return current;
    }
    if (
      current.desktopReport?.state === "FAILED" ||
      current.mobileReport?.state === "FAILED"
    ) {
      throw new Error("Production Observatory report failed.");
    }
    await sleep(10_000);
  }
  throw new Error("Production Observatory report timed out.");
}

try {
  await fetch(`https://${hostname}/?observatory=${Date.now()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const started = await api(
    "POST",
    `/zones/${zoneId}/speed_api/pages/${encodeURIComponent(hostname)}/tests`,
    { region },
  );
  if (!started.id) throw new Error("Speed API did not return a test ID.");
  const report = await waitForReport(started.id);
  const result = {
    hostname,
    region,
    testId: started.id,
    desktop: report.desktopReport,
    mobile: report.mobileReport,
  };
  await mkdir(resolve(root, "docs"), { recursive: true });
  await writeFile(
    resolve(root, "docs/production-observatory.json"),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `::notice title=Production Observatory::desktop=${report.desktopReport?.performanceScore}; mobile=${report.mobileReport?.performanceScore}; region=${region}`,
  );
  if (
    report.desktopReport?.performanceScore !== 100 ||
    report.mobileReport?.performanceScore !== 100
  ) {
    throw new Error(
      `Production scores are not both 100: desktop=${report.desktopReport?.performanceScore}, mobile=${report.mobileReport?.performanceScore}`,
    );
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(error);
  console.log(`::error title=Production Observatory failed::${message}`);
  process.exitCode = 1;
}
