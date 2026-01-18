import { api } from "./api/api-handler";

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

  console.info("LOGIN", request, response);
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

  // TODO: Validacija
  // ==> Validacija na frontendu
  // ==> Kraj validacije :)

  const response = await api.post("api/auth/register", request);

  console.info("REGISTER", request, response);
}

const loginForm = document.getElementById("login-form") as HTMLFormElement;
const registerForm = document.getElementById(
  "register-form",
) as HTMLFormElement;

loginForm?.addEventListener("submit", handleLogin);
registerForm?.addEventListener("submit", handleRegistration);
