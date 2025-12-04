// static/js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const burger = document.querySelector("[data-burger]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  burger?.addEventListener("click", () => {
    const open = mobileNav?.getAttribute("data-open") === "true";
    mobileNav?.setAttribute("data-open", String(!open));
    burger?.setAttribute("aria-expanded", String(!open));
  });

  // Home demo carousel (hero right card)
  bindHomeDemoControls();

  // Spotlight carousel (big turquoise section)
  bindSpotlightCarousel();

  // Events explorer filters (category/type/date/search)
  bindEventsExplorerFilters();
});

function bindHomeDemoControls() {
  const prev = document.querySelector("[data-prev-card]");
  const next = document.querySelector("[data-next-card]");
  const title = document.querySelector("[data-feature-title]");
  const desc = document.querySelector("[data-feature-desc]");
  const img = document.querySelector("[data-feature-img]");
  if (!prev || !next || !title || !desc || !img) return;

  const items = [
    {
      title: "Paro Tshechu",
      desc: "A vibrant festival in Paro.",
      img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=70",
    },
    {
      title: "Tiger’s Nest",
      desc: "Cliffside monastery views.",
      img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=70",
    },
    {
      title: "Thimphu Market",
      desc: "Local crafts and food.",
      img: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=70",
    },
  ];

  let idx = 0;

  const render = () => {
    const it = items[idx];
    title.textContent = it.title;
    desc.textContent = it.desc;
    img.src = it.img;
    img.alt = it.title;
  };

  prev.addEventListener("click", () => {
    idx = (idx - 1 + items.length) % items.length;
    render();
  });

  next.addEventListener("click", () => {
    idx = (idx + 1) % items.length;
    render();
  });

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
    if (els.desc) els.desc.textContent = s.desc;
    if (els.category) els.category.textContent = s.category;
    els.img.src = s.img;
    els.img.alt = s.title;

    if (els.dateTop) els.dateTop.textContent = s.dateTop;
    if (els.dateMid) els.dateMid.textContent = s.dateMid;
    if (els.dateBot) els.dateBot.textContent = s.dateBot;

    els.thumbs.forEach((t) => t.classList.remove("is-active"));
    const active = els.thumbs.find((t) => Number(t.dataset.sThumb) === idx);
    active?.classList.add("is-active");
  }

  els.prev.addEventListener("click", () => {
    idx = (idx - 1 + slides.length) % slides.length;
    render();
  });

  els.next.addEventListener("click", () => {
    idx = (idx + 1) % slides.length;
    render();
  });

  els.thumbs.forEach((t) => {
    t.addEventListener("click", () => {
      idx = Number(t.dataset.sThumb);
      if (!Number.isFinite(idx)) idx = 0;
      render();
    });
  });

  render();
}

function bindEventsExplorerFilters() {
  const explorer = document.querySelector("[data-events-explorer]");
  if (!explorer) return;

  const countEl = explorer.querySelector("[data-events-count]");
  const searchEl = explorer.querySelector("[data-search]");
  const datePicker = explorer.querySelector("[data-date-picker]");

  const state = {
    categories: new Set(), // lowercased values
    type: "all", // all|free|paid
    date: "all", // all|today|week|next30|next3m|next6m|custom
    customDate: null, // Date (local midnight)
    q: "",
  };

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  // Parse YYYY-MM-DD into a *local* Date at midnight (avoids timezone surprises)
  const parseISO = (iso) => {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
    return new Date(y, mo, d);
  };

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const addDays = (d, n) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  };

  const addMonths = (d, n) => {
    const copy = new Date(d);
    copy.setMonth(copy.getMonth() + n);
    return copy;
  };

  function datePass(cardDateISO) {
    if (state.date === "all") return true;

    const cardDate = parseISO(cardDateISO);
    if (!cardDate) return false;

    const today = startOfDay(new Date());

    if (state.date === "custom" && state.customDate) {
      return cardDate.getTime() === state.customDate.getTime();
    }

    let end;
    if (state.date === "today") end = addDays(today, 1);
    else if (state.date === "week") end = addDays(today, 7);
    else if (state.date === "next30") end = addDays(today, 30);
    else if (state.date === "next3m") end = addMonths(today, 3);
    else if (state.date === "next6m") end = addMonths(today, 6);
    else return true;

    return cardDate >= today && cardDate < end;
  }

  function setActive(groupName, clickedBtn) {
    explorer.querySelectorAll(`[data-filter-group="${groupName}"] .seg`).forEach((b) => {
      b.classList.toggle("is-active", b === clickedBtn);
    });
  }

  function getCards() {
    return Array.from(explorer.querySelectorAll(".cards .event-card"));
  }

  function applyFilters() {
    const cards = getCards();
    let visible = 0;
    const q = norm(state.q);

    for (const card of cards) {
      const tags = (card.dataset.tags || "")
        .split(",")
        .map((t) => norm(t))
        .filter(Boolean);

      const type = norm(card.dataset.type || "paid");
      const iso = card.dataset.date;

      // Categories: if none selected -> pass; else match any
      const catPass =
        state.categories.size === 0 ||
        tags.some((t) => state.categories.has(t));

      // Type
      const typePass = state.type === "all" || type === state.type;

      // Date bucket
      const dateOk = datePass(iso);

      // Search against visible text (title, location, tags)
      const title = norm(card.querySelector("h4")?.textContent);
      const loc = norm(card.querySelector(".event-card__loc")?.textContent);
      const hay = `${title} ${loc} ${tags.join(" ")}`;
      const searchOk = !q || hay.includes(q);

      const show = catPass && typePass && dateOk && searchOk;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    }

    if (countEl) countEl.textContent = String(visible);
  }

  // ---- Category checkboxes (event delegation) ----
  explorer.addEventListener("change", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLInputElement)) return;

    // Important: your HTML uses name="category" (all lowercase)
    if (el.matches('input[type="checkbox"][name="category"]')) {
      const v = norm(el.value);
      if (!v) return;
      if (el.checked) state.categories.add(v);
      else state.categories.delete(v);
      applyFilters();
    }
  });

  // ---- Type + Date segmented buttons (event delegation) ----
  explorer.addEventListener("click", (e) => {
    const btn = e.target.closest("button.seg");
    if (!btn) return;

    // Type
    if (btn.dataset.type) {
      state.type = norm(btn.dataset.type) || "all";
      setActive("type", btn);
      applyFilters();
      return;
    }

    // Date buckets
    if (btn.dataset.date) {
      state.date = norm(btn.dataset.date) || "all";
      state.customDate = null;

      // If user clicks a bucket, clear the date picker value (optional but nice)
      if (datePicker) datePicker.value = "";

      setActive("date", btn);
      applyFilters();
      return;
    }
  });

  // ---- Date picker (exact date) ----
  if (datePicker) {
    datePicker.addEventListener("change", () => {
      const d = parseISO(datePicker.value);
      if (!d) {
        // cleared
        state.customDate = null;
        state.date = "all";
        // set "All" active if possible
        const allBtn = explorer.querySelector('[data-filter-group="date"] .seg[data-date="all"]');
        if (allBtn) setActive("date", allBtn);
        applyFilters();
        return;
      }

      state.customDate = d;
      state.date = "custom";

      // When using picker, remove active state from segmented buttons
      explorer.querySelectorAll('[data-filter-group="date"] .seg').forEach((b) => b.classList.remove("is-active"));
      applyFilters();
    });
  }

  // ---- Search ----
  if (searchEl) {
    let t = null;
    searchEl.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.q = searchEl.value || "";
        applyFilters();
      }, 150);
    });
  }

  // Initial render
  applyFilters();
}
