(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wide = window.matchMedia("(min-width: 981px)");

  var timeline = document.querySelector(".timeline");
  if (timeline && "IntersectionObserver" in window) {
    var marks = timeline.querySelectorAll("article");
    if (marks[0]) marks[0].classList.add("is-current");
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-current", entry.isIntersecting);
      });
    }, { rootMargin: "-42% 0px -42% 0px", threshold: 0.01 });
    marks.forEach(function (article) { watch.observe(article); });
  }

  var process = document.querySelector(".process-switch");
  if (process) {
    var mega = process.querySelector("[data-mega]");
    var stages = process.querySelectorAll("[data-pane]");
    var stageButtons = process.querySelectorAll("[data-panel]");
    var setStage = function (id) {
      stageButtons.forEach(function (button) {
        var on = button.getAttribute("data-panel") === id;
        button.classList.toggle("is-on", on);
        button.setAttribute("aria-selected", on ? "true" : "false");
      });
      var label = id.replace("step-", "");
      if (mega && label) mega.textContent = label.length === 1 ? "0" + label : label;
    };
    process.addEventListener("click", function (event) {
      var button = event.target.closest("[data-panel]");
      if (!button) return;
      setStage(button.getAttribute("data-panel"));
      if (!process.classList.contains("is-scroll")) return;
      var pane = document.getElementById(button.getAttribute("data-panel"));
      if (pane) pane.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
    var syncProcess = function () {
      var on = wide.matches && !reduce;
      process.classList.toggle("is-scroll", on);
    };
    syncProcess();
    if (wide.addEventListener) wide.addEventListener("change", syncProcess);
    if (!reduce && "IntersectionObserver" in window) {
      var stageWatch = new IntersectionObserver(function (entries) {
        if (!process.classList.contains("is-scroll")) return;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setStage(entry.target.id);
        });
      }, { rootMargin: "-46% 0px -46% 0px", threshold: 0.01 });
      stages.forEach(function (pane) { stageWatch.observe(pane); });
    }
  }

  var section = document.querySelector("[data-reel]");
  var track = section && section.querySelector(".project-grid");
  var bar = section && section.querySelector(".reel-progress i");
  var reelTrigger = null;

  function distance() {
    if (!section || !track) return 0;
    return Math.max(0, track.scrollWidth - section.clientWidth);
  }

  function clearReel() {
    if (reelTrigger) {
      reelTrigger.kill();
      reelTrigger = null;
    }
    if (section) section.classList.remove("is-reel");
    if (track && window.gsap) window.gsap.set(track, { clearProps: "transform" });
    if (bar) bar.style.transform = "scaleX(0)";
  }

  function setupReel() {
    if (!section || !track || reduce || !window.gsap || !window.ScrollTrigger) return;
    if (!wide.matches) {
      clearReel();
      return;
    }
    if (reelTrigger) {
      window.ScrollTrigger.refresh();
      return;
    }
    window.gsap.registerPlugin(window.ScrollTrigger);
    section.classList.add("is-reel");
    var tween = window.gsap.to(track, {
      x: function () { return -distance(); },
      ease: "none",
      paused: true
    });
    reelTrigger = window.ScrollTrigger.create({
      trigger: section,
      start: "top 80px",
      end: function () { return "+=" + Math.max(distance(), 1); },
      pin: true,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tween,
      onUpdate: function (self) {
        if (bar) bar.style.transform = "scaleX(" + self.progress + ")";
      }
    });
  }

  setupReel();
  document.addEventListener("projects:filtered", function () {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  window.addEventListener("resize", function () {
    if (!wide.matches) clearReel();
    else setupReel();
  });
})();
