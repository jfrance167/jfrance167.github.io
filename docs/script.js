"use strict";

/*
  Security notes:
  - No user input is collected or transmitted.
  - Content is never injected with innerHTML; state changes use safe DOM APIs.
  - External links are static, allow-listed in HTML, and isolated with
    rel="noopener noreferrer".
*/

(() => {
  document.documentElement.classList.add("js-enabled");

  const header = document.querySelector("[data-header]");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const closeMenu = () => {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navLinks.classList.toggle("is-open", willOpen);
      document.body.classList.toggle("nav-open", willOpen);
    });

    sectionLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        navToggle.focus();
      }
    });

    document.documentElement.classList.add("menu-ready");
  }

  const setHeaderState = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if ("IntersectionObserver" in window) {
    if (reduceMotion) {
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10%", threshold: 0.08 }
      );

      document.querySelectorAll(".reveal:not(.is-visible)").forEach((item) => {
        revealObserver.observe(item);
      });
    }

    const navigationObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        sectionLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
          if (isCurrent) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-25% 0px -60%", threshold: [0.01, 0.2, 0.5] }
    );

    sections.forEach((section) => navigationObserver.observe(section));
  } else {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
  }

  const portrait = document.querySelector("[data-portrait]");
  const portraitFallback = document.querySelector("[data-portrait-fallback]");

  if (portrait && portraitFallback) {
    const useFallback = () => {
      portrait.classList.add("is-missing");
      portraitFallback.removeAttribute("aria-hidden");
      portraitFallback.setAttribute("role", "img");
      portraitFallback.setAttribute("aria-label", "Professional photo placeholder for Jacob Franciosa");
    };

    portrait.addEventListener("error", useFallback, { once: true });
    portrait.addEventListener("load", () => portraitFallback.setAttribute("hidden", ""), { once: true });

    if (portrait.complete && portrait.naturalWidth === 0) useFallback();
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
