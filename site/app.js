"use strict";

const pageName = document.body?.dataset?.page;
if (pageName) {
  const navLinks = document.querySelectorAll("[data-nav]");
  navLinks.forEach((link) => {
    if (link.getAttribute("data-nav") === pageName) {
      link.classList.add("active");
    }
  });
}

const signupForm = document.querySelector("[data-signup-form]");
if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = document.querySelector("[data-signup-note]");
    if (note) {
      note.textContent =
        "Static demo mode is enabled. Signup is disabled in this build.";
      note.classList.add("form-error");
    }
  });
}
