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
