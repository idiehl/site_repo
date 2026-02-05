const USERS = {
  "peter@atlasuniversalis.com": "Peter!electracastonatlas123!",
  "mark@atlasuniversalis.com": "Mark!electracastonatlas123!",
  "jacob@atlasuniversalis.com": "Jacob!electracastonatlas123!"
};

const AUTH_KEY = "electracast_authed";
const loginView = document.getElementById("login-view");
const siteView = document.getElementById("site-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

let memoryAuth = false;
const storageAvailable = (() => {
  try {
    localStorage.setItem("__electracast_test__", "1");
    localStorage.removeItem("__electracast_test__");
    return true;
  } catch {
    return false;
  }
})();

function setAuthed(isAuthed) {
  if (!loginView || !siteView) {
    return;
  }
  if (isAuthed) {
    if (storageAvailable) {
      localStorage.setItem(AUTH_KEY, "true");
    } else {
      memoryAuth = true;
    }
    loginView.classList.add("hidden");
    siteView.classList.remove("hidden");
  } else {
    if (storageAvailable) {
      localStorage.removeItem(AUTH_KEY);
    }
    memoryAuth = false;
    loginView.classList.remove("hidden");
    siteView.classList.add("hidden");
  }
}

function checkCredentials(email, password) {
  const key = email.trim().toLowerCase();
  return USERS[key] && USERS[key] === password;
}

if (storageAvailable && localStorage.getItem(AUTH_KEY) === "true") {
  setAuthed(true);
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (loginError) {
      loginError.textContent = "";
    }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (checkCredentials(email, password)) {
      setAuthed(true);
      loginForm.reset();
    } else if (loginError) {
      loginError.textContent = "Invalid email or password.";
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    setAuthed(false);
  });
}
