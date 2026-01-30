import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const LOGIN_URL = "/html/sign.html";

window.onload = async () => {
  const response = await api.get(TEST_ENDPOINT);
  const isValid = response.ok;

  if (isValid === false) {
    window.location.href = LOGIN_URL;
  }
};
