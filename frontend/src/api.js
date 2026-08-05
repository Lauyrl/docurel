const BASE_URL = "http://localhost:8080";

export async function api(endpoint, options = {}) {
    const token = localStorage.getItem("jwt");

    const response = await fetch(BASE_URL + endpoint, {
        ...options, // stuff like "method", "body",... 
        headers: {
            ...options.headers,
            ...(token && {"Authorization": "Bearer " + token})
        }
    })

    if (!response.ok) throw new Error(await response.text()); // must await response body as it is async

    return response;
}
