const DEBOUNCE_DELAY = 300; 

/**
 * Generic API fetcher that handles JSON parsing and error checking.
 * Implements exponential backoff for robustness.
 */
export const apiFetcher = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            
            // Check if response is OK before trying to parse JSON
            if (!response.ok) {
                // Try to get error message from response
                let errorMsg;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
                } catch (e) {
                    errorMsg = `HTTP error! status: ${response.status}`;
                }
                throw new Error(errorMsg);
            }

            // Parse JSON only for successful responses
            let data;
            try {
                data = await response.json();
            } catch (e) {
                // If no JSON content, return empty object
                data = {};
            }

            return data;
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw new Error(`API Request Failed after ${retries} attempts: ${error.message}`);
            }
        }
    }
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
/**
 * API service object for application management.
 */
export const api = {
    get: (path, params = {}) => {
        const url = new URL(`${API_BASE_URL}${path}`);
        // Add query parameters
        Object.keys(params).forEach(key => {
            if (params[key] !== '' && params[key] !== undefined) url.searchParams.append(key, params[key]);
        });
        return apiFetcher(url.toString());
    },
    put: (path, body) => apiFetcher(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body),
    }),
};