import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const USER_DATA_ENDPOINT = "api/auth/getUserData";
const LOGIN_URL = "/html/sign.html";

async function callEndpoint(endpoint: string) {
  const response = await api.get(endpoint);
  const isValid = response.ok;
  if (isValid === false) {
    window.location.href = LOGIN_URL;
  }
}

window.onload = async () => {
  callEndpoint(TEST_ENDPOINT);
  callEndpoint(USER_DATA_ENDPOINT);
};
