const BASE_URL = "http://localhost:8080";

export function api(endpoint, options = {}) {
    const token = localStorage.getItem("jwt");

    return fetch(BASE_URL + endpoint, {
        ...options, // stuff like "method", "body",... 
        headers: {
            ...options.headers,
            ...(token && {"Authorization": "Bearer " + token})
        }
    })
}
