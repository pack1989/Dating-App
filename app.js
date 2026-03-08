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

const createProfileFormGuard = document.querySelector("[data-create-profile-form]");
if (createProfileFormGuard) {
  // Safety net: never allow native form POST (prevents HTTP 405 on static hosts).
  createProfileFormGuard.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

const navRoot = document.querySelector(".site-header .nav");

const getCurrentSessionIdentity = () => {
  let email = (sessionStorage.getItem("currentUserEmail") || "").trim();
  let name = (sessionStorage.getItem("currentUserName") || "").trim();

  if (!email && !name) {
    // Backward-compatible fallback for sessions created before sessionStorage migration.
    const legacyEmail = (localStorage.getItem("currentUserEmail") || "").trim();
    const legacyName = (localStorage.getItem("currentUserName") || "").trim();
    if (legacyEmail || legacyName) {
      if (legacyEmail) sessionStorage.setItem("currentUserEmail", legacyEmail);
      if (legacyName) sessionStorage.setItem("currentUserName", legacyName);
      email = legacyEmail;
      name = legacyName;
    }
  }

  if ((!email || !name) && window.firebaseReady && window.firebaseServices?.auth?.currentUser) {
    const currentUser = window.firebaseServices.auth.currentUser;
    const authEmail = String(currentUser.email || "").trim();
    const authName = String(currentUser.displayName || "").trim();
    if (!email && authEmail) {
      sessionStorage.setItem("currentUserEmail", authEmail);
      email = authEmail;
    }
    if (!name && authName) {
      sessionStorage.setItem("currentUserName", authName);
      name = authName;
    }
  }

  return { email, name };
};

const renderCurrentUserIndicator = () => {
  if (!navRoot) return;
  const { email, name } = getCurrentSessionIdentity();
  let identity = name;
  if (!identity && email) {
    identity = String(email).split("@")[0];
  }
  if (!identity) {
    identity = "Member";
  }
  const existing = navRoot.querySelector("[data-current-user-indicator]");

  const indicator = existing || document.createElement("span");
  indicator.className = "current-user-indicator";
  indicator.setAttribute("data-current-user-indicator", "");
  indicator.textContent = `Signed in: ${identity}`;

  if (!existing) {
    const profileMenuShell = navRoot.querySelector(".profile-menu");
    if (profileMenuShell) {
      navRoot.insertBefore(indicator, profileMenuShell);
    } else {
      navRoot.appendChild(indicator);
    }
  }
};

try {
  renderCurrentUserIndicator();

  if (window.firebaseReady && window.firebaseServices?.auth?.onAuthStateChanged) {
    window.firebaseServices.auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.email) sessionStorage.setItem("currentUserEmail", String(user.email));
        if (user.displayName) sessionStorage.setItem("currentUserName", String(user.displayName));
      }
      renderCurrentUserIndicator();
    });
  }
} catch (error) {
  console.error("Unable to render current user indicator:", error);
}

const profileMenuToggle = document.querySelector("[data-profile-menu-toggle]");
const profileMenu = document.querySelector("[data-profile-menu]");
if (profileMenuToggle && profileMenu) {
  const setMenuOpen = (open) => {
    profileMenu.hidden = !open;
    profileMenuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  };

  profileMenuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = profileMenuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    if (
      !profileMenu.hidden &&
      !profileMenu.contains(event.target) &&
      !profileMenuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

const logoutButton = document.querySelector("[data-logout-button]");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const services = getFirebaseServices();
      if (services?.auth?.signOut) {
        await services.auth.signOut();
      }
    } catch (error) {
      console.error("Unable to sign out from Firebase auth:", error);
    }
    sessionStorage.removeItem("currentUserEmail");
    sessionStorage.removeItem("currentUserName");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
    window.location.href = "signin.html";
  });
}

const getFirebaseServices = () => {
  if (!window.firebaseReady || !window.firebaseServices) {
    return null;
  }
  return window.firebaseServices;
};

const LOCAL_USERS_KEY = "localTestUsers";
const LOCAL_PROFILES_KEY = "localTestProfiles";
const LOCAL_LIKES_KEY = "localProfileLikes";
const LOCAL_LIKE_SEEN_KEY = "localLikeSeenByUser";
const LOCAL_PROFILE_VIEWS_KEY = "localProfileViews";
const LOCAL_VIEW_SEEN_KEY = "localViewSeenByUser";
const LOCAL_CHAT_THREADS_KEY = "localChatThreads";
const LOCAL_CHAT_MESSAGES_KEY = "localChatMessages";
const LOCAL_MESSAGE_SEEN_KEY = "localMessageSeenByUser";
const LOCAL_DASH_FILTERS_KEY = "localDashboardFilters";
const LOCAL_USER_LAST_SIGNIN_KEY = "localUserLastSignInAt";
const SEEDED_TEST_EMAIL = "test@example.com";
const SEEDED_TEST_PASSWORD = "Test1234";
const SEEDED_SAMPLE_BASE = [
  {
    email: "amina@example.com",
    profileName: "Amina Yusuf",
    location: "Abuja",
    gender: "female",
    religion: "muslim",
    tribe: "hausa-fulani",
    languages: ["english", "hausa"],
    lookingFor: ["long-term", "marriage"]
  },
  {
    email: "chioma@example.com",
    profileName: "Chioma Okafor",
    location: "Enugu",
    gender: "female",
    religion: "christian",
    tribe: "igbo",
    languages: ["english", "igbo"],
    lookingFor: ["dating", "long-term"]
  },
  {
    email: "tunde@example.com",
    profileName: "Tunde Ade",
    location: "Ibadan",
    gender: "male",
    religion: "christian",
    tribe: "yoruba",
    languages: ["english", "yoruba"],
    lookingFor: ["dating"]
  }
];

const SEEDED_AVATAR_COLORS = [
  "#b91c1c",
  "#1d4ed8",
  "#0f766e",
  "#92400e",
  "#7c3aed",
  "#be123c",
  "#0369a1",
  "#166534",
  "#4f46e5",
  "#9f1239"
];

const toSeedEmail = (name, index) =>
  `${String(name || "member")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")}.${index + 1}@example.com`;

const SEEDED_TARGET_DASHBOARD_PROFILE_COUNT = 100;
const SEEDED_FIRST_NAMES = [
  "Zainab",
  "Fatima",
  "Mariam",
  "Hauwa",
  "Aisha",
  "Blessing",
  "Ifeoma",
  "Ngozi",
  "Adaobi",
  "Kemi",
  "Sade",
  "Tola",
  "Bisi",
  "Ebi",
  "Uduak",
  "Anita",
  "Ruth",
  "Deborah",
  "Grace",
  "Uchechi"
];
const SEEDED_LAST_NAMES = [
  "Bello",
  "Lawal",
  "Sani",
  "Garba",
  "Abubakar",
  "Eze",
  "Nwosu",
  "Umeh",
  "Chukwu",
  "Afolabi",
  "Ogunleye",
  "Akinola",
  "Fashola",
  "Tari",
  "Essien",
  "Orok",
  "Gyang",
  "Danjuma",
  "Idoko",
  "Nnamani"
];
const SEEDED_LOCATIONS = [
  "Lagos",
  "Abuja",
  "Kano",
  "Ibadan",
  "Enugu",
  "Port Harcourt",
  "Kaduna",
  "Abeokuta",
  "Uyo",
  "Calabar"
];
const SEEDED_RELIGIONS = ["christian", "muslim"];
const SEEDED_TRIBES = ["yoruba", "igbo", "hausa-fulani", "ijaw", "ibibio", "tiv"];
const SEEDED_LANGUAGE_SETS = [
  ["english", "yoruba"],
  ["english", "igbo"],
  ["english", "hausa"],
  ["english", "nigerian-pidgin"],
  ["english", "ibibio"]
];
const SEEDED_LOOKING_FOR = [
  ["dating"],
  ["long-term"],
  ["marriage"],
  ["dating", "long-term"],
  ["long-term", "marriage"]
];

const buildGeneratedSeedProfiles = (count, startIndex = 0) => {
  const generated = [];
  for (let i = 0; i < count; i += 1) {
    const seq = startIndex + i;
    const firstName = SEEDED_FIRST_NAMES[seq % SEEDED_FIRST_NAMES.length];
    const lastName = SEEDED_LAST_NAMES[Math.floor(seq / SEEDED_FIRST_NAMES.length) % SEEDED_LAST_NAMES.length];
    const profileName = `${firstName} ${lastName}`;
    generated.push({
      email: toSeedEmail(profileName, seq),
      profileName,
      location: SEEDED_LOCATIONS[seq % SEEDED_LOCATIONS.length],
      gender: "female",
      religion: SEEDED_RELIGIONS[seq % SEEDED_RELIGIONS.length],
      tribe: SEEDED_TRIBES[seq % SEEDED_TRIBES.length],
      languages: SEEDED_LANGUAGE_SETS[seq % SEEDED_LANGUAGE_SETS.length],
      lookingFor: SEEDED_LOOKING_FOR[seq % SEEDED_LOOKING_FOR.length],
      avatarColor: SEEDED_AVATAR_COLORS[seq % SEEDED_AVATAR_COLORS.length]
    });
  }
  return generated;
};

const SEEDED_SAMPLE_PROFILES = [
  ...SEEDED_SAMPLE_BASE.map((entry, index) => ({
    ...entry,
    avatarColor: SEEDED_AVATAR_COLORS[index % SEEDED_AVATAR_COLORS.length]
  })),
  ...buildGeneratedSeedProfiles(
    Math.max(
      0,
      SEEDED_TARGET_DASHBOARD_PROFILE_COUNT -
        SEEDED_SAMPLE_BASE.filter((entry) => entry.gender === "female").length
    ),
    SEEDED_SAMPLE_BASE.length
  )
];

