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
    const passwordField = signupForm.querySelector("#password");
    const confirmField = signupForm.querySelector("#confirmPassword");
    if (!note || !passwordField || !confirmField) {
      return;
    }

    if (passwordField.value !== confirmField.value) {
      note.textContent = "Passwords do not match.";
      note.classList.add("form-error");
      return;
    }

    window.location.href = "signin.html";
  });
}

const signinForm = document.querySelector("[data-signin-form]");
if (signinForm) {
  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const hasProfile = localStorage.getItem("hasProfile") === "true";
    window.location.href = hasProfile ? "dashboard.html" : "create-profile.html";
  });
}

const createProfileForm = document.querySelector("[data-create-profile-form]");
if (createProfileForm) {
  createProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fileInput = createProfileForm.querySelector(
      "[data-profile-photo-input]"
    );
    const primaryInput = createProfileForm.querySelector("[data-primary-photo]");
    if (fileInput && primaryInput) {
      const files = fileInput.files ? Array.from(fileInput.files) : [];
      if (!files.length) {
        alert("Please add at least one photo.");
        return;
      }
      if (primaryInput.value === "") {
        primaryInput.value = "0";
      }
    }
    localStorage.setItem("hasProfile", "true");
    window.location.href = "dashboard.html";
  });
}

const locationField = document.querySelector("[data-location-field]");
if (locationField && "geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (locationField.value) {
        return;
      }
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const endpoint =
        "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
        encodeURIComponent(latitude) +
        "&lon=" +
        encodeURIComponent(longitude);

      fetch(endpoint)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }
          return response.json();
        })
        .then((data) => {
          const address = data && data.address ? data.address : {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county;
          if (city) {
            locationField.value = city;
            return;
          }
          locationField.value =
            data && data.display_name ? data.display_name : "Unknown location";
        })
        .catch(() => {
          const lat = latitude.toFixed(5);
          const lng = longitude.toFixed(5);
          locationField.value = `Lat ${lat}, Lng ${lng}`;
        });
    },
    () => {}
  );
}

const photoInput = document.querySelector("[data-profile-photo-input]");
const photoPreviews = document.querySelector("[data-photo-previews]");
const primaryPhoto = document.querySelector("[data-primary-photo]");
if (photoInput && photoPreviews && primaryPhoto) {
  const renderPreviews = (files) => {
    photoPreviews.innerHTML = "";
    files.forEach((file, index) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = `Photo ${index + 1}`;

      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "primaryPhotoPick";
      radio.value = String(index);
      if (index === 0) {
        radio.checked = true;
        primaryPhoto.value = "0";
      }
      radio.addEventListener("change", () => {
        primaryPhoto.value = radio.value;
      });
      label.appendChild(radio);
      label.append(" Profile photo");

      card.appendChild(img);
      card.appendChild(label);
      photoPreviews.appendChild(card);
    });
  };

  photoInput.addEventListener("change", () => {
    const files = photoInput.files ? Array.from(photoInput.files) : [];
    if (files.length > 5) {
      alert("You can select up to 5 photos.");
      photoInput.value = "";
      photoPreviews.innerHTML = "";
      primaryPhoto.value = "";
      return;
    }
    if (!files.length) {
      photoPreviews.innerHTML = "";
      primaryPhoto.value = "";
      return;
    }
    renderPreviews(files);
  });
}
