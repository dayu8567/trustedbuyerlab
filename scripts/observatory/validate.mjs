import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const apiBase = "https://api.cloudflare.com/client/v4";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId =
  process.env.CLOUDFLARE_ZONE_ID ?? "d4f2313d85c52c5f7c54a9c4e8b30679";
const zoneName = "trustedbuyerlab.com";
const runId = process.env.GITHUB_RUN_ID ?? String(Date.now());
const projectName = `tbl-observatory-${runId}`.toLowerCase();
const hostname = `observatory-${runId}.${zoneName}`.toLowerCase();
const region = process.env.OBSERVATORY_REGION ?? "us-central1";
const root = resolve(import.meta.dirname, "../..");
const resultPath = resolve(root, "docs/observatory-result.json");

if (!accountId || !apiToken) {
  throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.");
}

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

class CloudflareApiError extends Error {
  constructor(method, path, status, payload) {
    const detail =
      payload?.errors?.map((error) => `${error.code}: ${error.message}`).join("; ") ??
      JSON.stringify(payload);
    super(`${method} ${path} failed (${status}): ${detail}`);
    this.status = status;
    this.payload = payload;
  }
}

async function api(method, path, body) {
  const response = await fetch(`${apiBase}${path}`, {
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
    throw new CloudflareApiError(method, path, response.status, payload);
  }
  return payload.result;
}

async function getDnsRecords(name) {
  return api(
    "GET",
    `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&per_page=100`,
  );
}

async function snapshotProtectedDns() {
  const records = [];
  for (const name of [zoneName, `www.${zoneName}`]) {
    for (const record of await getDnsRecords(name)) {
      records.push({
        name: record.name,
        type: record.type,
        content: record.content,
        proxied: record.proxied,
        ttl: record.ttl,
      });
    }
  }
  return records;
}

const sameDns = (left, right) =>
  JSON.stringify(left) === JSON.stringify(right);

async function waitFor(check, { timeoutMs, intervalMs = 5_000, label }) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `${label} timed out${lastError ? `: ${lastError.message}` : ""}`,
  );
}

