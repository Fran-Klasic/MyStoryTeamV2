import { api } from "./api/api-handler";

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

  console.info("Submit2: ", request);

  // ==> Validacija na frontendu
  // ==> Kraj validacije :)

  const response = await api.post("api/auth/register", request);

  console.info(response);
}

// const loginForm = document.getElementById("login-form") as HTMLFormElement;
const registerForm = document.getElementById(
  "register-form",
) as HTMLFormElement;

registerForm?.addEventListener("submit", handleRegistration);

console.info("ASADASDdasdASD");
const response = await api.get("api/test");

console.info(response);

const text = await response.text();

console.info(text);
