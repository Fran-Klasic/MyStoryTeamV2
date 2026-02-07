import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const USER_DATA_ENDPOINT = "api/auth/user";
const GET_ALL_USER_CANVASES = "api/auth/dashboard"; //GET

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
