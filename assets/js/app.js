/* ==================================================
   Version 3.0 - SENIX X6 / Best Cordless Lawn Mowers
   app.js - FAQ Toggle + Sticky CTA + Scroll Animations
   ================================================== */

/* ========================
   FAQ ACCORDION
======================== */
document.addEventListener("DOMContentLoaded", function() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    button.addEventListener("click", () => {
      const isOpen = answer.style.display === "block";

      // Close all other answers
      faqItems.forEach(i => {
        i.querySelector(".faq-answer").style.display = "none";
      });

      // Toggle current
      answer.style.display = isOpen ? "none" : "block";
    });
  });
});

/* ========================
   STICKY CTA SHOW/HIDE ON SCROLL
======================== */
const stickyCTA = document.querySelector(".cta-btn.sticky");

if(stickyCTA){
  let lastScrollTop = 0;
  window.addEventListener("scroll", function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if(scrollTop > 200){ // Show after 200px scroll
      stickyCTA.style.transform = "translateY(0)";
    } else {
      stickyCTA.style.transform = "translateY(100px)";
    }

    lastScrollTop = scrollTop;
  });
}

/* ========================
   SIMPLE SCROLL ANIMATIONS
======================== */
const fadeInElements = document.querySelectorAll(".fade-in");

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      fadeInObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

fadeInElements.forEach(el => {
  fadeInObserver.observe(el);
});

/* ========================
   OPTIONAL: SMOOTH SCROLL FOR CTA LINKS
======================== */
const ctaLinks = document.querySelectorAll("a[href^='#']");

ctaLinks.forEach(link => {
  link.addEventListener("click", function(e){
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if(target){
      target.scrollIntoView({behavior: "smooth"});
    }
  });
});
/* =========================
   FAQ ACCORDION
========================= */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

const question = item.querySelector(".faq-question");

question.addEventListener("click", () => {

faqItems.forEach(otherItem => {

if(otherItem !== item){
otherItem.classList.remove("active");
}

});

item.classList.toggle("active");

});

});
/* Legacy CTA CSS was accidentally embedded in this JS file. The same visual styles
   are defined in index.html, so this block is commented to keep app.js parseable.
.cta-button{
  display:inline-block;
  background:#FF9900;
  color:#fff;
  font-size:18px;
  font-weight:700;
  padding:16px 36px;
  border-radius:12px;
  text-decoration:none;
  transition:all .3s ease;
  box-shadow:0 8px 20px rgba(255,153,0,.35);
}

.cta-button:hover{
  background:#e68a00;
  transform:translateY(-2px);
  box-shadow:0 12px 30px rgba(255,153,0,.45);
}
*/

/* ========================
   AFFILIATE CLICK TRACKING
======================== */
window.dataLayer = window.dataLayer || [];

document.addEventListener("click", function(event) {
  const link = event.target.closest(
    "a.affiliate-link, a[href*='pboost.me'], a[href*='amazon.com'], a[href*='amzn.to'], a[href*='impact.com'], a[href*='shareasale.com'], a[href*='cj.com'], a[href*='awin1.com'], a[href*='partnerstack.com']"
  );
  if (!link) return;

  const linkText = link.innerText.trim();
  const affiliateNetwork = link.dataset.affiliateNetwork || getAffiliateNetwork(link.href);

  window.dataLayer.push({
    event: "affiliate_click",
    product_name: link.dataset.productName || "",
    product_rank: link.dataset.productRank || "",
    category: link.dataset.category || "",
    affiliate_network: affiliateNetwork,
    cta_text: link.dataset.ctaText || linkText,
    page_type: link.dataset.pageType || "",
    page_location: window.location.href,
    page_title: document.title,
    outbound_url: link.href,
    link_text: linkText
  });
});

function getAffiliateNetwork(url) {
  const host = new URL(url, window.location.href).hostname.replace(/^www\./, "").toLowerCase();

  if (host === "pboost.me") return "pboost";
  if (host.endsWith("amazon.com") || host === "amzn.to") return "amazon";
  if (host.endsWith("impact.com")) return "impact";
  if (host.endsWith("shareasale.com")) return "shareasale";
  if (host.endsWith("cj.com")) return "cj";
  if (host.endsWith("awin1.com")) return "awin";
  if (host.endsWith("partnerstack.com")) return "partnerstack";

  return host;
}
