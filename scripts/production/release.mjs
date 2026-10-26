import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId =
  process.env.CLOUDFLARE_ZONE_ID ?? "d4f2313d85c52c5f7c54a9c4e8b30679";
const projectName = "trustedbuyerlab";
const zoneName = "trustedbuyerlab.com";
const hostnames = [zoneName, `www.${zoneName}`];
const pagesTarget = `${projectName}.pages.dev`;
const routingTypes = new Set(["A", "AAAA", "CNAME"]);
const root = resolve(import.meta.dirname, "../..");
const reportPath = resolve(root, "docs/production-release.json");

if (!accountId || !apiToken) {
  throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.");
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
    const detail = payload.errors
      ?.map((error) => `${error.code}: ${error.message}`)
      .join("; ");
    throw new Error(`${method} ${path} (${response.status}): ${detail}`);
  }
  return payload.result;
}

async function routingRecords(name) {
  const records = await api(
    "GET",
    `/zones/${zoneId}/dns_records?name=${name}&per_page=100`,
  );
  return records.filter((record) => routingTypes.has(record.type));
}

const snapshotRecord = (record) => ({
  name: record.name,
  type: record.type,
  content: record.content,
  proxied: record.proxied,
  ttl: record.ttl,
  comment: record.comment ?? undefined,
});

async function replaceRoutingRecords() {
  for (const hostname of hostnames) {
    for (const record of await routingRecords(hostname)) {
      await api("DELETE", `/zones/${zoneId}/dns_records/${record.id}`);
    }
    await api("POST", `/zones/${zoneId}/dns_records`, {
      name: hostname,
      type: "CNAME",
      content: pagesTarget,
      proxied: true,
      ttl: 1,
      comment: "Cloudflare Pages production",
    });
  }
}

async function restoreRecords(records) {
  for (const hostname of hostnames) {
    for (const record of await routingRecords(hostname)) {
      await api("DELETE", `/zones/${zoneId}/dns_records/${record.id}`);
    }
  }
  for (const record of records) {
    await api("POST", `/zones/${zoneId}/dns_records`, record);
  }
}

async function verifyUrl(url) {
  try {
    const response = await fetch(`${url}?release=${Date.now()}`, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1] ?? "";
    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    return {
      ok:
        response.ok &&
        title.includes("Trusted Buyer Lab") &&
        h1Count === 1,
      status: response.status,
      finalUrl: response.url,
      title,
      h1Count,
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function waitFor(check, { timeoutMs, intervalMs = 10_000, label }) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  while (Date.now() < deadline) {
    lastValue = await check();
    if (lastValue?.ok) return lastValue;
    await sleep(intervalMs);
  }
  throw new Error(`${label} timed out: ${JSON.stringify(lastValue)}`);
}

function deployProduction() {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const deployment = spawnSync(
    executable,
    [
      "wrangler",
      "pages",
      "deploy",
      "dist",
      `--project-name=${projectName}`,
      "--branch=main",
      "--commit-dirty=true",
    ],
    {
      cwd: root,
      env: process.env,
      encoding: "utf8",
      stdio: "pipe",
    },
  );
  process.stdout.write(deployment.stdout);
  process.stderr.write(deployment.stderr);
  if (deployment.status !== 0) {
    throw new Error(`Production Pages deploy failed with exit ${deployment.status}.`);
  }
}

const originalRecords = [];
const attachedDomains = [];
let dnsChanged = false;

try {
  const project = await api(
    "GET",
    `/accounts/${accountId}/pages/projects/${projectName}`,
  );
  if (project.production_branch !== "main") {
    await api("PATCH", `/accounts/${accountId}/pages/projects/${projectName}`, {
      production_branch: "main",
    });
  }

  for (const hostname of hostnames) {
    originalRecords.push(...(await routingRecords(hostname)).map(snapshotRecord));
  }
  await mkdir(resolve(root, "docs"), { recursive: true });
  await writeFile(
    resolve(root, "docs/production-preflight.json"),
    `${JSON.stringify({ project, originalRecords }, null, 2)}\n`,
    "utf8",
  );

  deployProduction();
  await waitFor(() => verifyUrl(`https://${pagesTarget}/`), {
    timeoutMs: 180_000,
    label: "Pages production deployment",
  });
  console.log("Pages production deployment is serving the new site.");

  const existingDomains = await api(
    "GET",
    `/accounts/${accountId}/pages/projects/${projectName}/domains`,
  );
  for (const hostname of hostnames) {
    if (!existingDomains.some((domain) => domain.name === hostname)) {
      await api(
        "POST",
        `/accounts/${accountId}/pages/projects/${projectName}/domains`,
        { name: hostname },
      );
      attachedDomains.push(hostname);
    }
  }
  console.log("Apex and www custom domains are attached.");

  await replaceRoutingRecords();
  dnsChanged = true;
  console.log("Apex and www routing records now target Cloudflare Pages.");

  await waitFor(() => verifyUrl(`https://${zoneName}/`), {
    timeoutMs: 600_000,
    label: "Apex production hostname",
  });
  await waitFor(() => verifyUrl(`https://www.${zoneName}/`), {
    timeoutMs: 600_000,
    label: "WWW production hostname",
  });

  const result = {
    success: true,
    releasedAt: new Date().toISOString(),
    pagesTarget,
    hostnames,
    productionBranch: "main",
    originalRecords,
    apex: await verifyUrl(`https://${zoneName}/`),
    www: await verifyUrl(`https://www.${zoneName}/`),
  };
  await writeFile(reportPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log(
    `::notice title=Production release::trustedbuyerlab.com and www are serving Cloudflare Pages.`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(error);
  if (dnsChanged) {
    try {
      await restoreRecords(originalRecords);
      console.log("Restored original apex/www DNS records after failure.");
    } catch (rollbackError) {
      console.error(rollbackError);
      console.log(
        `::error title=Production rollback failed::${String(rollbackError).replaceAll("\n", " ")}`,
      );
    }
  }
  for (const hostname of attachedDomains) {
    try {
      await api(
        "DELETE",
        `/accounts/${accountId}/pages/projects/${projectName}/domains/${hostname}`,
      );
    } catch (cleanupError) {
      console.error(cleanupError);
    }
  }
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        success: false,
        failedAt: new Date().toISOString(),
        pagesTarget,
        originalRecords,
        error: message,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`::error title=Production release failed::${message.replaceAll("\n", " ")}`);
  process.exitCode = 1;
}
