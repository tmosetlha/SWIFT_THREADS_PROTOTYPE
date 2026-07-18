/* =========================================================================
   SWIFT THREADS — Prototype interactions
   BTM² · Bokgabo Mohlala & Tshiamo Mosetlha
   Splash + spinner, GSAP motion, auth modal, tabs, validation.
   Front-end only — no backend.
========================================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* =====================================================================
     SPLASH — welcome + loading spinner, then reveal the site
  ===================================================================== */
  var splash = document.getElementById("splash");
  var splashBarFill = document.getElementById("splashBarFill");
  var splashPct = document.getElementById("splashPct");
  var splashWelcome = document.getElementById("splashWelcome");
  var site = document.getElementById("site");

  var welcomeMessages = [
    "Welcome — initialising your delivery network",
    "Syncing live routes and drivers",
    "Calibrating smart matching engine",
    "Almost ready — securing your session",
  ];

  var progress = 0;
  var msgIndex = 0;

  document.body.classList.add("no-scroll");

  function tickSplash() {
    // organic-feeling progress
    var step = Math.random() * 9 + 4;
    progress = Math.min(100, progress + step);

    if (splashBarFill) splashBarFill.style.width = progress + "%";
    if (splashPct) splashPct.textContent = Math.floor(progress) + "%";

    var nextMsg = Math.min(
      welcomeMessages.length - 1,
      Math.floor((progress / 100) * welcomeMessages.length)
    );
    if (nextMsg !== msgIndex && splashWelcome) {
      msgIndex = nextMsg;
      swapWelcome(welcomeMessages[msgIndex]);
    }

    if (progress < 100) {
      setTimeout(tickSplash, Math.random() * 220 + 120);
    } else {
      setTimeout(endSplash, 520);
    }
  }

  function swapWelcome(text) {
    if (!hasGSAP || reduceMotion) {
      splashWelcome.textContent = text;
      return;
    }
    gsap.to(splashWelcome, {
      opacity: 0,
      y: -6,
      duration: 0.2,
      onComplete: function () {
        splashWelcome.textContent = text;
        gsap.to(splashWelcome, { opacity: 1, y: 0, duration: 0.3 });
      },
    });
  }

  function endSplash() {
    splash.classList.add("is-hidden");
    document.body.classList.remove("no-scroll");
    if (site) site.setAttribute("aria-hidden", "false");

    if (!hasGSAP || reduceMotion) {
      splash.style.display = "none";
      if (site) site.classList.add("is-ready");
      revealStatic();
      animateHero();
      return;
    }

    var tl = gsap.timeline();
    tl.to("#splashBadge", { scale: 0.5, opacity: 0, duration: 0.5, ease: "power2.in" }, 0)
      .to(".splash__inner", { y: -20, opacity: 0, duration: 0.5, ease: "power2.in" }, 0.05)
      .to(splash, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: function () {
          splash.style.display = "none";
        },
      }, 0.25)
      .add(function () {
        if (site) site.classList.add("is-ready");
        animateHero();
      }, 0.35);
  }

  // Splash entrance
  if (hasGSAP && !reduceMotion && splash) {
    gsap.from("#splashBadge", { scale: 0.4, opacity: 0, duration: 0.8, ease: "back.out(1.7)" });
    gsap.from(["#splashBrand", "#splashTitle", "#splashWelcome"], {
      y: 18, opacity: 0, duration: 0.7, stagger: 0.12, delay: 0.2, ease: "power3.out",
    });
    gsap.from(["#splashBar", "#splashPct", "#splashFoot"], {
      opacity: 0, duration: 0.6, delay: 0.6, stagger: 0.1,
    });
  }

  // kick off loading
  setTimeout(tickSplash, 650);

  /* =====================================================================
     HERO animation
  ===================================================================== */
  function animateHero() {
    if (!hasGSAP || reduceMotion) return;

    gsap.from("[data-hero]", {
      y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
    });
    gsap.from("[data-hero-panel]", {
      y: 40, opacity: 0, scale: 0.94, duration: 1, delay: 0.25, ease: "power3.out",
    });

    // floating panel loop
    gsap.to("[data-hero-panel]", {
      y: "-=12", duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1,
    });

    // animate the driver dot along the route
    var driver = document.getElementById("trackDriver");
    if (driver) {
      gsap.to(driver, {
        keyframes: [
          { left: "18%", top: "74%" },
          { left: "18%", top: "34%" },
          { left: "70%", top: "30%" },
        ],
        duration: 4,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      });
    }
  }

  /* =====================================================================
     SCROLL REVEALS
  ===================================================================== */
  function revealStatic() {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.style.opacity = 1;
      el.style.transform = "none";
    });
  }

  function initReveals() {
    if (!hasGSAP || !window.ScrollTrigger || reduceMotion) {
      revealStatic();
      return;
    }
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // count-up stats
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.4,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: function () {
          el.textContent = Math.floor(obj.v) + suffix;
        },
      });
    });
  }
  initReveals();

  /* =====================================================================
     NAV — scroll state + mobile toggle
  ===================================================================== */
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    if (!nav) return;
    if (window.scrollY > 20) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* =====================================================================
     MODULES tabs
  ===================================================================== */
  var moduleTabs = document.querySelectorAll(".modules__tab");
  moduleTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      moduleTabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      document.querySelectorAll(".modules__panel").forEach(function (p) {
        if (p.getAttribute("data-panel") === target) {
          p.hidden = false;
          p.classList.add("is-active");
        } else {
          p.hidden = true;
          p.classList.remove("is-active");
        }
      });
    });
  });

  /* =====================================================================
     AUTH MODAL
  ===================================================================== */
  var authModal = document.getElementById("authModal");
  var authDialog = document.getElementById("authDialog");
  var tabGlow = document.getElementById("tabGlow");
  var authDone = document.getElementById("authDone");
  var lastFocus = null;

  function openAuth(tab) {
    lastFocus = document.activeElement;
    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    switchTab(tab || "login");
    resetDone();

    if (hasGSAP && !reduceMotion) {
      gsap.fromTo(authDialog,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" }
      );
      gsap.fromTo(".modal__overlay", { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }

    var firstInput = document.querySelector(".authform.is-active .field__input");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 120);
  }

  function closeAuth() {
    if (hasGSAP && !reduceMotion) {
      gsap.to(authDialog, {
        opacity: 0, y: 20, scale: 0.97, duration: 0.3, ease: "power2.in",
        onComplete: finishClose,
      });
    } else {
      finishClose();
    }
  }

  function finishClose() {
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  function switchTab(which) {
    var isRegister = which === "register";

    document.getElementById("tabLogin").classList.toggle("is-active", !isRegister);
    document.getElementById("tabLogin").setAttribute("aria-selected", String(!isRegister));
    document.getElementById("tabRegister").classList.toggle("is-active", isRegister);
    document.getElementById("tabRegister").setAttribute("aria-selected", String(isRegister));

    if (tabGlow) tabGlow.classList.toggle("is-right", isRegister);

    var formLogin = document.getElementById("formLogin");
    var formRegister = document.getElementById("formRegister");

    resetDone();
    formLogin.hidden = isRegister;
    formLogin.classList.toggle("is-active", !isRegister);
    formRegister.hidden = !isRegister;
    formRegister.classList.toggle("is-active", isRegister);

    if (hasGSAP && !reduceMotion) {
      var active = isRegister ? formRegister : formLogin;
      gsap.fromTo(active.querySelectorAll(".field, .authform__title, .authform__sub, .segment, .check, .btn, .authform__swap"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }
      );
    }
  }

  function resetDone() {
    if (authDone) authDone.hidden = true;
  }

  // open triggers
  document.querySelectorAll("[data-auth-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openAuth(btn.getAttribute("data-auth-open"));
    });
  });
  // close triggers
  document.querySelectorAll("[data-auth-close]").forEach(function (btn) {
    btn.addEventListener("click", closeAuth);
  });
  // tab switch triggers (inside modal)
  document.querySelectorAll("[data-auth-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchTab(btn.getAttribute("data-auth-tab"));
    });
  });

  // esc to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("is-open")) closeAuth();
  });

  /* ---- register role segment ---- */
  document.querySelectorAll(".segment__opt input").forEach(function (input) {
    input.addEventListener("change", function () {
      document.querySelectorAll(".segment__opt").forEach(function (opt) {
        opt.classList.toggle("is-active", opt.contains(input) && input.checked);
      });
    });
  });

  /* =====================================================================
     FORM validation (front-end only)
  ===================================================================== */
  function validateField(input) {
    var wrap = input.closest(".field");
    var errorEl = wrap ? wrap.querySelector("[data-error]") : null;
    var msg = "";
    var val = input.value.trim();

    if (input.required && !val) {
      msg = "This field is required.";
    } else if (input.type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = "Enter a valid email address.";
    } else if (input.type === "password" && val && val.length < 6) {
      msg = "Use at least 6 characters.";
    } else if (input.type === "tel" && val && val.replace(/[^0-9]/g, "").length < 7) {
      msg = "Enter a valid phone number.";
    }

    if (errorEl) errorEl.textContent = msg;
    input.classList.toggle("is-invalid", !!msg);
    return !msg;
  }

  function handleSubmit(form, role) {
    var inputs = form.querySelectorAll(".field__input");
    var valid = true;
    inputs.forEach(function (input) {
      if (!validateField(input)) valid = false;
    });

    // terms checkbox for register
    var terms = form.querySelector('input[name="terms"]');
    if (terms && !terms.checked) {
      valid = false;
      terms.parentElement.style.color = "#ff8a97";
    } else if (terms) {
      terms.parentElement.style.color = "";
    }

    if (!valid) {
      if (hasGSAP && !reduceMotion) {
        gsap.fromTo(authDialog, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1,0.4)" });
      }
      return;
    }

    // success — prototype, no backend
    showDone(form);
  }

  function showDone(form) {
    var isRegister = form.getAttribute("data-auth-form") === "register";
    var doneTitle = document.getElementById("doneTitle");
    var doneMsg = document.getElementById("doneMsg");

    document.getElementById("formLogin").hidden = true;
    document.getElementById("formLogin").classList.remove("is-active");
    document.getElementById("formRegister").hidden = true;
    document.getElementById("formRegister").classList.remove("is-active");

    if (isRegister) {
      var role = form.querySelector('input[name="role"]:checked');
      var roleName = role ? role.value : "customer";
      var name = form.querySelector('input[name="name"]').value.trim();
      doneTitle.textContent = "Welcome" + (name ? ", " + name.split(" ")[0] : "") + "!";
      doneMsg.textContent = "Your " + roleName + " account is ready in this prototype — no data was sent anywhere.";
    } else {
      doneTitle.textContent = "You're in";
      doneMsg.textContent = "Logged in for this prototype — no data was sent anywhere.";
    }

    authDone.hidden = false;
    if (hasGSAP && !reduceMotion) {
      gsap.fromTo(authDone,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
      );
      gsap.fromTo(".authform__check",
        { scale: 0 },
        { scale: 1, duration: 0.6, delay: 0.1, ease: "back.out(2)" }
      );
    }
    form.reset();
  }

  ["formLogin", "formRegister"].forEach(function (id) {
    var form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSubmit(form);
    });
    form.querySelectorAll(".field__input").forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.classList.contains("is-invalid")) validateField(input);
      });
    });
  });

  /* =====================================================================
     Smooth anchor offset for fixed nav
  ===================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id === "#" || id === "#top") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
})();
