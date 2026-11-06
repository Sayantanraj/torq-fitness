/* =========================================================
   TORQ FITNESS — script.js  (no backend; WhatsApp-only)
   ========================================================= */
(() => {
  "use strict";

  const WA_NUMBER = "918336044261"; // primary WhatsApp number (+91 83360 44261)
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  const openWA = (msg) => window.open(waLink(msg), "_blank", "noopener");

  /* ---------- toast ---------- */
  const toast = document.createElement("div");
  toast.className = "toast";
  document.body.appendChild(toast);
  let toastT;
  const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("is-show"), 2800);
  };

  /* ---------- preloader ---------- */
  document.body.classList.add("is-loading");
  const preloader = $("#preloader");
  const bar = $(".preloader__bar span");
  const heroImgs = ["gym11.webp", "gym13.webp", "gym9.webp", "gym2.webp", "logo-transparent.png"];
  let loaded = 0;
  const start = performance.now();

  const finishLoading = () => {
    if (document.body.classList.contains("is-ready")) return;
    bar.style.width = "100%";
    const wait = Math.max(0, 900 - (performance.now() - start));
    setTimeout(() => {
      preloader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    }, wait + 250);
  };

  heroImgs.forEach((src) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded++;
      bar.style.width = `${(loaded / heroImgs.length) * 100}%`;
      if (loaded === heroImgs.length) finishLoading();
    };
    img.src = `assets/img/${src}`;
  });
  setTimeout(finishLoading, 4000); // safety net

  /* ---------- year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- WhatsApp links ---------- */
  $$(".js-wa").forEach((el) => {
    const msg = el.dataset.msg || "Hi TORQ FITNESS!";
    el.setAttribute("href", waLink(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  $$(".js-plan").forEach((btn) => {
    const card = btn.closest(".plan");
    const plan = card.dataset.plan;
    const price = Number(card.dataset.price).toLocaleString("en-IN");
    const msg =
      `Hi TORQ FITNESS! 💪\n\nI'm interested in the *${plan}* membership plan (₹${price}).\n` +
      `Please share the details and how I can join.\n\n(Admission fee ₹800 noted.)`;
    btn.setAttribute("href", waLink(msg));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });

  /* ---------- nav: scroll states, progress, hide on scroll ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  let lastY = 0;
  let ticking = false;

  const parallaxEls = $$("[data-parallax]");

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-scrolled", y > 40);
    if (!document.body.classList.contains("menu-open")) {
      nav.classList.toggle("is-hidden", y > lastY && y > 500);
    }
    lastY = y;

    if (!reduceMotion) {
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const backdrop = $("#navBackdrop");
  const setMenu = (open) => {
    burger.classList.toggle("is-open", open);
    navLinks.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    nav.classList.remove("is-hidden");
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));
  backdrop.addEventListener("click", () => setMenu(false));
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", () => { if (innerWidth > 920) setMenu(false); });

  // swipe the drawer back to the right to close it (follows the finger)
  let dragX = null, dragDx = 0;
  navLinks.addEventListener("touchstart", (e) => {
    if (!navLinks.classList.contains("is-open")) return;
    dragX = e.touches[0].clientX; dragDx = 0;
    navLinks.classList.add("is-dragging");
  }, { passive: true });
  navLinks.addEventListener("touchmove", (e) => {
    if (dragX === null) return;
    dragDx = Math.max(0, e.touches[0].clientX - dragX);
    navLinks.style.transform = `translateX(${dragDx}px)`;
  }, { passive: true });
  navLinks.addEventListener("touchend", () => {
    if (dragX === null) return;
    navLinks.classList.remove("is-dragging");
    navLinks.style.transform = "";
    if (dragDx > 70) setMenu(false);
    dragX = null;
  });

  /* ---------- active nav link ---------- */
  const sectionLinks = $$('.nav__links a[href^="#"]:not(.btn)');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        sectionLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionObs.observe(s));

  /* ---------- hero slideshow ---------- */
  const slides = $$(".hero__slide");
  const dotsWrap = $("#heroDots");
  let current = 0;
  let slideTimer;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Show slide ${i + 1}`);
    b.addEventListener("click", () => goSlide(i));
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);
  const goSlide = (i) => {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    // restart the dot animation
    void dots[current].offsetWidth;
    dots[current].classList.add("is-active");
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goSlide(current + 1), 6000);
  };
  goSlide(0);

  /* ---------- reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("is-in");
      revealObs.unobserve(el);
      // drop the stagger delay so hover effects respond instantly afterwards
      setTimeout(() => { el.style.transitionDelay = "0s"; }, 1600);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- counters ---------- */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.target;
      const dur = 1600;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".counter").forEach((c) => counterObs.observe(c));

  /* ---------- desktop-only fancy interactions ---------- */
  if (finePointer && !reduceMotion) {
    // custom cursor
    const cursor = $("#cursor");
    const dot = $("#cursorDot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    });
    const loop = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, .g-item, input, select, textarea, .chip"));
    });
    document.addEventListener("mouseleave", () => { cursor.style.opacity = 0; dot.style.opacity = 0; });
    document.addEventListener("mouseenter", () => { cursor.style.opacity = 1; dot.style.opacity = 1; });

    // magnetic buttons
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    // 3D tilt
    $$(".tilt, .plan").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
        if (!card.classList.contains("is-in") && card.classList.contains("reveal")) return;
        card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- lightbox ---------- */
  const items = $$(".g-item");
  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCount = $("#lbCount");
  let lbIndex = 0;
  const showLb = (i) => {
    lbIndex = (i + items.length) % items.length;
    const it = items[lbIndex];
    lbImg.style.opacity = 0;
    setTimeout(() => {
      lbImg.onload = () => (lbImg.style.opacity = 1);
      lbImg.alt = $("img", it).alt;
      lbImg.src = it.getAttribute("href");
    }, 150);
    lbCount.textContent = `${String(lbIndex + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  };
  const openLb = (i) => {
    showLb(i);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  items.forEach((it, i) => it.addEventListener("click", (e) => { e.preventDefault(); openLb(i); }));
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => showLb(lbIndex - 1));
  $("#lbNext").addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  window.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
  });
  // swipe on touch
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- BMI calculator ---------- */
  const bmiForm = $("#bmiForm");
  const bmiResult = $("#bmiResult");
  const gaugeFill = $("#gaugeFill");
  const needle = $("#gaugeNeedle");
  const bmiValue = $("#bmiValue");
  const bmiLabel = $("#bmiLabel");
  const bmiTip = $("#bmiTip");
  const bmiWa = $("#bmiWa");
  const ARC = 267;

  bmiForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const hEl = $("#height"), wEl = $("#weight");
    const h = parseFloat(hEl.value), w = parseFloat(wEl.value);
    hEl.classList.toggle("is-invalid", !(h >= 100 && h <= 250));
    wEl.classList.toggle("is-invalid", !(w >= 25 && w <= 300));
    if (!(h >= 100 && h <= 250) || !(w >= 25 && w <= 300)) {
      showToast("Please enter a valid height (100 to 250 cm) and weight (25 to 300 kg).");
      return;
    }
    const bmi = w / Math.pow(h / 100, 2);
    let cat, color, tip, goal;
    if (bmi < 18.5) { cat = "Underweight"; color = "#3fa9f5"; tip = "Focus on strength training and a calorie-surplus diet to build healthy mass."; goal = "gain healthy weight / muscle"; }
    else if (bmi < 25) { cat = "Healthy"; color = "#2ecc71"; tip = "Great shape! Build strength and definition with a structured program."; goal = "build strength and tone up"; }
    else if (bmi < 30) { cat = "Overweight"; color = "#f5b041"; tip = "Cardio, strength work and a smart diet chart will get you to your goal fast."; goal = "lose fat"; }
    else { cat = "Obese"; color = "#e3182d"; tip = "Start with guided training and a custom diet plan. We'll support you every step."; goal = "lose weight safely"; }

    const pct = Math.min(Math.max((bmi - 10) / 30, 0), 1);
    bmiResult.classList.add("is-show");
    gaugeFill.style.stroke = color;
    requestAnimationFrame(() => {
      gaugeFill.style.strokeDashoffset = ARC * (1 - pct);
      needle.style.transform = `rotate(${-90 + pct * 180}deg)`;
    });
    bmiLabel.textContent = cat;
    bmiLabel.style.color = color;
    bmiTip.textContent = tip;

    // animate number
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1200, 1);
      bmiValue.textContent = (bmi * (1 - Math.pow(1 - p, 3))).toFixed(1);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    bmiWa.href = waLink(
      `Hi TORQ FITNESS! 💪\n\nI checked my BMI on your website:\n• Height: ${h} cm\n• Weight: ${w} kg\n• BMI: ${bmi.toFixed(1)} (${cat})\n\nI want to ${goal}. Please suggest a plan.`
    );
  });

  /* ---------- enquiry form -> WhatsApp ---------- */
  let chosenPlan = "6 Months";
  $$("#planChips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#planChips .chip").forEach((c) => c.classList.remove("is-on"));
      chip.classList.add("is-on");
      chosenPlan = chip.dataset.v;
    });
  });

  const enquiry = $("#enquiryForm");
  const formError = $("#formError");
  enquiry.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameEl = $("#eName"), phoneEl = $("#ePhone");
    const name = nameEl.value.trim();
    const phone = phoneEl.value.replace(/\D/g, "").slice(-10);
    const okName = name.length >= 2;
    const okPhone = /^[6-9]\d{9}$/.test(phone);
    nameEl.classList.toggle("is-invalid", !okName);
    phoneEl.classList.toggle("is-invalid", !okPhone);
    if (!okName || !okPhone) {
      formError.textContent = !okName ? "Please enter your name." : "Please enter a valid 10-digit mobile number.";
      return;
    }
    formError.textContent = "";
    const goal = $("#eGoal").value;
    const note = $("#eMsg").value.trim();
    const msg =
      `Hi TORQ FITNESS! 👋\n\n*New Enquiry*\n` +
      `• Name: ${name}\n• Phone: ${phone}\n• Goal: ${goal}\n• Plan: ${chosenPlan}` +
      (note ? `\n• Message: ${note}` : "");
    openWA(msg);
    showToast("Opening WhatsApp…");
    enquiry.reset();
  });
  $$("#enquiryForm input").forEach((i) => i.addEventListener("input", () => i.classList.remove("is-invalid")));
})();
