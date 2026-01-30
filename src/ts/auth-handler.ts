import { accessTokenHandler, api } from "./api/api-handler";

async function handleLogin(e: SubmitEvent) {
  e.preventDefault();
  const formTarget: any = e.target;

  if (formTarget == null) {
    console.error("No form target!");
    return;
  }

  const request = {
    email: formTarget["email"]?.value?.trim(),
    password: formTarget["password"]?.value?.trim(),
  };

  const response = await api.post("api/auth/login", request);

  if (response.ok) {
    const token = (await response.text()).replaceAll('"', "");
    accessTokenHandler.setToken(token);

    window.location.href = "/html/auth/index.html";

    console.info("LOGIN", request, token); //------------------------------------------------
  } else {
    alert("Invalid credentials!");
  }
}

async function handleRegistration(e: SubmitEvent) {
  e.preventDefault();
  const formTarget: any = e.target;

  if (formTarget == null) {
    console.error("No form target!");
    return;
  }

  const request = {
    username: formTarget["username"]?.value?.trim(),
    email: formTarget["email"]?.value?.trim(),
    password: formTarget["password"]?.value?.trim(),
    repeatPassword: formTarget["repeat-password"]?.value?.trim(),
  };

  // TODO: VALIDATE

  const response = await api.post("api/auth/register", request);

  if (response.ok) {
    alert("Registration successful! Please log in to continue!");
    window.location.href = "/html/sign.html";
  } else {
    alert("Email is already in use!");
  }
}

const loginForm = document.getElementById("login-form") as HTMLFormElement;
const registerForm = document.getElementById(
  "register-form",
) as HTMLFormElement;

loginForm?.addEventListener("submit", handleLogin);
registerForm?.addEventListener("submit", handleRegistration);
