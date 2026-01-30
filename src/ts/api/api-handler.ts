export const api = {
  async get(route: string): Promise<Response> {
    return this._handle(route, "GET", null);
  },
  async post(route: string, body: object | null): Promise<Response> {
    return this._handle(route, "POST", body);
  },
  async put(route: string, body: object | null): Promise<Response> {
    return this._handle(route, "PUT", body);
  },
  async delete(route: string, body: object | null): Promise<Response> {
    return this._handle(route, "DELETE", body);
  },
  _getBaseUrl() {
    if (window.location.host === "localhost:5173") {
      return "https://localhost:7032";
    }

    console.error("Not supported host: ", window.location.host);

    return null;
  },
  async _handle(
    route: string,
    method: string,
    body: object | null,
  ): Promise<Response> {
    const baseUrl = this._getBaseUrl();

    if (baseUrl == null) {
      throw new Error("Base url is empty");
    }

    const fullUrl = `${baseUrl}/${route}`;

    const fetchRequest: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (body != null) {
      fetchRequest.body = JSON.stringify(body);
    }

    const accessToken = accessTokenHandler.getToken();

    if (accessToken != null) {
      (fetchRequest.headers as any)["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(fullUrl, fetchRequest);
    return response;
  },
};

const TOKEN_KEY = "accessTokenKey";

export const accessTokenHandler = {
  setToken(token: string) {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  },
  getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  },
  clearToken() {
    window.sessionStorage.removeItem(TOKEN_KEY);
  },
};
