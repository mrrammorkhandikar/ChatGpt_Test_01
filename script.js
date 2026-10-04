(function () {
  const menuBtn = document.querySelector(".menu-btn");
  const links = document.querySelector(".links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      const open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    const grid = document.querySelector(bar.getAttribute("data-filter-bar"));
    if (!grid) return;
    const featuredOnly = bar.getAttribute("data-featured-only") === "true";
    bar.addEventListener("click", function (event) {
      const btn = event.target.closest("button");
      if (!btn || !bar.contains(btn)) return;
      bar.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      const filter = btn.getAttribute("data-filter");
      grid.querySelectorAll(".project").forEach(function (card) {
        const cat = card.getAttribute("data-cat");
        const featured = card.getAttribute("data-featured") === "true";
        const show = filter === "all" ? (featuredOnly ? featured : true) : cat === filter;
        card.hidden = !show;
      });
    });
  });

  document.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const scroller = document.querySelector(btn.getAttribute("data-scroll"));
      if (!scroller) return;
      scroller.scrollBy({ left: Math.max(240, scroller.clientWidth * 0.75), behavior: "smooth" });
    });
  });

  const form = document.querySelector(".brief");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const service = String(data.get("service") || "").trim();
      const message = String(data.get("message") || "").trim();
      const body = "Name: " + name + "\nEmail: " + email + "\nService: " + service + "\n\n" + message;
      window.location.href = "mailto:rammorkhandikar@gmail.com?subject=" + encodeURIComponent("Project enquiry from " + (name || "website")) + "&body=" + encodeURIComponent(body);
    });
  }
})();
