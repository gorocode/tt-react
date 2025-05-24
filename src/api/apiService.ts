import config from "../config";
import { showMessageModal } from "../utils/messageModalController";

/**
 * Generic API request function that handles authentication, error handling, and response parsing
 * 
 * @template T The expected return type of the API response
 * @param endpoint The API endpoint to call (without the base URL)
 * @param method The HTTP method to use (defaults to 'GET')
 * @param body Optional request body for POST, PUT, PATCH methods
 * @returns A promise that resolves to the typed API response
 * @throws Error with message from the API or default message on failure
 */
const request = async <T>(endpoint: string, method = 'GET', body: Object | null = null): Promise<T> => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add authentication token if it exists in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${config.BASE_URL}${endpoint}`, options);

        // Handle 401 Unauthorized responses (expired or invalid token)
        if (response.status === 401) {
            // Clear the stored token and redirect to login
            localStorage.removeItem('auth_token');
            window.location.href = '/manager'; // Redirect to login page
            throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            
            // Handle MultipleErrorResponse format
            if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                // Extract only the first error message
                throw new Error(errorData.errors[0].message);
            } else if (errorData.message) {
                // Handle single error response
                throw new Error(errorData.message);
            } else {
                // Fallback error message
                throw new Error("An error occurred with the request");
            }
        }

        return await response.json();
    } catch (error) {
        if (error instanceof Error) showMessageModal("ERROR", error.message);
        else showMessageModal("ERROR", "An unknown error occurred");
        throw error;
    }
};

export default request;