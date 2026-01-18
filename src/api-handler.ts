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
  async _handle(
    route: string,
    method: string,
    body: object | null,
  ): Promise<Response> {
    // TODO: Make logic to change baseUrl
    // VVV

    console.info(window.location.host);

    if (window.location.host === "http://127.0.0.1:5500") {
      console.info("ADLKJASLKDJ");
    }

    const baseUrl = "https://localhost:7032";
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

    const response = await fetch(fullUrl, fetchRequest);
    return response;
  },
};
