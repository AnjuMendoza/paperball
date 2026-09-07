/* =========================================================
   Paperball / NPA — shared site behaviour
   ========================================================= */

(function navToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

(function revealOnScroll() {
  const groups = document.querySelectorAll("[data-reveal-group]");
  groups.forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.setAttribute("data-reveal", "");
      child.style.setProperty("--reveal-delay", String(i * 90));
    });
  });

  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((t) => observer.observe(t));
})();

(function countUp() {
  const stats = document.querySelectorAll(".stat .num[data-count]");
  if (stats.length === 0) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    stats.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  stats.forEach((s) => observer.observe(s));
})();

/* =========================================================
   Champions page — dynamic history list
   ========================================================= */
(function champions() {
  const list = document.querySelector("[data-champions-list]");
  if (!list) return;

  // Chronological order, oldest to newest.
  const titles = [
    { series: "Series Y1", champion: "A. Mendoza" },
    { series: "Series Y2", champion: "A. Mendoza" },
    { series: "Series X", champion: "A. Mendoza" },
    { series: "Series I", champion: "A. Zanello" },
    { series: "Series Diamond", champion: "A. Mendoza" },
    { series: "Series Slash", champion: "A. Zanello" },
    { series: "Series V", champion: "A. Zanello" },
    { series: "Series V2", champion: "A. Zanello" },
  ];

  const newestFirst = titles
    .map((t, i) => ({ ...t, order: i + 1 }))
    .reverse();

  const surnameOf = (name) => name.split(" ").pop();

  list.innerHTML = newestFirst
    .map((t, i) => {
      const isLatest = i === 0;
      return `
        <li class="champ-row" data-reveal style="--reveal-delay:${i * 90}">
          <span class="champ-index">No. ${String(t.order).padStart(2, "0")}</span>
          <span class="champ-series">${t.series}</span>
          <span class="champ-name">${t.champion}</span>
          ${isLatest ? '<span class="pill pill--dark champ-tag">Reigning Champion</span>' : ""}
        </li>`;
    })
    .join("");

  // tally for the summary row
  const tallies = titles.reduce((acc, t) => {
    const key = surnameOf(t.champion);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const summary = document.querySelector("[data-champions-summary]");
  if (summary) {
    summary.innerHTML = Object.entries(tallies)
      .map(
        ([name, count]) => `
        <div class="stat" data-reveal>
          <span class="num" data-count="${count}">0</span>
          <span class="label">${name} Titles</span>
        </div>`
      )
      .join("");
  }

  // re-run reveal observer for the freshly injected nodes
  const targets = list.querySelectorAll("[data-reveal]");
  const summaryTargets = summary ? summary.querySelectorAll("[data-reveal]") : [];
  const all = [...targets, ...summaryTargets];

  if (!("IntersectionObserver" in window)) {
    all.forEach((t) => t.classList.add("is-visible"));
  } else {
    const obs = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            o.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    all.forEach((t) => obs.observe(t));
  }

  // count-up for the newly added summary stats
  summaryTargets.forEach((wrap) => {
    const numEl = wrap.querySelector(".num[data-count]");
    if (!numEl) return;
    const target = parseFloat(numEl.getAttribute("data-count"));
    const io = new IntersectionObserver(
      (entries, o) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const duration = 1200;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            numEl.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          o.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    io.observe(wrap);
  });
})();
