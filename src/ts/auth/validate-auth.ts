import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const USER_DATA_ENDPOINT = "api/dashboard/username";
const USER_CANVASES_ENDPOINT = "api/dashboard";

const LOGIN_URL = "/html/sign.html";

window.onload = async () => {
  //#region VALIDATE USER
  const response = await api.get(TEST_ENDPOINT);
  const isValid = response.ok;
  if (isValid === false) {
    window.location.href = LOGIN_URL;
  }
  //#endregion

  //#region GET USERNAME
  const userData = await api.get(USER_DATA_ENDPOINT);
  const username = await userData.json();

  const nameSpace = document.getElementById("username") as HTMLElement;
  nameSpace.textContent = `Hello ${username}!`;
  //#endregion

  //#region GET DASHBOARD DATA

  //#endregion
};