const readLocalUsers = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const readLocalLastSignIns = () => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_LAST_SIGNIN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeLocalLastSignIns = (signIns) => {
  localStorage.setItem(LOCAL_USER_LAST_SIGNIN_KEY, JSON.stringify(signIns));
};

const markUserSignedIn = (email) => {
  const key = String(email || "").trim().toLowerCase();
  if (!key) {
    return;
  }
  const signIns = readLocalLastSignIns();
  signIns[key] = new Date().toISOString();
  writeLocalLastSignIns(signIns);
};

const readLocalProfiles = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const isStorageQuotaError = (error) => {
  if (!error) {
    return false;
  }
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014
  );
};

const writeLocalProfiles = (profiles) => {
  try {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
    return true;
  } catch (error) {
    if (isStorageQuotaError(error)) {
      return false;
    }
    throw error;
  }
};

const readLocalLikes = () => {
  try {
    const raw = localStorage.getItem(LOCAL_LIKES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalLikes = (likes) => {
  localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likes));
};

const readLikeSeen = () => {
  try {
    const raw = localStorage.getItem(LOCAL_LIKE_SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeLikeSeen = (seenMap) => {
  localStorage.setItem(LOCAL_LIKE_SEEN_KEY, JSON.stringify(seenMap));
};

const readLocalViews = () => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalViews = (views) => {
  localStorage.setItem(LOCAL_PROFILE_VIEWS_KEY, JSON.stringify(views));
};

const readViewSeen = () => {
  try {
    const raw = localStorage.getItem(LOCAL_VIEW_SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeViewSeen = (seenMap) => {
  localStorage.setItem(LOCAL_VIEW_SEEN_KEY, JSON.stringify(seenMap));
};

const readLocalChatThreads = () => {
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_THREADS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalChatThreads = (threads) => {
  localStorage.setItem(LOCAL_CHAT_THREADS_KEY, JSON.stringify(threads));
};

const readLocalChatMessages = () => {
  try {
    const raw = localStorage.getItem(LOCAL_CHAT_MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalChatMessages = (messages) => {
  localStorage.setItem(LOCAL_CHAT_MESSAGES_KEY, JSON.stringify(messages));
};

const readMessageSeen = () => {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGE_SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeMessageSeen = (seenMap) => {
  localStorage.setItem(LOCAL_MESSAGE_SEEN_KEY, JSON.stringify(seenMap));
};

const getUniqueIncomingCount = (entries, email) => {
  const key = String(email || "").trim().toLowerCase();
  if (!key || !Array.isArray(entries)) return 0;
  const uniqueSenders = new Set();
  entries.forEach((entry) => {
    if (!entry || entry.to !== key || !entry.from) {
      return;
    }
    uniqueSenders.add(String(entry.from).trim().toLowerCase());
  });
  return uniqueSenders.size;
};

const toDayKey = (value) => {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return "";
  }
  return new Date(parsed).toISOString().slice(0, 10);
};

const getUniqueIncomingCountByDay = (entries, email) => {
  const key = String(email || "").trim().toLowerCase();
  if (!key || !Array.isArray(entries)) return 0;
  const uniquePairs = new Set();
  entries.forEach((entry) => {
    if (!entry || entry.to !== key || !entry.from) {
      return;
    }
    const sender = String(entry.from).trim().toLowerCase();
    const dayKey = toDayKey(entry.at);
    if (!sender || !dayKey) {
      return;
    }
    uniquePairs.add(`${sender}::${dayKey}`);
  });
  return uniquePairs.size;
};

const formatTimeAgo = (value) => {
  const then = Date.parse(String(value || ""));
  if (!Number.isFinite(then)) {
    return "";
  }
  const diffMs = Math.max(0, Date.now() - then);
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffMs / dayMs);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const getUnreadLikesCount = (email, likes = null, seenMap = null) => {
  const key = String(email || "").trim().toLowerCase();
  if (!key) return 0;
  const allLikes = Array.isArray(likes) ? likes : readLocalLikes();
  const likedToUser = getUniqueIncomingCount(allLikes, key);
  const seen = Number((seenMap || readLikeSeen())[key] || 0);
  return Math.max(0, likedToUser - seen);
};

const getUnreadViewsCount = (email, views = null, seenMap = null) => {
  const key = String(email || "").trim().toLowerCase();
  if (!key) return 0;
  const allViews = Array.isArray(views) ? views : readLocalViews();
  const viewedToUser = getUniqueIncomingCountByDay(allViews, key);
  const seen = Number((seenMap || readViewSeen())[key] || 0);
  return Math.max(0, viewedToUser - seen);
};

const readDashboardFilters = () => {
  try {
    const raw = localStorage.getItem(LOCAL_DASH_FILTERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeDashboardFilters = (filters) => {
  localStorage.setItem(LOCAL_DASH_FILTERS_KEY, JSON.stringify(filters));
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const fileToDataUrl = async (file) => {
  if (!file || !String(file.type || "").startsWith("image/")) {
    return readFileAsDataUrl(file);
  }
  try {
    const imageUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;
    });
    const maxDimension = 900;
    const width = image.naturalWidth || image.width || maxDimension;
    const height = image.naturalHeight || image.height || maxDimension;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(imageUrl);
      return readFileAsDataUrl(file);
    }
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    const compressed = canvas.toDataURL("image/jpeg", 0.72);
    URL.revokeObjectURL(imageUrl);
    return compressed;
  } catch (error) {
    return readFileAsDataUrl(file);
  }
};

const compressDataUrlImage = async (source, maxDimension = 700, quality = 0.62) => {
  if (!source || !String(source).startsWith("data:image/")) {
    return source;
  }
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load data url image"));
      img.src = source;
    });
    const width = image.naturalWidth || image.width || maxDimension;
    const height = image.naturalHeight || image.height || maxDimension;
    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return source;
    }
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    return canvas.toDataURL("image/jpeg", quality);
  } catch (error) {
    return source;
  }
};

const createAvatarDataUrl = (name, background) => {
  const label = (name || "M").trim().charAt(0).toUpperCase() || "M";
  const bg = background || "#111111";
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'>` +
    `<rect width='360' height='360' fill='${bg}'/>` +
    "<circle cx='180' cy='140' r='72' fill='rgba(255,255,255,0.18)'/>" +
    "<rect x='64' y='230' width='232' height='92' rx='46' fill='rgba(255,255,255,0.16)'/>" +
    `<text x='180' y='198' text-anchor='middle' font-size='92' fill='#ffffff' font-family='Arial, sans-serif' font-weight='700'>${label}</text>` +
    "</svg>";
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const localPasswordHash = (password) => {
  return btoa(unescape(encodeURIComponent(password)));
};

const createLocalUser = ({ firstName, lastName, phone, email, password }) => {
  return {
    id: `local-${Date.now()}`,
    firstName,
    lastName,
    phone,
    email,
    passwordHash: localPasswordHash(password),
    createdAt: new Date().toISOString()
  };
};

const seedHardcodedLocalTestUser = () => {
  const services = getFirebaseServices();
  if (services) {
    return;
  }

  const users = readLocalUsers();
  const exists = users.some((entry) => entry.email === SEEDED_TEST_EMAIL);
  if (!exists) {
    users.push(
      createLocalUser({
        firstName: "Test",
        lastName: "User",
        phone: "+2340000000000",
        email: SEEDED_TEST_EMAIL,
        password: SEEDED_TEST_PASSWORD
      })
    );
    writeLocalUsers(users);
  }

  const profiles = readLocalProfiles();
  if (!profiles[SEEDED_TEST_EMAIL]) {
    profiles[SEEDED_TEST_EMAIL] = {
      profileName: "Test User",
      location: "Lagos",
      bio: "Seeded local test profile.",
      gender: "male",
      religion: "christian",
      tribe: "yoruba",
      languages: ["english", "yoruba"],
      lookingFor: ["dating", "long-term"],
      photos: [],
      primaryPhotoIndex: 0,
      completedAt: new Date().toISOString()
    };
  }

  SEEDED_SAMPLE_PROFILES.forEach((entry) => {
    if (profiles[entry.email]) {
      return;
    }
    profiles[entry.email] = {
      profileName: entry.profileName,
      location: entry.location,
      bio: "Seeded local sample profile.",
      gender: entry.gender,
      religion: entry.religion,
      tribe: entry.tribe,
      languages: entry.languages,
      lookingFor: entry.lookingFor,
      photos: [createAvatarDataUrl(entry.profileName, entry.avatarColor)],
      primaryPhotoIndex: 0,
      completedAt: new Date().toISOString()
    };
  });
  writeLocalProfiles(profiles);
};

const getOppositeGender = (gender) => {
  if (gender === "male") {
    return "female";
  }
  if (gender === "female") {
    return "male";
  }
  return "";
};

seedHardcodedLocalTestUser();

let createProfileExistingPhotos = [];
let createProfileExistingPrimaryIndex = 0;
let createProfilePhotoItems = [];

const toAuthMessage = (error, fallback) => {
  const code = error && error.code ? error.code : "";
  if (code === "auth/email-already-in-use") {
    return "That email is already in use.";
  }
  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }
  if (code === "auth/weak-password") {
    return "Password is too weak. Use at least 8 characters.";
  }
  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential"
  ) {
    return "Invalid email or password.";
  }
  return fallback;
};

const signupForm = document.querySelector("[data-signup-form]");
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = document.querySelector("[data-signup-note]");
    const passwordField = signupForm.querySelector("#password");
    const confirmField = signupForm.querySelector("#confirmPassword");
    const firstNameField = signupForm.querySelector("#firstName");
    const lastNameField = signupForm.querySelector("#lastName");
    const phoneField = signupForm.querySelector("#phone");
    const emailField = signupForm.querySelector("#email");
    const submitButton = signupForm.querySelector("button[type='submit']");
    if (
      !note ||
      !passwordField ||
      !confirmField ||
      !firstNameField ||
      !lastNameField ||
      !phoneField ||
      !emailField
    ) {
      return;
    }

    note.classList.remove("form-error");
    note.textContent = "";

    if (passwordField.value !== confirmField.value) {
      note.textContent = "Passwords do not match.";
      note.classList.add("form-error");
      return;
    }

    if (passwordField.value.length < 8) {
      note.textContent = "Password must be at least 8 characters.";
      note.classList.add("form-error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const services = getFirebaseServices();
      if (!services) {
        const firstName = firstNameField.value.trim();
        const lastName = lastNameField.value.trim();
        const phone = phoneField.value.trim();
        const email = emailField.value.trim().toLowerCase();
        const users = readLocalUsers();
        const existing = users.find((entry) => entry.email === email);
        if (existing) {
          note.textContent = "That email is already in use.";
          note.classList.add("form-error");
          return;
        }
        users.push(
          createLocalUser({
            firstName,
            lastName,
            phone,
            email,
            password: passwordField.value
          })
        );
        writeLocalUsers(users);
        note.textContent = "Account saved locally. Redirecting to sign in...";
        setTimeout(() => {
          window.location.href = "signin.html";
        }, 700);
        return;
      }

      const firstName = firstNameField.value.trim();
      const lastName = lastNameField.value.trim();
      const phone = phoneField.value.trim();
      const email = emailField.value.trim().toLowerCase();

      const credential = await services.auth.createUserWithEmailAndPassword(
        email,
        passwordField.value
      );

      if (credential.user) {
        await credential.user.updateProfile({
          displayName: `${firstName} ${lastName}`.trim()
        });
      }

      if (services.db && credential.user) {
        await services.db.collection("users").doc(credential.user.uid).set(
          {
            uid: credential.user.uid,
            firstName,
            lastName,
            phone,
            email,
            createdAt: new Date().toISOString()
          },
          { merge: true }
        );
      }

      note.textContent = "Account created. Redirecting to sign in...";
      setTimeout(() => {
        window.location.href = "signin.html";
      }, 700);
    } catch (error) {
      note.textContent = toAuthMessage(error, "Unable to create account.");
      note.classList.add("form-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

const signinForm = document.querySelector("[data-signin-form]");
if (signinForm) {
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailField = signinForm.querySelector("#signin-username");
    const passwordField = signinForm.querySelector("#signin-password");
    const note = document.querySelector("[data-signin-note]");
    const submitButton = signinForm.querySelector("button[type='submit']");
    if (!emailField || !passwordField || !note) {
      return;
    }

    note.classList.remove("form-error");
    note.textContent = "";

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const services = getFirebaseServices();
      if (!services) {
        const email = emailField.value.trim().toLowerCase();
        const users = readLocalUsers();
        const user = users.find((entry) => entry.email === email);
        if (!user || user.passwordHash !== localPasswordHash(passwordField.value)) {
          note.textContent = "Invalid email or password.";
          note.classList.add("form-error");
          return;
        }
        sessionStorage.setItem("currentUserEmail", user.email || "");
        sessionStorage.setItem("currentUserName",
          `${user.firstName || ""} ${user.lastName || ""}`.trim()
        );
        markUserSignedIn(user.email);
        const profiles = readLocalProfiles();
        const hasProfile = Boolean(profiles[email]);
        window.location.href = hasProfile
          ? "dashboard.html"
          : "create-profile.html";
        return;
      }

      if (window.firebase?.auth?.Auth?.Persistence?.SESSION && services.auth?.setPersistence) {
        await services.auth.setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
      }
      const credential = await services.auth.signInWithEmailAndPassword(
        emailField.value.trim().toLowerCase(),
        passwordField.value
      );

      if (credential.user) {
        sessionStorage.setItem("currentUserEmail", credential.user.email || "");
        sessionStorage.setItem("currentUserName",
          credential.user.displayName || ""
        );
        markUserSignedIn(credential.user.email || "");
      }

      const signedInEmail = String(credential?.user?.email || "")
        .trim()
        .toLowerCase();
      const profiles = readLocalProfiles();
      const hasProfile = Boolean(signedInEmail && profiles[signedInEmail]);
      window.location.href = hasProfile ? "dashboard.html" : "create-profile.html";
    } catch (error) {
      note.textContent = toAuthMessage(error, "Unable to login.");
      note.classList.add("form-error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

const createProfileForm = document.querySelector("[data-create-profile-form]");
if (createProfileForm) {
  const languagePicker = createProfileForm.querySelector("#profile-languages");
  const languageList = createProfileForm.querySelector("[data-languages-list]");
  const languageInputs = createProfileForm.querySelector(
    "[data-languages-hidden-inputs]"
  );
  const languageError = createProfileForm.querySelector("[data-languages-error]");
  const lookingForPicker = createProfileForm.querySelector("#profile-looking-for");
  const lookingForList = createProfileForm.querySelector("[data-looking-for-list]");
  const lookingForInputs = createProfileForm.querySelector(
    "[data-looking-for-hidden-inputs]"
  );
  const createProfilePhotoInput = createProfileForm.querySelector(
    "[data-profile-photo-input]"
  );
  const lookingForError = createProfileForm.querySelector("[data-looking-for-error]");
  const languageSelections = new Map();
  const lookingForSelections = new Map();
  const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  const allProfiles = readLocalProfiles();
  const existingProfile =
    currentUserEmail && allProfiles[currentUserEmail]
      ? allProfiles[currentUserEmail]
      : null;
  const createProfileStatus = document.createElement("p");
  createProfileStatus.className = "form-note";
  createProfileStatus.setAttribute("data-create-profile-status", "");
  createProfileStatus.hidden = true;
  const createProfileHeading = createProfileForm.querySelector("h1");
  if (createProfileHeading && createProfileHeading.nextSibling) {
    createProfileForm.insertBefore(createProfileStatus, createProfileHeading.nextSibling);
  } else if (createProfileHeading) {
    createProfileForm.appendChild(createProfileStatus);
  }

  const showCreateProfileStatus = (message, isError = false) => {
    if (!createProfileStatus) {
      return;
    }
    createProfileStatus.textContent = message || "";
    createProfileStatus.classList.toggle("form-error", Boolean(isError));
    createProfileStatus.hidden = !message;
  };

  const getOptionLabel = (select, value) => {
    if (!select) {
      return value;
    }
    const option = Array.from(select.options).find((entry) => entry.value === value);
    return option ? option.text : value;
  };

  const renderLanguageSelections = () => {
    if (!languageList || !languageInputs) {
      return;
    }
    languageList.innerHTML = "";
    languageInputs.innerHTML = "";

    languageSelections.forEach((label, value) => {
      const tag = document.createElement("span");
      tag.className = "selected-tag";
      tag.textContent = label;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "selected-tag-remove";
      removeButton.textContent = "x";
      removeButton.setAttribute("aria-label", `Remove ${label}`);
      removeButton.addEventListener("click", () => {
        languageSelections.delete(value);
        renderLanguageSelections();
      });

      tag.appendChild(removeButton);
      languageList.appendChild(tag);

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "languages[]";
      input.value = value;
      languageInputs.appendChild(input);
    });

    if (languageError) {
      languageError.hidden = languageSelections.size > 0;
    }
  };

  const renderLookingForSelections = () => {
    if (!lookingForList || !lookingForInputs) {
      return;
    }
    lookingForList.innerHTML = "";
    lookingForInputs.innerHTML = "";

    lookingForSelections.forEach((label, value) => {
      const tag = document.createElement("span");
      tag.className = "selected-tag";
      tag.textContent = label;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "selected-tag-remove";
      removeButton.textContent = "x";
      removeButton.setAttribute("aria-label", `Remove ${label}`);
      removeButton.addEventListener("click", () => {
        lookingForSelections.delete(value);
        renderLookingForSelections();
      });

      tag.appendChild(removeButton);
      lookingForList.appendChild(tag);

      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "lookingFor[]";
      input.value = value;
      lookingForInputs.appendChild(input);
    });

    if (lookingForError) {
      lookingForError.hidden = lookingForSelections.size > 0;
    }
  };

  if (lookingForPicker) {
    lookingForPicker.addEventListener("change", () => {
      const value = lookingForPicker.value;
      if (!value) {
        return;
      }
      const label =
        lookingForPicker.options[lookingForPicker.selectedIndex]?.text || value;
      if (!lookingForSelections.has(value)) {
        lookingForSelections.set(value, label);
      }
      lookingForPicker.value = "";
      if (lookingForError) {
        lookingForError.hidden = lookingForSelections.size > 0;
      }
      renderLookingForSelections();
    });
  }

  if (languagePicker) {
    languagePicker.addEventListener("change", () => {
      const value = languagePicker.value;
      if (!value) {
        return;
      }
      const label = languagePicker.options[languagePicker.selectedIndex]?.text || value;
      if (!languageSelections.has(value)) {
        languageSelections.set(value, label);
      }
      languagePicker.value = "";
      if (languageError) {
        languageError.hidden = languageSelections.size > 0;
      }
      renderLanguageSelections();
    });
  }

  renderLanguageSelections();
  renderLookingForSelections();

  if (existingProfile && typeof existingProfile === "object") {
    const simpleFields = [
      "profileName",
      "location",
      "bio",
      "profession",
      "education",
      "gender",
      "heightCm",
      "weightKg",
      "religion",
      "smoking",
      "drinking",
      "kids",
      "kidsCount",
      "tribe",
      "tribeOther"
    ];

    simpleFields.forEach((fieldName) => {
      const field = createProfileForm.elements.namedItem(fieldName);
      if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLSelectElement) && !(field instanceof HTMLTextAreaElement)) {
        return;
      }
      const value = existingProfile[fieldName];
      if (value === undefined || value === null) {
        return;
      }
      field.value = String(value);
    });

    const existingLanguages = Array.isArray(existingProfile.languages)
      ? existingProfile.languages
      : [];
    existingLanguages.forEach((value) => {
      languageSelections.set(value, getOptionLabel(languagePicker, value));
    });

    const existingLookingFor = Array.isArray(existingProfile.lookingFor)
      ? existingProfile.lookingFor
      : [];
    existingLookingFor.forEach((value) => {
      lookingForSelections.set(value, getOptionLabel(lookingForPicker, value));
    });

    createProfileExistingPhotos = Array.isArray(existingProfile.photos)
      ? existingProfile.photos.slice(0, 5)
      : [];
    createProfileExistingPrimaryIndex = Number.isInteger(existingProfile.primaryPhotoIndex)
      ? existingProfile.primaryPhotoIndex
      : 0;
    createProfilePhotoItems = createProfileExistingPhotos.map((src) => ({
      src,
      isExisting: true
    }));
    if (createProfilePhotoInput) {
      createProfilePhotoInput.required = createProfileExistingPhotos.length === 0;
    }

    renderLanguageSelections();
    renderLookingForSelections();
  } else {
    createProfileExistingPhotos = [];
    createProfileExistingPrimaryIndex = 0;
    createProfilePhotoItems = [];
    if (createProfilePhotoInput) {
      createProfilePhotoInput.required = true;
    }
  }

  createProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const hasLanguage = languageSelections.size > 0;
      const hasLookingFor = lookingForSelections.size > 0;
      if (languageError) {
        languageError.hidden = hasLanguage;
      }
      if (!hasLanguage) {
        if (languageError) {
          languageError.hidden = false;
        }
        return;
      }
      if (lookingForError) {
        lookingForError.hidden = hasLookingFor;
      }
      if (!hasLookingFor) {
        if (lookingForError) {
          lookingForError.hidden = false;
        }
        return;
      }

      const fileInput = createProfileForm.querySelector(
        "[data-profile-photo-input]"
      );
      const primaryInput = createProfileForm.querySelector("[data-primary-photo]");
      if (fileInput && primaryInput) {
        const profileKey = currentUserEmail || `local-anon-${Date.now()}`;
        const formData = new FormData(createProfileForm);
        let photos = [];
        for (const item of createProfilePhotoItems) {
          if (!item || !item.src) {
            continue;
          }
          if (item.isExisting) {
            photos.push(item.src);
            continue;
          }
          if (item.file) {
            photos.push(await fileToDataUrl(item.file));
            if (String(item.src).startsWith("blob:")) {
              URL.revokeObjectURL(item.src);
            }
          }
        }
        if (!photos.length) {
          showCreateProfileStatus("Please add at least one photo.", true);
          return;
        }
        if (primaryInput.value === "") {
          primaryInput.value = String(
            Math.min(createProfileExistingPrimaryIndex, photos.length - 1)
          );
        }
        const parsedPrimary = Number.parseInt(primaryInput.value || "0", 10);
        const primaryPhotoIndex =
          Number.isInteger(parsedPrimary) && parsedPrimary >= 0 && parsedPrimary < photos.length
            ? parsedPrimary
            : 0;
        const profiles = readLocalProfiles();
        profiles[profileKey] = {
          profileName: String(formData.get("profileName") || "").trim(),
          location: String(formData.get("location") || "").trim(),
          bio: String(formData.get("bio") || "").trim(),
          profession: String(formData.get("profession") || "").trim(),
          education: String(formData.get("education") || "").trim(),
          gender: String(formData.get("gender") || "").trim(),
          heightCm: String(formData.get("heightCm") || "").trim(),
          weightKg: String(formData.get("weightKg") || "").trim(),
          religion: String(formData.get("religion") || "").trim(),
          smoking: String(formData.get("smoking") || "").trim(),
          drinking: String(formData.get("drinking") || "").trim(),
          kids: String(formData.get("kids") || "").trim(),
          kidsCount: String(formData.get("kidsCount") || "").trim(),
          tribe: String(formData.get("tribe") || "").trim(),
          tribeOther: String(formData.get("tribeOther") || "").trim(),
          languages: formData.getAll("languages[]"),
          lookingFor: formData.getAll("lookingFor[]"),
          photos,
          primaryPhotoIndex,
          completedAt: new Date().toISOString()
        };
        const didWriteProfiles = writeLocalProfiles(profiles);
        if (!didWriteProfiles) {
          const compactPhotos = [];
          for (const src of photos) {
            compactPhotos.push(await compressDataUrlImage(src));
          }
          profiles[profileKey].photos = compactPhotos;
          const didWriteWithCompression = writeLocalProfiles(profiles);
          if (!didWriteWithCompression) {
            showCreateProfileStatus(
              "Unable to save profile because photo storage is full. Delete some photos and try again.",
              true
            );
            return;
          }
          photos = compactPhotos;
        }
        createProfileExistingPhotos = photos.slice();
        createProfileExistingPrimaryIndex = primaryPhotoIndex;
        createProfilePhotoItems = createProfileExistingPhotos.map((src) => ({
          src,
          isExisting: true
        }));
      }
      window.location.replace("dashboard.html");
    } catch (error) {
      console.error(error);
      if (isStorageQuotaError(error)) {
        showCreateProfileStatus("Unable to save profile because browser storage is full.", true);
        return;
      }
      showCreateProfileStatus("Unable to save profile. Please try again.", true);
    }
  });
}

const dashboardGrid = document.querySelector("[data-dashboard-grid]");
if (dashboardGrid) {
  const dashboardEmpty = document.querySelector("[data-dashboard-empty]");
  const dashboardPagination = document.querySelector("[data-dashboard-pagination]");
  const dashboardPrev = document.querySelector("[data-dashboard-prev]");
  const dashboardNext = document.querySelector("[data-dashboard-next]");
  const dashboardPageNumbers = document.querySelector("[data-dashboard-page-numbers]");
  const likesBadge = document.querySelector("[data-likes-badge]");
  const viewsBadge = document.querySelector("[data-views-badge]");
  const messagesBadge = document.querySelector("[data-messages-badge]");
  const filterToggle = document.querySelector("[data-filter-toggle]");
  const filterModal = document.querySelector("[data-filter-modal]");
  const filterReligion = document.querySelector("[data-filter-religion]");
  const filterLookingFor = document.querySelector("[data-filter-looking-for]");
  const filterLocation = document.querySelector("[data-filter-location]");
  const filterApply = document.querySelector("[data-filter-apply]");
  const filterReset = document.querySelector("[data-filter-reset]");
  const filterClose = document.querySelector("[data-filter-close]");
  const localUsers = readLocalUsers();
  const localUserByEmail = new Map(
    localUsers
      .filter((entry) => entry && entry.email)
      .map((entry) => [String(entry.email).trim().toLowerCase(), entry])
  );
  const localLastSignIns = readLocalLastSignIns();
  const localProfiles = readLocalProfiles();
  const localLikes = readLocalLikes();
  const localViews = readLocalViews();
  const localChatMessages = readLocalChatMessages();
  const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  if (!currentUserEmail) {
    window.location.replace("signin.html");
  }
  const currentUserProfile = currentUserEmail ? localProfiles[currentUserEmail] : null;
  if (currentUserEmail && !currentUserProfile) {
    window.location.replace("create-profile.html");
  }
  const messageCount = currentUserEmail
    ? localChatMessages.filter((entry) => entry && entry.to === currentUserEmail).length
    : 0;
  const messageSeenMap = readMessageSeen();
  const seenMessageCount = Number(messageSeenMap[currentUserEmail] || 0);
  const unreadMessageCount = Math.max(0, messageCount - seenMessageCount);
  if (messagesBadge) {
    messagesBadge.textContent = String(unreadMessageCount);
    messagesBadge.hidden = unreadMessageCount === 0;
  }
  const receivedLikes = currentUserEmail
    ? localLikes.filter((entry) => entry.to === currentUserEmail)
    : [];
  const receivedViews = currentUserEmail
    ? localViews.filter((entry) => entry.to === currentUserEmail)
    : [];
  const likeSeenMap = readLikeSeen();
  const unreadLikeCount = getUnreadLikesCount(currentUserEmail, localLikes, likeSeenMap);
  const viewSeenMap = readViewSeen();
  const unreadViewCount = getUnreadViewsCount(currentUserEmail, localViews, viewSeenMap);
  if (likesBadge) {
    likesBadge.textContent = String(unreadLikeCount);
    likesBadge.hidden = unreadLikeCount === 0;
  }
  if (viewsBadge) {
    viewsBadge.textContent = String(unreadViewCount);
    viewsBadge.hidden = unreadViewCount === 0;
  }
  const currentGender = String(currentUserProfile?.gender || "").toLowerCase();
  const oppositeGender = getOppositeGender(currentGender);
  const used = new Set();
  const cardsPerPage = 25;
  let dashboardPage = 0;
  let dashboardTotalPages = 1;
  let dashboardFilters = readDashboardFilters();

  const toEpochMs = (value) => {
    const parsed = Date.parse(String(value || ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getRecencyRank = (email, profile) => {
    const key = String(email || "").trim().toLowerCase();
    const user = localUserByEmail.get(key);
    return Math.max(
      toEpochMs(localLastSignIns[key]),
      toEpochMs(profile?.completedAt),
      toEpochMs(user?.createdAt)
    );
  };

  const placeholderSquare = (name) => {
    const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
    return `<div class="profile-square-fallback">${initial}</div>`;
  };

  const matchesDashboardFilters = (record) => {
    if (!record || typeof record !== "object") {
      return false;
    }
    const religionFilter = String(dashboardFilters.religion || "").toLowerCase();
    const lookingForFilter = String(dashboardFilters.lookingFor || "").toLowerCase();
    const locationFilter = String(dashboardFilters.location || "").toLowerCase();
    if (religionFilter && String(record.religion || "").toLowerCase() !== religionFilter) {
      return false;
    }
    if (lookingForFilter) {
      const lookingFor = Array.isArray(record.lookingFor) ? record.lookingFor : [];
      const hasLookingFor = lookingFor.some(
        (entry) => String(entry || "").toLowerCase() === lookingForFilter
      );
      if (!hasLookingFor) {
        return false;
      }
    }
    if (locationFilter) {
      const location = String(record.location || "").toLowerCase();
      if (!location.includes(locationFilter)) {
        return false;
      }
    }
    return true;
  };

  const renderDashboardCards = () => {
    const cards = [];
    used.clear();
    dashboardGrid.innerHTML = "";

    Object.entries(localProfiles).forEach(([email, profile]) => {
      if (email === currentUserEmail) {
        return;
      }
      const record = profile && typeof profile === "object" ? profile : {};
      const candidateGender = String(record.gender || "").toLowerCase();
      if (oppositeGender && candidateGender !== oppositeGender) {
        return;
      }
      if (!matchesDashboardFilters(record)) {
        return;
      }
      const name = record.profileName || email || "Member";
      const photos = Array.isArray(record.photos) ? record.photos : [];
      const primaryIndex = Number.isInteger(record.primaryPhotoIndex)
        ? record.primaryPhotoIndex
        : 0;
      const chosenPhoto = photos[primaryIndex] || photos[0] || "";
      cards.push({
        key: email,
        name,
        location: record.location || "",
        photo: chosenPhoto,
        recencyRank: getRecencyRank(email, record)
      });
      used.add(email);
    });

    localUsers.forEach((user) => {
      if (
        !user ||
        !user.email ||
        used.has(user.email) ||
        user.email === currentUserEmail
      ) {
        return;
      }
      const profile = localProfiles[user.email];
      const candidateGender = String(profile?.gender || "").toLowerCase();
      if (oppositeGender && candidateGender !== oppositeGender) {
        return;
      }
      if (!matchesDashboardFilters(profile || {})) {
        return;
      }
      const photos = Array.isArray(profile?.photos) ? profile.photos : [];
      const primaryIndex = Number.isInteger(profile?.primaryPhotoIndex)
        ? profile.primaryPhotoIndex
        : 0;
      cards.push({
        key: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        location: profile?.location || "",
        photo: photos[primaryIndex] || photos[0] || "",
        recencyRank: getRecencyRank(user.email, profile || {})
      });
    });

    cards.sort((a, b) => {
      const rankDelta = Number(b.recencyRank || 0) - Number(a.recencyRank || 0);
      if (rankDelta !== 0) {
        return rankDelta;
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

    if (dashboardEmpty) {
      dashboardEmpty.hidden = cards.length > 0;
    }

    dashboardTotalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
    if (dashboardPage > dashboardTotalPages - 1) {
      dashboardPage = dashboardTotalPages - 1;
    }
    const pageStart = dashboardPage * cardsPerPage;
    const visibleCards = cards.slice(pageStart, pageStart + cardsPerPage);

    if (dashboardPagination && dashboardPrev && dashboardNext) {
      dashboardPagination.hidden = cards.length <= cardsPerPage;
      dashboardPrev.disabled = dashboardPage <= 0;
      dashboardNext.disabled = dashboardPage >= dashboardTotalPages - 1;
    }

    if (dashboardPageNumbers) {
      dashboardPageNumbers.innerHTML = "";
      for (let pageIndex = 0; pageIndex < dashboardTotalPages; pageIndex += 1) {
        const pageButton = document.createElement("button");
        pageButton.type = "button";
        pageButton.className = "button ghost dashboard-page-button";
        if (pageIndex === dashboardPage) {
          pageButton.classList.add("is-active");
        }
        pageButton.textContent = String(pageIndex + 1);
        pageButton.setAttribute("aria-label", `Go to page ${pageIndex + 1}`);
        pageButton.addEventListener("click", () => {
          dashboardPage = pageIndex;
          renderDashboardCards();
        });
        dashboardPageNumbers.appendChild(pageButton);
      }
    }

    visibleCards.forEach((entry) => {
      const tile = document.createElement("article");
      tile.className = "profile-tile";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "profile-tile-button";
      button.setAttribute("aria-label", `View ${entry.name} profile`);
      button.innerHTML = `
        <div class="profile-square">
          ${
            entry.photo
              ? `<img src="${entry.photo}" alt="${entry.name} profile photo" loading="lazy" />`
              : placeholderSquare(entry.name)
          }
        </div>
        <div class="profile-meta">
          <strong>${entry.name}</strong>
          <span>${entry.location || "Nigeria"}</span>
        </div>
      `;
      button.addEventListener("click", () => {
        const key = entry.key || "";
        window.location.href = `view-profile.html?user=${encodeURIComponent(key)}`;
      });
      tile.appendChild(button);
      dashboardGrid.appendChild(tile);
    });
  };

  if (
    filterModal &&
    filterToggle &&
    filterReligion &&
    filterLookingFor &&
    filterLocation &&
    filterApply &&
    filterReset &&
    filterClose
  ) {
    const syncFilterInputs = () => {
      filterReligion.value = String(dashboardFilters.religion || "");
      filterLookingFor.value = String(dashboardFilters.lookingFor || "");
      filterLocation.value = String(dashboardFilters.location || "");
    };
    const closeFilterModal = () => {
      filterModal.hidden = true;
    };
    syncFilterInputs();

    filterToggle.addEventListener("click", () => {
      syncFilterInputs();
      filterModal.hidden = false;
    });
    filterClose.addEventListener("click", closeFilterModal);
    filterModal.addEventListener("click", (event) => {
      if (event.target === filterModal) {
        closeFilterModal();
      }
    });
    filterApply.addEventListener("click", () => {
      dashboardFilters = {
        religion: filterReligion.value,
        lookingFor: filterLookingFor.value,
        location: filterLocation.value.trim()
      };
      writeDashboardFilters(dashboardFilters);
      dashboardPage = 0;
      closeFilterModal();
      renderDashboardCards();
    });
    filterReset.addEventListener("click", () => {
      dashboardFilters = {};
      writeDashboardFilters(dashboardFilters);
      syncFilterInputs();
      dashboardPage = 0;
      closeFilterModal();
      renderDashboardCards();
    });
  }
  if (dashboardPrev && dashboardNext) {
    dashboardPrev.addEventListener("click", () => {
      if (dashboardPage <= 0) {
        return;
      }
      dashboardPage -= 1;
      renderDashboardCards();
    });
    dashboardNext.addEventListener("click", () => {
      if (dashboardPage >= dashboardTotalPages - 1) {
        return;
      }
      dashboardPage += 1;
      renderDashboardCards();
    });
  }

  renderDashboardCards();
}

const viewedGrid = document.querySelector("[data-viewed-grid]");
if (viewedGrid) {
  const viewedEmpty = document.querySelector("[data-viewed-empty]");
  const likesBadge = document.querySelector("[data-likes-badge]");
  const viewsBadge = document.querySelector("[data-views-badge]");
  const localProfiles = readLocalProfiles();
  const localLikes = readLocalLikes();
  const localViews = readLocalViews();
  const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  const receivedLikes = currentUserEmail
    ? localLikes.filter((entry) => entry.to === currentUserEmail)
    : [];
  const receivedViews = currentUserEmail
    ? localViews.filter((entry) => entry.to === currentUserEmail)
    : [];
  if (currentUserEmail) {
    const seenMap = readViewSeen();
    seenMap[currentUserEmail] = getUniqueIncomingCountByDay(receivedViews, currentUserEmail);
    writeViewSeen(seenMap);
  }
  const unreadLikes = getUnreadLikesCount(currentUserEmail, localLikes, readLikeSeen());
  const unreadViews = 0;

  if (likesBadge) {
    likesBadge.textContent = String(unreadLikes);
    likesBadge.hidden = unreadLikes === 0;
  }
  if (viewsBadge) {
    viewsBadge.textContent = String(unreadViews);
    viewsBadge.hidden = true;
  }

  const latestByViewer = new Map();
  receivedViews.forEach((entry) => {
    if (!entry || !entry.from) {
      return;
    }
    const existing = latestByViewer.get(entry.from);
    if (!existing || String(entry.at || "") > String(existing.at || "")) {
      latestByViewer.set(entry.from, entry);
    }
  });

  const cards = Array.from(latestByViewer.values()).sort((a, b) =>
    String(b.at || "").localeCompare(String(a.at || ""))
  );

  const placeholderSquare = (name) => {
    const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
    return `<div class="profile-square-fallback">${initial}</div>`;
  };

  if (!cards.length && viewedEmpty) {
    viewedEmpty.hidden = false;
  }

  cards.forEach((entry) => {
    const record = localProfiles[entry.from] || {};
    const name = record.profileName || entry.from;
    const photos = Array.isArray(record.photos) ? record.photos : [];
    const primaryIndex = Number.isInteger(record.primaryPhotoIndex)
      ? record.primaryPhotoIndex
      : 0;
    const chosenPhoto = photos[primaryIndex] || photos[0] || "";

    const tile = document.createElement("article");
    tile.className = "profile-tile";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile-tile-button";
    button.setAttribute("aria-label", `View ${name} profile`);
    button.innerHTML = `
      <div class="profile-square">
        ${
          chosenPhoto
            ? `<img src="${chosenPhoto}" alt="${name} profile photo" loading="lazy" />`
            : placeholderSquare(name)
        }
      </div>
      <div class="profile-meta">
        <strong>${name}</strong>
        <span>${record.location || "Nigeria"}</span>
        <span>${formatTimeAgo(entry.at) || "Recently"}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      window.location.href = `view-profile.html?user=${encodeURIComponent(entry.from)}`;
    });
    tile.appendChild(button);
    viewedGrid.appendChild(tile);
  });
}

const likedGrid = document.querySelector("[data-liked-grid]");
if (likedGrid) {
  const likedEmpty = document.querySelector("[data-liked-empty]");
  const likesBadge = document.querySelector("[data-likes-badge]");
  const viewsBadge = document.querySelector("[data-views-badge]");
  const localProfiles = readLocalProfiles();
  const localLikes = readLocalLikes();
  const localViews = readLocalViews();
  const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  const receivedLikes = currentUserEmail
    ? localLikes.filter((entry) => entry.to === currentUserEmail)
    : [];
  const receivedViews = currentUserEmail
    ? localViews.filter((entry) => entry.to === currentUserEmail)
    : [];
  if (currentUserEmail) {
    const seenMap = readLikeSeen();
    seenMap[currentUserEmail] = getUniqueIncomingCount(receivedLikes, currentUserEmail);
    writeLikeSeen(seenMap);
  }
  const unreadLikes = 0;
  const unreadViews = getUnreadViewsCount(currentUserEmail, localViews, readViewSeen());

  if (likesBadge) {
    likesBadge.textContent = String(unreadLikes);
    likesBadge.hidden = true;
  }
  if (viewsBadge) {
    viewsBadge.textContent = String(unreadViews);
    viewsBadge.hidden = unreadViews === 0;
  }

  const latestBySender = new Map();
  receivedLikes.forEach((entry) => {
    if (!entry || !entry.from) {
      return;
    }
    const existing = latestBySender.get(entry.from);
    if (!existing || String(entry.at || "") > String(existing.at || "")) {
      latestBySender.set(entry.from, entry);
    }
  });

  const cards = Array.from(latestBySender.values()).sort((a, b) =>
    String(b.at || "").localeCompare(String(a.at || ""))
  );

  const placeholderSquare = (name) => {
    const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
    return `<div class="profile-square-fallback">${initial}</div>`;
  };

  if (!cards.length && likedEmpty) {
    likedEmpty.hidden = false;
  }

  cards.forEach((entry) => {
    const record = localProfiles[entry.from] || {};
    const name = record.profileName || entry.from;
    const photos = Array.isArray(record.photos) ? record.photos : [];
    const primaryIndex = Number.isInteger(record.primaryPhotoIndex)
      ? record.primaryPhotoIndex
      : 0;
    const chosenPhoto = photos[primaryIndex] || photos[0] || "";

    const tile = document.createElement("article");
    tile.className = "profile-tile";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile-tile-button";
    button.setAttribute("aria-label", `View ${name} profile`);
    button.innerHTML = `
      <div class="profile-square">
        ${
          chosenPhoto
            ? `<img src="${chosenPhoto}" alt="${name} profile photo" loading="lazy" />`
            : placeholderSquare(name)
        }
      </div>
      <div class="profile-meta">
        <strong>${name}</strong>
        <span>${record.location || "Nigeria"}</span>
        <span>${formatTimeAgo(entry.at) || "Recently"}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      window.location.href = `view-profile.html?user=${encodeURIComponent(entry.from)}`;
    });
    tile.appendChild(button);
    likedGrid.appendChild(tile);
  });
}

const chatsApp = document.querySelector("[data-chats-app]");
if (chatsApp) {
  const threadList = document.querySelector("[data-chat-thread-list]");
  const chatEmpty = document.querySelector("[data-chat-empty]");
  const activeName = document.querySelector("[data-chat-active-name]");
  const messageList = document.querySelector("[data-chat-message-list]");
  const composeForm = document.querySelector("[data-chat-compose]");
  const composeInput = document.querySelector("[data-chat-compose-input]");
  const messagesBadge = document.querySelector("[data-messages-badge]");
  const likesBadge = document.querySelector("[data-likes-badge]");
  const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
    .trim()
    .toLowerCase();
  const profiles = readLocalProfiles();
  const likes = readLocalLikes();

  const getDisplayName = (email) => {
    if (!email) return "Member";
    const p = profiles[email];
    return p && p.profileName ? p.profileName : email;
  };

  if (likesBadge && currentUserEmail) {
    const unreadLikes = getUnreadLikesCount(currentUserEmail, likes, readLikeSeen());
    likesBadge.textContent = String(unreadLikes);
    likesBadge.hidden = unreadLikes === 0;
  }

  if (!currentUserEmail || !threadList || !messageList || !composeForm || !composeInput) {
    if (chatEmpty) {
      chatEmpty.hidden = false;
      chatEmpty.textContent = "Sign in to view and send messages.";
    }
    if (composeInput) composeInput.disabled = true;
    const sendButton = composeForm ? composeForm.querySelector("button[type='submit']") : null;
    if (sendButton) sendButton.disabled = true;
  } else {
    let threads = readLocalChatThreads();
    let messages = readLocalChatMessages();
    const pendingRecipient = (sessionStorage.getItem("pendingChatRecipientKey") || "")
      .trim()
      .toLowerCase();

    if (pendingRecipient && pendingRecipient !== currentUserEmail) {
      const exists = threads.find(
        (entry) =>
          entry &&
          ((entry.a === currentUserEmail && entry.b === pendingRecipient) ||
            (entry.a === pendingRecipient && entry.b === currentUserEmail))
      );
      if (!exists) {
        const thread = {
          id: `thread-${Date.now()}`,
          a: currentUserEmail,
          b: pendingRecipient,
          createdAt: new Date().toISOString()
        };
        threads.push(thread);
        writeLocalChatThreads(threads);
      }
    }

    const inboundCount = messages.filter((entry) => entry.to === currentUserEmail).length;
    const seenMap = readMessageSeen();
    seenMap[currentUserEmail] = inboundCount;
    writeMessageSeen(seenMap);
    if (messagesBadge) {
      messagesBadge.hidden = true;
      messagesBadge.textContent = "0";
    }

    const getThreadOther = (thread) =>
      thread.a === currentUserEmail ? thread.b : thread.a;

    const getThreadMessages = (threadId) =>
      messages
        .filter((entry) => entry.threadId === threadId)
        .sort((a, b) => String(a.at || "").localeCompare(String(b.at || "")));

    const filteredThreads = () =>
      threads
        .filter((entry) => entry && (entry.a === currentUserEmail || entry.b === currentUserEmail))
        .sort((a, b) => {
          const aMsgs = getThreadMessages(a.id);
          const bMsgs = getThreadMessages(b.id);
          const aLast = aMsgs.length ? aMsgs[aMsgs.length - 1].at : a.createdAt || "";
          const bLast = bMsgs.length ? bMsgs[bMsgs.length - 1].at : b.createdAt || "";
          return String(bLast).localeCompare(String(aLast));
        });

    let activeThreadId = null;
    const currentThreads = filteredThreads();
    if (pendingRecipient) {
      const pendingThread = currentThreads.find((entry) => getThreadOther(entry) === pendingRecipient);
      if (pendingThread) {
        activeThreadId = pendingThread.id;
      }
    }
    if (!activeThreadId && currentThreads.length) {
      activeThreadId = currentThreads[0].id;
    }
    sessionStorage.removeItem("pendingChatRecipientKey");
    sessionStorage.removeItem("pendingChatRecipientName");

    const renderMessages = () => {
      messageList.innerHTML = "";
      const thread = filteredThreads().find((entry) => entry.id === activeThreadId);
      if (!thread) {
        if (activeName) activeName.textContent = "Select a conversation";
        return;
      }
      const otherEmail = getThreadOther(thread);
      if (activeName) activeName.textContent = getDisplayName(otherEmail);
      const threadMessages = getThreadMessages(thread.id);
      if (!threadMessages.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "form-note";
        emptyState.textContent = "No messages yet. Say hello.";
        messageList.appendChild(emptyState);
        return;
      }
      threadMessages.forEach((entry) => {
        const bubble = document.createElement("div");
        const own = entry.from === currentUserEmail;
        bubble.className = `chat-bubble ${own ? "own" : "other"}`;
        bubble.textContent = entry.text || "";
        messageList.appendChild(bubble);
      });
      messageList.scrollTop = messageList.scrollHeight;
    };

    const renderThreads = () => {
      const list = filteredThreads();
      threadList.innerHTML = "";
      if (!list.length) {
        if (chatEmpty) chatEmpty.hidden = false;
        if (activeName) activeName.textContent = "Select a conversation";
        messageList.innerHTML = "";
        return;
      }
      if (chatEmpty) chatEmpty.hidden = true;
      list.forEach((thread) => {
        const otherEmail = getThreadOther(thread);
        const threadMessages = getThreadMessages(thread.id);
        const last = threadMessages.length ? threadMessages[threadMessages.length - 1].text : "";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-thread-item";
        if (thread.id === activeThreadId) {
          button.classList.add("active");
        }
        button.innerHTML = `
          <strong>${getDisplayName(otherEmail)}</strong>
          <span>${last || "Start the conversation"}</span>
        `;
        button.addEventListener("click", () => {
          activeThreadId = thread.id;
          renderThreads();
          renderMessages();
        });
        threadList.appendChild(button);
      });
    };

    composeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = composeInput.value.trim();
      if (!text || !activeThreadId) {
        return;
      }
      const thread = filteredThreads().find((entry) => entry.id === activeThreadId);
      if (!thread) {
        return;
      }
      const otherEmail = getThreadOther(thread);
      messages = readLocalChatMessages();
      messages.push({
        id: `msg-${Date.now()}`,
        threadId: thread.id,
        from: currentUserEmail,
        to: otherEmail,
        text,
        at: new Date().toISOString()
      });
      writeLocalChatMessages(messages);
      composeInput.value = "";
      renderThreads();
      renderMessages();
    });

    renderThreads();
    renderMessages();
  }
}

const profileDetailRoot = document.querySelector("[data-profile-detail]");
if (profileDetailRoot) {
  const detailPhoto = document.querySelector("[data-detail-photo]");
  const detailName = document.querySelector("[data-detail-name]");
  const detailLocation = document.querySelector("[data-detail-location]");
  const detailGender = document.querySelector("[data-detail-gender]");
  const detailReligion = document.querySelector("[data-detail-religion]");
  const detailTribe = document.querySelector("[data-detail-tribe]");
  const detailLookingFor = document.querySelector("[data-detail-looking-for]");
  const detailLanguages = document.querySelector("[data-detail-languages]");
  const detailProfession = document.querySelector("[data-detail-profession]");
  const detailEducation = document.querySelector("[data-detail-education]");
  const detailHeight = document.querySelector("[data-detail-height]");
  const detailWeight = document.querySelector("[data-detail-weight]");
  const detailSmoking = document.querySelector("[data-detail-smoking]");
  const detailDrinking = document.querySelector("[data-detail-drinking]");
  const detailKids = document.querySelector("[data-detail-kids]");
  const detailBio = document.querySelector("[data-detail-bio]");
  const detailGallery = document.querySelector("[data-detail-gallery]");
  const sendMessageButton = document.querySelector("[data-send-message]");
  const likeProfileButton = document.querySelector("[data-like-profile]");
  const likeProfileNote = document.querySelector("[data-like-note]");
  const messageModal = document.querySelector("[data-message-modal]");
  const messageModalRecipient = document.querySelector("[data-message-modal-recipient]");
  const messageModalText = document.querySelector("[data-message-modal-text]");
  const messageModalNote = document.querySelector("[data-message-modal-note]");
  const messageModalSend = document.querySelector("[data-message-modal-send]");
  const messageModalCancel = document.querySelector("[data-message-modal-cancel]");
  const photoLightbox = document.querySelector("[data-photo-lightbox]");
  const photoLightboxImage = document.querySelector("[data-photo-lightbox-image]");
  const photoLightboxClose = document.querySelector("[data-photo-lightbox-close]");
  const notFoundCard = document.querySelector("[data-profile-not-found]");
  const url = new URL(window.location.href);
  const key = url.searchParams.get("user") || "";
  const profiles = readLocalProfiles();
  const record = key ? profiles[key] : null;

  const display = (value) =>
    Array.isArray(value) ? (value.length ? value.join(", ") : "Not set") : value || "Not set";
  const closeLightbox = () => {
    if (!photoLightbox || !photoLightboxImage) {
      return;
    }
    photoLightbox.hidden = true;
    photoLightboxImage.src = "";
  };

  if (photoLightbox && photoLightboxClose) {
    photoLightboxClose.addEventListener("click", closeLightbox);
    photoLightbox.addEventListener("click", (event) => {
      if (event.target === photoLightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !photoLightbox.hidden) {
        closeLightbox();
      }
    });
  }

  if (!record || typeof record !== "object") {
    profileDetailRoot.hidden = true;
    if (notFoundCard) {
      notFoundCard.hidden = false;
    }
  } else if (
    detailPhoto &&
    detailName &&
    detailLocation &&
    detailGender &&
    detailReligion &&
    detailTribe &&
    detailLookingFor &&
    detailLanguages &&
    detailProfession &&
    detailEducation &&
    detailHeight &&
    detailWeight &&
    detailSmoking &&
    detailDrinking &&
    detailKids &&
    detailBio &&
    detailGallery
  ) {
    const currentViewerEmail = (sessionStorage.getItem("currentUserEmail") || "")
      .trim()
      .toLowerCase();
    if (currentViewerEmail && key && currentViewerEmail !== key) {
      const localViews = readLocalViews();
      localViews.push({
        from: currentViewerEmail,
        to: key,
        at: new Date().toISOString()
      });
      writeLocalViews(localViews);
    }

    const photos = Array.isArray(record.photos) ? record.photos : [];
    const primaryIndex = Number.isInteger(record.primaryPhotoIndex)
      ? record.primaryPhotoIndex
      : 0;
    const heroPhoto = photos[primaryIndex] || photos[0] || "";
    const renderMainPhoto = (src) => {
      if (!detailPhoto) {
        return;
      }
      detailPhoto.innerHTML = src
        ? `<img src="${src}" alt="${display(record.profileName)} profile photo" />`
        : `<div class="profile-square-fallback">${String(display(record.profileName)).charAt(0).toUpperCase()}</div>`;
    };

    let selectedMainPhoto = heroPhoto;
    renderMainPhoto(selectedMainPhoto);

    detailName.textContent = display(record.profileName);
    detailLocation.textContent = display(record.location);
    detailGender.textContent = display(record.gender);
    detailReligion.textContent = display(record.religion);
    detailTribe.textContent = display(record.tribeOther || record.tribe);
    detailLookingFor.textContent = display(record.lookingFor);
    detailLanguages.textContent = display(record.languages);
    detailProfession.textContent = display(record.profession);
    detailEducation.textContent = display(record.education);
    detailHeight.textContent = record.heightCm ? `${record.heightCm} cm` : "Not set";
    detailWeight.textContent = record.weightKg ? `${record.weightKg} kg` : "Not set";
    detailSmoking.textContent = display(record.smoking);
    detailDrinking.textContent = display(record.drinking);
    const kidsText = record.kidsCount
      ? `${display(record.kids)} (${record.kidsCount})`
      : display(record.kids);
    detailKids.textContent = kidsText;
    detailBio.textContent = display(record.bio);
    detailGallery.innerHTML = "";
    if (photos.length) {
      photos.forEach((src, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "profile-detail-gallery-item";
        if (src === selectedMainPhoto) {
          button.classList.add("is-active");
        }
        button.setAttribute(
          "aria-label",
          `Open ${display(record.profileName)} photo ${index + 1}`
        );
        button.innerHTML = `<img src="${src}" alt="${display(record.profileName)} photo ${index + 1}" loading="lazy" />`;
        button.addEventListener("click", () => {
          selectedMainPhoto = src;
          renderMainPhoto(src);
          detailGallery
            .querySelectorAll(".profile-detail-gallery-item")
            .forEach((entry) => entry.classList.remove("is-active"));
          button.classList.add("is-active");
          if (photoLightbox && photoLightboxImage) {
            photoLightboxImage.src = src;
            photoLightbox.hidden = false;
          }
        });
        detailGallery.appendChild(button);
      });
    } else {
      const fallback = document.createElement("div");
      fallback.className = "profile-square-fallback";
      fallback.textContent = String(display(record.profileName)).charAt(0).toUpperCase();
      detailGallery.appendChild(fallback);
    }
    if (sendMessageButton) {
      sendMessageButton.addEventListener("click", () => {
        if (!messageModal || !messageModalText) {
          return;
        }
        if (messageModalRecipient) {
          messageModalRecipient.textContent = `To: ${display(record.profileName)}`;
        }
        if (messageModalNote) {
          messageModalNote.textContent = "";
        }
        messageModalText.value = "";
        messageModal.hidden = false;
        messageModalText.focus();
      });
    }

    const closeMessageModal = () => {
      if (!messageModal) {
        return;
      }
      messageModal.hidden = true;
      if (messageModalText) {
        messageModalText.value = "";
      }
      if (messageModalNote) {
        messageModalNote.textContent = "";
      }
    };

    if (messageModal && messageModalCancel) {
      messageModalCancel.addEventListener("click", closeMessageModal);
      messageModal.addEventListener("click", (event) => {
        if (event.target === messageModal) {
          closeMessageModal();
        }
      });
    }

    if (messageModalSend && messageModalText) {
      messageModalSend.addEventListener("click", () => {
        const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
          .trim()
          .toLowerCase();
        const text = messageModalText.value.trim();

        if (!currentUserEmail) {
          if (messageModalNote) {
            messageModalNote.textContent = "Sign in to send a message.";
            messageModalNote.classList.add("form-error");
          }
          return;
        }
        if (!text) {
          if (messageModalNote) {
            messageModalNote.textContent = "Please enter a message.";
            messageModalNote.classList.add("form-error");
          }
          return;
        }

        const threads = readLocalChatThreads();
        let thread = threads.find(
          (entry) =>
            entry &&
            ((entry.a === currentUserEmail && entry.b === key) ||
              (entry.a === key && entry.b === currentUserEmail))
        );

        if (!thread) {
          thread = {
            id: `thread-${Date.now()}`,
            a: currentUserEmail,
            b: key,
            createdAt: new Date().toISOString()
          };
          threads.push(thread);
          writeLocalChatThreads(threads);
        }

        const messages = readLocalChatMessages();
        messages.push({
          id: `msg-${Date.now()}`,
          threadId: thread.id,
          from: currentUserEmail,
          to: key,
          text,
          at: new Date().toISOString()
        });
        writeLocalChatMessages(messages);

        sessionStorage.setItem("pendingChatRecipientKey", key);
        sessionStorage.setItem("pendingChatRecipientName", display(record.profileName));
        closeMessageModal();
        window.location.href = "chats.html";
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && messageModal && !messageModal.hidden) {
        closeMessageModal();
      }
    });
    if (likeProfileButton && likeProfileNote) {
      const currentUserEmail = (sessionStorage.getItem("currentUserEmail") || "")
        .trim()
        .toLowerCase();
      const isOwnProfile = currentUserEmail && currentUserEmail === key;
      const likes = readLocalLikes();
      const alreadyLiked = likes.some(
        (entry) => entry.from === currentUserEmail && entry.to === key
      );

      if (!currentUserEmail) {
        likeProfileButton.disabled = true;
        likeProfileNote.textContent = "Sign in to like profiles.";
      } else if (isOwnProfile) {
        likeProfileButton.disabled = true;
        likeProfileNote.textContent = "You cannot like your own profile.";
      } else if (alreadyLiked) {
        likeProfileButton.classList.add("is-liked");
        likeProfileButton.textContent = "Liked";
        likeProfileNote.textContent = "You already liked this profile.";
      } else {
        likeProfileButton.addEventListener("click", () => {
          const updatedLikes = readLocalLikes();
          const exists = updatedLikes.some(
            (entry) => entry.from === currentUserEmail && entry.to === key
          );
          if (exists) {
            likeProfileButton.classList.add("is-liked");
            likeProfileButton.textContent = "Liked";
            likeProfileNote.textContent = "You already liked this profile.";
            return;
          }
          updatedLikes.push({
            from: currentUserEmail,
            to: key,
            at: new Date().toISOString()
          });
          writeLocalLikes(updatedLikes);
          likeProfileButton.classList.add("is-liked");
          likeProfileButton.textContent = "Liked";
          likeProfileNote.textContent = "Profile liked. They will get an alert.";
        });
      }
    }
  }
}

const locationField = document.querySelector("[data-location-field]");
if (locationField && "geolocation" in navigator) {
  const locationNote = locationField
    .closest(".form-row")
    ?.querySelector(".form-note");
  if (locationNote) {
    locationNote.textContent = "Detecting your location...";
  }

  const enableManualLocationEntry = (message) => {
    locationField.readOnly = false;
    locationField.placeholder = "Enter your city";
    if (locationNote) {
      locationNote.textContent = message;
      locationNote.classList.add("form-error");
    }
  };

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
            if (locationNote) {
              locationNote.textContent = "Location auto-filled from your device.";
              locationNote.classList.remove("form-error");
            }
            return;
          }
          locationField.value =
            data && data.display_name ? data.display_name : "Unknown location";
          if (locationNote) {
            locationNote.textContent = "Location auto-filled from your device.";
            locationNote.classList.remove("form-error");
          }
        })
        .catch(() => {
          enableManualLocationEntry(
            "Could not detect your city automatically. Enter location manually."
          );
        });
    },
    () => {
      enableManualLocationEntry(
        "Location permission denied. Enter your location manually."
      );
    }
  );
} else if (locationField) {
  locationField.readOnly = false;
  locationField.placeholder = "Enter your city";
}

const photoInput = document.querySelector("[data-profile-photo-input]");
const photoPreviews = document.querySelector("[data-photo-previews]");
const primaryPhoto = document.querySelector("[data-primary-photo]");
if (photoInput && photoPreviews && primaryPhoto) {
  const revokePreviewUrl = (item) => {
    if (!item || item.isExisting || !item.src || !String(item.src).startsWith("blob:")) {
      return;
    }
    URL.revokeObjectURL(item.src);
  };

  const renderPreviews = (selectedIndex = 0) => {
    photoPreviews.innerHTML = "";
    const safeSelectedIndex =
      selectedIndex >= 0 && selectedIndex < createProfilePhotoItems.length ? selectedIndex : 0;
    createProfilePhotoItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = `Photo ${index + 1}`;

      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "primaryPhotoPick";
      radio.value = String(index);
      if (index === safeSelectedIndex) {
        radio.checked = true;
        primaryPhoto.value = String(safeSelectedIndex);
      }
      radio.addEventListener("change", () => {
        primaryPhoto.value = radio.value;
      });
      label.appendChild(radio);
      label.append(" Profile photo");

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "button ghost photo-remove";
      removeButton.textContent = "Delete";
      removeButton.addEventListener("click", () => {
        const nextSelectedIndex =
          Number.parseInt(primaryPhoto.value || String(safeSelectedIndex), 10) || 0;
        const [removed] = createProfilePhotoItems.splice(index, 1);
        revokePreviewUrl(removed);
        if (!createProfilePhotoItems.length) {
          primaryPhoto.value = "";
          renderPreviews(0);
          return;
        }
        const adjustedIndex =
          index < nextSelectedIndex
            ? nextSelectedIndex - 1
            : Math.min(nextSelectedIndex, createProfilePhotoItems.length - 1);
        renderPreviews(adjustedIndex);
      });

      card.appendChild(img);
      card.appendChild(label);
      card.appendChild(removeButton);
      photoPreviews.appendChild(card);
    });

    if (!createProfilePhotoItems.length) {
      primaryPhoto.value = "";
    }
    photoInput.required = createProfilePhotoItems.length === 0;
  };

  photoInput.addEventListener("change", () => {
    const files = photoInput.files ? Array.from(photoInput.files) : [];
    if (!files.length) {
      return;
    }
    const remainingSlots = Math.max(0, 5 - createProfilePhotoItems.length);
    if (remainingSlots <= 0) {
      showCreateProfileStatus("You already have 5 photos. Delete one to add another.", true);
      photoInput.value = "";
      return;
    }
    if (files.length > remainingSlots) {
      showCreateProfileStatus(
        `You can add ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"}.`,
        true
      );
      photoInput.value = "";
      return;
    }
    files.forEach((file) => {
      createProfilePhotoItems.push({
        src: URL.createObjectURL(file),
        file,
        isExisting: false
      });
    });
    const selectedIndex =
      primaryPhoto.value === "" ? 0 : Number.parseInt(primaryPhoto.value, 10) || 0;
    renderPreviews(Math.min(selectedIndex, createProfilePhotoItems.length - 1));
    photoInput.value = "";
  });

  if (!createProfilePhotoItems.length && createProfileExistingPhotos.length) {
    createProfilePhotoItems = createProfileExistingPhotos.map((src) => ({
      src,
      isExisting: true
    }));
  }
  renderPreviews(createProfileExistingPrimaryIndex);
}

const bioField = document.querySelector("#profile-bio");
const bioEmojiButtons = document.querySelectorAll("[data-bio-emoji]");
if (bioField && bioEmojiButtons.length) {
  bioEmojiButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const emoji = button.getAttribute("data-bio-emoji");
      if (!emoji) return;
      const start = bioField.selectionStart || bioField.value.length;
      const end = bioField.selectionEnd || bioField.value.length;
      const prefix = bioField.value.slice(0, start);
      const suffix = bioField.value.slice(end);
      const spacer = prefix && !prefix.endsWith(" ") ? " " : "";
      bioField.value = `${prefix}${spacer}${emoji} ${suffix}`.trimStart();
      const cursor = prefix.length + spacer.length + emoji.length + 1;
      bioField.focus();
      bioField.setSelectionRange(cursor, cursor);
    });
  });
}

