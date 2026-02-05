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

function setAuthed(isAuthed) {
  if (isAuthed) {
    localStorage.setItem(AUTH_KEY, "true");
    loginView.classList.add("hidden");
    siteView.classList.remove("hidden");
  } else {
    localStorage.removeItem(AUTH_KEY);
    loginView.classList.remove("hidden");
    siteView.classList.add("hidden");
  }
}

function checkCredentials(email, password) {
  const key = email.trim().toLowerCase();
  return USERS[key] && USERS[key] === password;
}

if (localStorage.getItem(AUTH_KEY) === "true") {
  setAuthed(true);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (checkCredentials(email, password)) {
    setAuthed(true);
    loginForm.reset();
  } else {
    loginError.textContent = "Invalid email or password.";
  }
});

logoutBtn.addEventListener("click", () => {
  setAuthed(false);
});
