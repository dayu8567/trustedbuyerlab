const trackedWindow = window;
trackedWindow.dataLayer = trackedWindow.dataLayer ?? [];

function networkFromUrl(value) {
  try {
    const host = new URL(value, window.location.href).hostname
      .replace(/^www\./, "")
      .toLowerCase();

    if (host.endsWith("amazon.com") || host === "amzn.to") return "amazon";
    if (host === "pboost.me") return "partnerboost";
    return host;
  } catch {
    return "unknown";
  }
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest("a.affiliate-link");
  if (!link) return;

  trackedWindow.dataLayer?.push({
    event: "affiliate_click",
    affiliate_network:
      link.dataset.affiliateNetwork ?? networkFromUrl(link.href),
    product_name: link.dataset.productName ?? "",
    product_rank: link.dataset.productRank ?? "",
    category: link.dataset.category ?? "",
    cta_text: link.dataset.ctaText ?? link.textContent?.trim() ?? "",
    page_type: link.dataset.pageType ?? "",
    page_location: window.location.href,
    page_title: document.title,
    outbound_url: link.href,
  });
});

const containerId = document.documentElement.dataset.gtmId?.trim();
if (containerId) {
  let loaded = false;
  const loadTagManager = () => {
    if (loaded) return;
    loaded = true;
    trackedWindow.dataLayer?.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
    });

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtm.js?id=" +
      encodeURIComponent(containerId);
    document.head.append(script);
  };

  window.addEventListener("pointerdown", loadTagManager, {
    once: true,
    passive: true,
  });
  window.addEventListener("keydown", loadTagManager, { once: true });
}
