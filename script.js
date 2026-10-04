(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce && "IntersectionObserver" in window) {
    var nodes = document.querySelectorAll(".proof, .section, .page-hero, .page-grid:not([data-reel]), .band, .footer-lead");
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    nodes.forEach(function (node) {
      node.classList.add("will-reveal");
      seen.observe(node);
    });
  }

  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var menuBtn = document.querySelector(".menu-btn");
  var links = document.querySelector(".links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open menu");
      });
    });
  }

  document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
    var grid = document.querySelector(bar.getAttribute("data-filter-bar"));
    if (!grid) return;
    var token = 0;
    bar.querySelectorAll("button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.classList.contains("active") ? "true" : "false");
    });
    bar.addEventListener("click", function (event) {
      var btn = event.target.closest("button");
      if (!btn || !bar.contains(btn)) return;
      bar.querySelectorAll("button").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var filter = btn.getAttribute("data-filter");
      var id = ++token;
      grid.querySelectorAll(".project").forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat") === filter;
        if (reduce) {
          card.hidden = !show;
          return;
        }
        if (show) {
          card.hidden = false;
          window.requestAnimationFrame(function () { card.classList.remove("is-out"); });
        } else if (!card.hidden) {
          card.classList.add("is-out");
          window.setTimeout(function () {
            if (token !== id) return;
            if (card.classList.contains("is-out")) card.hidden = true;
          }, 180);
        }
      });
      window.setTimeout(function () {
        document.dispatchEvent(new CustomEvent("projects:filtered"));
      }, reduce ? 0 : 200);
    });
  });

  document.querySelectorAll("[data-switch]").forEach(function (root) {
    var buttons = root.querySelectorAll("[data-panel]");
    var panes = root.querySelectorAll("[data-pane]");
    if (!buttons.length || !panes.length) return;
    root.classList.add("is-live");
    var activate = function (id) {
      var known = false;
      buttons.forEach(function (b) {
        if (b.getAttribute("data-panel") === id) known = true;
      });
      if (!known) return;
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-panel") === id;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      panes.forEach(function (pane) {
        pane.classList.toggle("is-on", pane.id === id);
      });
    };
    buttons.forEach(function (b) {
      b.setAttribute("aria-selected", b.classList.contains("is-on") ? "true" : "false");
      b.addEventListener("click", function () { activate(b.getAttribute("data-panel")); });
    });
    var hash = window.location.hash.replace("#", "");
    if (hash) activate(hash);
  });

  var sheet = document.querySelector("#sheet");
  var sheetBody = sheet && sheet.querySelector(".sheet-body");
  var opener = null;
  function openSheet(source, from) {
    if (!sheet || !sheetBody || !source) return;
    sheetBody.innerHTML = source.innerHTML;
    opener = from || document.activeElement;
    if (typeof sheet.showModal === "function") sheet.showModal();
    else sheet.setAttribute("open", "");
  }
  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openSheet(document.getElementById(btn.getAttribute("data-open")), btn);
    });
  });
  if (sheet) {
    sheet.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]")) sheet.close();
    });
    sheet.addEventListener("close", function () {
      if (opener && opener.focus) opener.focus();
    });
    var hashId = window.location.hash.replace("#", "");
    if (hashId) {
      var hashed = document.getElementById("dossier-" + hashId);
      var card = document.getElementById(hashId);
      if (card) card.scrollIntoView({ block: "center" });
      if (hashed) openSheet(hashed, card);
    }
  }

  var form = document.querySelector(".brief");
  if (form) {
    var status = form.querySelector(".form-status");
    var fields = [
      { name: "name", test: function (v) { return v.length > 1; }, message: "Add your name so we know who to reply to." },
      { name: "email", test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }, message: "Use an email address we can reply to." },
      { name: "message", test: function (v) { return v.length > 12; }, message: "Tell us what you want to build, even if it is only a paragraph." }
    ];
    function fieldOf(input) { return input.closest("label"); }
    function clearField(input) {
      input.removeAttribute("aria-invalid");
      var err = fieldOf(input).querySelector(".field-error");
      if (err) err.textContent = "";
    }
    function showError(input, message) {
      input.setAttribute("aria-invalid", "true");
      var err = fieldOf(input).querySelector(".field-error");
      if (err) err.textContent = message;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var first = null;
      var valid = true;
      fields.forEach(function (rule) {
        var input = form.elements[rule.name];
        var value = String(data.get(rule.name) || "").trim();
        if (!rule.test(value)) {
          valid = false;
          showError(input, rule.message);
          if (!first) first = input;
        } else clearField(input);
      });
      if (!valid) {
        if (status) status.hidden = true;
        if (first) first.focus();
        return;
      }
      var lines = [
        "Name: " + String(data.get("name") || "").trim(),
        "Email: " + String(data.get("email") || "").trim(),
        "Project type: " + String(data.get("service") || "").trim(),
        "Industry: " + (String(data.get("industry") || "").trim() || "Not specified"),
        "Who uses it: " + (String(data.get("users") || "").trim() || "Not specified"),
        "Timeline: " + (String(data.get("timeline") || "").trim() || "Not specified"),
        "",
        String(data.get("message") || "").trim()
      ];
      if (status) {
        status.hidden = false;
        status.textContent = "Your email app should open with this brief addressed to rammorkhandikar@gmail.com. Nothing is sent until you send that email.";
      }
      window.location.href = "mailto:rammorkhandikar@gmail.com?subject=" + encodeURIComponent("Project brief from " + (String(data.get("name") || "website").trim() || "website")) + "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }
})();
