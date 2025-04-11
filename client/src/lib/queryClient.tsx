import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

interface ApiRequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  // Get the token from localStorage
  const token = localStorage.getItem("token");
  
  // Prepare headers with authentication
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add Authorization header if token exists
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include", // Include cookies in the request
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Add base URL to endpoint if it doesn't start with http
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  console.log('Making API request to:', url); // Debug log
  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    
    // Handle token expiration (401 Unauthorized)
    if (response.status === 401) {
      // Only clear token and redirect for non-auth endpoints
      if (!endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
        // Clear the token from localStorage
        localStorage.removeItem("token");
        
        // If we're not already on the login page, redirect to login
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        
        throw new Error("Your session has expired. Please log in again.");
      } else {
        // For login/register endpoints, just throw the error message from the server
        throw new Error(errorData.error || "Invalid credentials");
      }
    }
    
    // Check if the error is a validation error with multiple fields
    if (errorData.error && Array.isArray(errorData.error)) {
      const errorMessages = errorData.error.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(errorMessages);
    }
    
    // Handle single error message
    throw new Error(errorData.error || errorData.message || "An error occurred");
  }

  return response.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the token from localStorage
    const token = localStorage.getItem("token");
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
