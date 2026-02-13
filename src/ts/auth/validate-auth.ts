import { api } from "../api/api-handler";

const TEST_ENDPOINT = "api/auth/test";
const USER_DATA_ENDPOINT = "api/auth/user";
const GET_ALL_USER_CANVASES_ENDPOINT = "api/auth/canvas";
const CREATE_NEW_CANVAS_ENDPOINT = "api/auth/canvas";

const LOGIN_URL = "/html/sign.html";

async function testResponse(response: Response): Promise<boolean> {
  if (!response.ok) {
    const text = await response.text();

    console.error("Request failed:", text);
    alert(`Error ${response.status}`);
    return false;
  }
  return true;
}

async function CreateNewCanvas() {
  const canvasData = {
    Version: "1",
    ExportedAt: new Date().toISOString(),
    Elements: [],
  };

  const response = await api.post(CREATE_NEW_CANVAS_ENDPOINT, canvasData);

  if (!(await testResponse(response))) return;

  //Redirect only on success
  window.location.href = "/html/auth/main-canvas.html";
}

(window as any).CreateNewCanvas = CreateNewCanvas;

window.onload = async () => {
  //VALIDATE USER
  await (async () => {
    const response = await api.get(TEST_ENDPOINT);
    if (!response.ok) {
      window.location.href = LOGIN_URL;
    }
  })();

  //GET USERNAME
  await (async () => {
    const response = await api.get(USER_DATA_ENDPOINT);
    if (!(await testResponse(response))) return;

    const username = await response.json();
    const nameSpace = document.getElementById("username")!;
    nameSpace.textContent = `Hello ${username}!`;
  })();

  //BUTTON LISTENER
  const btn = document.getElementById("createCanvasBtn");
  btn?.addEventListener("click", CreateNewCanvas);

  //GET ALL CANVASES
  await (async () => {
    const response = await api.get(GET_ALL_USER_CANVASES_ENDPOINT);
    if (!(await testResponse(response))) return;

    const data: Element[] = await response.json();
    PlaceAllCanvases(data);
  })();
};
function PlaceAllCanvases(data: Element[]) {
  console.info("Canvases:", data);
}
