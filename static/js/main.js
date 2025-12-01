document.addEventListener("DOMContentLoaded", () => {
  // mobile menu
  const burger = document.querySelector("[data-burger]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  burger?.addEventListener("click", () => {
    const open = mobileNav.getAttribute("data-open") === "true";
    mobileNav.setAttribute("data-open", String(!open));
    burger.setAttribute("aria-expanded", String(!open));
  });

  // home carousel only if exists
  bindHomeDemoControls();
  bindSpotlightCarousel();
});

function bindHomeDemoControls() {
  const prev = document.querySelector("[data-prev-card]");
  const next = document.querySelector("[data-next-card]");
  const title = document.querySelector("[data-feature-title]");
  const desc = document.querySelector("[data-feature-desc]");
  const img = document.querySelector("[data-feature-img]");
  if (!prev || !next || !title || !desc || !img) return;

  const items = [
    { title: "Paro Tshechu", desc: "A vibrant festival in Paro.", img: "..." },
    { title: "Tiger’s Nest", desc: "Cliffside monastery views.", img: "..." },
    { title: "Thimphu Market", desc: "Local crafts and food.", img: "..." },
  ];

  let idx = 0;
  const render = () => {
    title.textContent = items[idx].title;
    desc.textContent = items[idx].desc;
    img.src = items[idx].img;
    img.alt = items[idx].title;
  };

  prev.addEventListener("click", () => { idx = (idx - 1 + items.length) % items.length; render(); });
  next.addEventListener("click", () => { idx = (idx + 1) % items.length; render(); });

  render();
}

function bindSpotlightCarousel() {
  const els = {
    title: document.querySelector("[data-s-title]"),
    desc: document.querySelector("[data-s-desc]"),
    category: document.querySelector("[data-s-category]"),
    img: document.querySelector("[data-s-img]"),
    dateTop: document.querySelector("[data-s-date-top]"),
    dateMid: document.querySelector("[data-s-date-mid]"),
    dateBot: document.querySelector("[data-s-date-bot]"),
    prev: document.querySelector("[data-s-prev]"),
    next: document.querySelector("[data-s-next]"),
    thumbs: Array.from(document.querySelectorAll("[data-s-thumb]")),
  };

  if (!els.title || !els.img || !els.prev || !els.next || els.thumbs.length === 0) return;

  const slides = [
    {
      category: "Art & Culture",
      title: "Brouq 2026",
      desc: "Brouq 2026 offers an exciting escape with glamping, dining, culture, and thrilling activities",
      img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=70",
      dateTop: "26",
      dateMid: "Nov 25",
      dateBot: "17 Jan 26",
    },
    {
      category: "Festivals",
      title: "Paro Tshechu",
      desc: "A vibrant festival with masked dances, music, and community celebrations in Paro.",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=70",
      dateTop: "10",
      dateMid: "Apr",
      dateBot: "12 Apr",
    },
    {
      category: "Nature",
      title: "Tiger’s Nest Hike",
      desc: "A breathtaking trek to Bhutan’s iconic cliffside monastery.",
      img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1800&q=70",
      dateTop: "All",
      dateMid: "Year",
      dateBot: "Round",
    },
  ];

  let idx = 0;

  function render() {
    const s = slides[idx];
    els.title.textContent = s.title;
    els.desc.textContent = s.desc;
    els.category.textContent = s.category;
    els.img.src = s.img;
    els.img.alt = s.title;
    if (els.dateTop) els.dateTop.textContent = s.dateTop;
    if (els.dateMid) els.dateMid.textContent = s.dateMid;
    if (els.dateBot) els.dateBot.textContent = s.dateBot;

    els.thumbs.forEach((t) => t.classList.remove("is-active"));
    const active = els.thumbs.find((t) => Number(t.dataset.sThumb) === idx);
    active?.classList.add("is-active");
  }

  els.prev.addEventListener("click", () => { idx = (idx - 1 + slides.length) % slides.length; render(); });
  els.next.addEventListener("click", () => { idx = (idx + 1) % slides.length; render(); });

  els.thumbs.forEach((t) => {
    t.addEventListener("click", () => {
      idx = Number(t.dataset.sThumb);
      render();
    });
  });

  render();
}