import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const zoneId =
  process.env.CLOUDFLARE_ZONE_ID ?? "d4f2313d85c52c5f7c54a9c4e8b30679";
const projectName = "trustedbuyerlab";
const zoneName = "trustedbuyerlab.com";
const root = resolve(import.meta.dirname, "../..");

if (!accountId || !apiToken) {
  throw new Error("Missing Cloudflare credentials.");
}

async function api(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });
  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(
      `${response.status} ${path}: ${JSON.stringify(payload.errors ?? payload)}`,
    );
  }
  return payload.result;
}

const [project, domains, apexRecords, wwwRecords] = await Promise.all([
  api(`/accounts/${accountId}/pages/projects/${projectName}`),
  api(`/accounts/${accountId}/pages/projects/${projectName}/domains`),
  api(`/zones/${zoneId}/dns_records?name=${zoneName}&per_page=100`),
  api(`/zones/${zoneId}/dns_records?name=www.${zoneName}&per_page=100`),
]);

const records = [...apexRecords, ...wwwRecords].map((record) => ({
  id: record.id,
  name: record.name,
  type: record.type,
  content: record.content,
  proxied: record.proxied,
  ttl: record.ttl,
  comment: record.comment,
}));
const report = {
  project: {
    name: project.name,
    productionBranch: project.production_branch,
    domains: project.domains,
    subdomain: project.subdomain,
  },
  customDomains: domains.map((domain) => ({
    name: domain.name,
    status: domain.status,
    zoneTag: domain.zone_tag,
  })),
  dns: records,
};

await mkdir(resolve(root, "docs"), { recursive: true });
await writeFile(
  resolve(root, "docs/production-preflight.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

const dnsSummary = records
  .map(
    (record) =>
      `${record.name} ${record.type} ${record.content} proxied=${record.proxied}`,
  )
  .join(" | ");
console.log(
  `::notice title=Production preflight::branch=${project.production_branch}; projectDomains=${project.domains?.join(",") ?? "none"}; customDomains=${domains.map((domain) => `${domain.name}:${domain.status}`).join(",") || "none"}; dns=${dnsSummary || "none"}`,
);
console.log(JSON.stringify(report, null, 2));
