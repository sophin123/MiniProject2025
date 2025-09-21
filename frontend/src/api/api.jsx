
import { apiClient } from '../auth/AuthRoute';

// backend url for hyperlink tag
export const API_URL = process.env.REACT_APP_BASE_URL;
console.log("Temporary API URL", API_URL);


const api = async (endpoint, data, method = 'POST', useToken, debug = false, axiosOptions = {}) => {

    console.log(`API request (${endpoint})`);
    console.log(`API base url`, apiClient.defaults.baseURL);
    // Log full URL specifically for signup to verify env/source
    try {
        const base = apiClient?.defaults?.baseURL || '';
        const path = endpoint?.startsWith('/') ? endpoint : `/${endpoint}`;
        const fullUrl = `${base}${path}`;
        if (path === '/auth/signup') {
            console.log('Signup full URL:', fullUrl);
            console.log('Env base URL:', process.env.REACT_APP_BASE_URL, 'NODE_ENV:', process.env.NODE_ENV);
        }
    } catch (_) {
        // no-op: logging should never break requests
    }

    try {
        const config = {
            method,
            url: `${endpoint}`,
            headers: {
                ...(axiosOptions.headers || {}),
            },
            ...axiosOptions,
        }


        if (!(data instanceof FormData) && !(config.headers['Content-Type'])) {
            config.headers['Content-Type'] = 'application/json';
        }


        if (useToken) {
            config.headers['Authorization'] = `Bearer ${useToken}`;
        }

        if (data) {
            config.data = data
        }

        if (debug) {
            console.log("API config:", config)
        }

        const response = await apiClient(config);
        return response.data

    } catch (err) {
        if (err.response) {
            throw { status: err.response.status, ...err.response.data }
        } else if (err.request) {
            throw { message: "Network Error, Please check your connections" };
        } else {
            throw { message: "An unexpected error occurred", details: err.message };
        }
    }
}


export default api;