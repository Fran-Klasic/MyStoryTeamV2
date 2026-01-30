import { api } from "../api/api-handler";

const response = await api.get("api/dashboard");
const text = await response.text();

console.info("Loaded info: ", text);