const tribeSelect = document.querySelector("#profile-tribe");
const otherTribeRow = document.querySelector("[data-other-tribe-row]");
const otherTribeField = document.querySelector("#profile-tribe-other");
if (tribeSelect && otherTribeRow && otherTribeField) {
  const syncOtherTribeField = () => {
    const show = tribeSelect.value === "other";
    otherTribeRow.hidden = !show;
    otherTribeRow.classList.toggle("is-hidden", !show);
    otherTribeField.required = show;
    otherTribeField.disabled = !show;
    if (!show) {
      otherTribeField.value = "";
    } else {
      otherTribeField.focus();
    }
  };

  tribeSelect.addEventListener("change", syncOtherTribeField);
  syncOtherTribeField();
}

const kidsSelect = document.querySelector("#profile-kids");
const kidsCountRow = document.querySelector("[data-kids-count-row]");
const kidsCountField = document.querySelector("#profile-kids-count");
if (kidsSelect && kidsCountRow && kidsCountField) {
  const syncKidsCountField = () => {
    const show = kidsSelect.value === "have-kids";
    kidsCountRow.hidden = !show;
    kidsCountRow.classList.toggle("is-hidden", !show);
    kidsCountField.required = show;
    kidsCountField.disabled = !show;
    if (!show) {
      kidsCountField.value = "";
    } else {
      kidsCountField.focus();
    }
  };

  kidsSelect.addEventListener("change", syncKidsCountField);
  syncKidsCountField();
}
