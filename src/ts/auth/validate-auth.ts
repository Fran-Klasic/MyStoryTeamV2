import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const USER_DATA_ENDPOINT = "api/auth/getUserData";

const LOGIN_URL = "/html/sign.html";

async function callEndpoint(endpoint: string): Promise<Response> {
  const response = await api.get(endpoint);
  return response;
}

window.onload = async () => {
  const response = callEndpoint(TEST_ENDPOINT);
  const isValid = (await response).ok;
  if (isValid === false) {
    window.location.href = LOGIN_URL;
  }
  const userData = callEndpoint(USER_DATA_ENDPOINT);
};