async function hostIsReady() {
  try {
    const response = await fetch(`https://${hostname}/?observatory=warmup`, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function runWranglerDeploy() {
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
    throw new Error(`Wrangler Pages deploy failed with exit ${deployment.status}.`);
  }
}

let createdProject = false;
let protectedDnsBefore;
const cleanupErrors = [];

async function cleanup() {
  if (!protectedDnsBefore) return;
  try {
    const records = await getDnsRecords(hostname);
    for (const record of records) {
      await api("DELETE", `/zones/${zoneId}/dns_records/${record.id}`);
      console.log(`Deleted temporary DNS record ${record.id}.`);
    }
  } catch (error) {
    cleanupErrors.push(`DNS cleanup: ${error.message}`);
  }

  if (createdProject) {
    try {
      await api(
        "DELETE",
        `/accounts/${accountId}/pages/projects/${projectName}/domains/${hostname}`,
      );
      console.log("Deleted temporary Pages custom domain.");
    } catch (error) {
      if (error.status !== 404) {
        cleanupErrors.push(`Custom-domain cleanup: ${error.message}`);
      }
    }

    try {
      await api(
        "DELETE",
        `/accounts/${accountId}/pages/projects/${projectName}`,
      );
      console.log("Deleted temporary Pages project.");
    } catch (error) {
      cleanupErrors.push(`Pages-project cleanup: ${error.message}`);
    }
  }

  try {
    const protectedDnsAfter = await snapshotProtectedDns();
    if (!sameDns(protectedDnsBefore, protectedDnsAfter)) {
      cleanupErrors.push(
        "Protected apex/www DNS changed during validation. Investigate immediately.",
      );
    }
  } catch (error) {
    cleanupErrors.push(`Protected-DNS verification: ${error.message}`);
  }
}

async function main() {
  console.log(
    JSON.stringify({ projectName, hostname, region, zoneId }, null, 2),
  );

  try {
    protectedDnsBefore = await snapshotProtectedDns();
    console.log("Protected apex/www DNS snapshot captured.");
  } catch (error) {
    throw new Error(
      `DNS permission preflight failed. Add Zone > DNS > Edit for ${zoneName}. ${error.message}`,
    );
  }

  const existingTemporaryRecords = await getDnsRecords(hostname);
  if (existingTemporaryRecords.length > 0) {
    throw new Error(
      `Temporary hostname ${hostname} already has DNS records. Refusing to continue.`,
    );
  }

  try {
    await api(
      "GET",
      `/zones/${zoneId}/speed_api/pages/${encodeURIComponent(zoneName)}/tests`,
    );
  } catch (error) {
    if (error.status === 403) {
      throw new Error(
        `Speed API permission preflight failed. Add Zone > Zone Settings > Edit for ${zoneName}. ${error.message}`,
      );
    }
  }

  try {
    await api("GET", `/accounts/${accountId}/pages/projects/${projectName}`);
    throw new Error(`Temporary Pages project ${projectName} already exists.`);
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  await api("POST", `/accounts/${accountId}/pages/projects`, {
    name: projectName,
    production_branch: "main",
  });
  createdProject = true;
  console.log("Created isolated Pages project.");

  runWranglerDeploy();

  await waitFor(
    async () => {
      try {
        const response = await fetch(`https://${projectName}.pages.dev/`);
        return response.ok;
      } catch {
        return false;
      }
    },
    { timeoutMs: 180_000, label: "Pages deployment availability" },
  );

  await api(
    "POST",
    `/accounts/${accountId}/pages/projects/${projectName}/domains`,
    { name: hostname },
  );
  console.log("Attached temporary custom domain.");

  await sleep(8_000);
  let dnsRecords = await getDnsRecords(hostname);
  if (dnsRecords.length === 0) {
    await api("POST", `/zones/${zoneId}/dns_records`, {
      name: hostname,
      type: "CNAME",
      content: `${projectName}.pages.dev`,
      proxied: true,
      ttl: 1,
      comment: `Temporary Observatory validation ${runId}`,
    });
    console.log("Created temporary proxied CNAME.");
  }

  await waitFor(hostIsReady, {
    timeoutMs: 600_000,
    intervalMs: 10_000,
    label: "Temporary custom-domain HTTPS",
  });
  console.log("Temporary custom domain is serving HTTPS.");

  await hostIsReady();
  await sleep(5_000);

  const started = await api(
    "POST",
    `/zones/${zoneId}/speed_api/pages/${encodeURIComponent(hostname)}/tests`,
    { region },
  );
  const testId = started.id;
  if (!testId) throw new Error("Speed API did not return a test ID.");
  console.log(`Started Observatory test ${testId}.`);

  const result = await waitFor(
    async () => {
      const current = await api(
        "GET",
        `/zones/${zoneId}/speed_api/pages/${encodeURIComponent(hostname)}/tests/${testId}`,
      );
      const desktopState = current.desktopReport?.state;
      const mobileState = current.mobileReport?.state;
      console.log(
        `Observatory state: desktop=${desktopState ?? "pending"} mobile=${mobileState ?? "pending"}`,
      );
      if (desktopState === "FAILED" || mobileState === "FAILED") {
        throw new Error("Observatory test failed. See saved result.");
      }
      return desktopState === "COMPLETE" && mobileState === "COMPLETE"
        ? current
        : null;
    },
    {
      timeoutMs: 900_000,
      intervalMs: 10_000,
      label: "Observatory test completion",
    },
  );

  await mkdir(resolve(root, "docs"), { recursive: true });
  await writeFile(
    resultPath,
    `${JSON.stringify({ runId, hostname, projectName, region, result }, null, 2)}\n`,
    "utf8",
  );

  const summary = {
    hostname,
    region,
    testId,
    desktop: result.desktopReport?.performanceScore,
    mobile: result.mobileReport?.performanceScore,
    resultPath: "docs/observatory-result.json",
  };
  console.log(JSON.stringify(summary, null, 2));

  if (summary.desktop !== 100 || summary.mobile !== 100) {
    throw new Error(
      `Observatory scores are not both 100: desktop=${summary.desktop}, mobile=${summary.mobile}`,
    );
  }
}

try {
  await main();
} finally {
  await cleanup();
  if (cleanupErrors.length > 0) {
    console.error(`Cleanup issues:\n- ${cleanupErrors.join("\n- ")}`);
    process.exitCode = 1;
  }
}
