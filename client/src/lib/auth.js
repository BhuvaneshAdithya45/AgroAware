// src/lib/auth.js
export const setToken = (t) => localStorage.setItem("token", t);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

/**
 * Wrapper around fetch() that adds JWT Authorization header.
 * Use this for all API calls to protected backend routes.
 */
export const authFetch = (url, options = {}) => {
    const token = getToken();
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
};

