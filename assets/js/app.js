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