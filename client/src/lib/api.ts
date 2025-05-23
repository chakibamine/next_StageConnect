// Base API URL configuration
import type { Education, EducationFormData } from '../types/education';
import type { Certification, CertificationFormData } from '../types/certification';

const API_BASE_URL =  'http://localhost:8080';

/**
 * Helper function to build API URLs
 * @param endpoint API endpoint path
 * @returns Full API URL
 */
export const apiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
};

/**
 * Common error handler for API responses
 * @param response Fetch response object
 * @returns Response data if successful
 * @throws Error with message from API or generic message
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Request failed with status ${response.status}`);
    }
  }
  
  // For successful responses, try to parse JSON
  try {
    // Get the raw text first to debug malformed responses if needed
    const responseText = await response.text();
    
    try {
      // Then parse it as JSON
      const data = JSON.parse(responseText);
      
      if (data && typeof data === 'object' && 'success' in data && data.success === false) {
        throw new Error(data.message || 'Operation failed');
      }
      
      return data as T;
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      console.error('Raw response:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      throw new Error('Failed to parse response from server: Malformed JSON');
    }
  } catch (error) {
    console.error('Error handling API response:', error);
    throw new Error('Failed to parse response from server');
  }
}

/**
 * Handle fetch errors, with special handling for CORS issues
 */
export function handleFetchError(error: unknown, endpoint: string): never {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.error(`CORS or network error calling ${endpoint}:`, error);
    throw new Error(
      `Network error: Could not connect to the server. This might be a CORS issue. ` +
      `Check that the server at ${apiUrl(endpoint)} allows requests from this origin.`
    );
  }
  
  throw error instanceof Error ? error : new Error(String(error));
}

/**
 * Get authentication headers including JWT token if available
 * @returns Headers object with auth token if available
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add a custom header for CORS debugging
  if (process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_CORS_DEBUG) {
    headers['X-CORS-Debug'] = 'true';
  }
  
  return headers;
}

/**
 * Special handler for token validation endpoint that returns a default response 
 * if the server is unreachable, to prevent unnecessary logouts
 */
export async function validateTokenWithFallback<T>(
  endpoint: string,
  data: any
): Promise<T & { success: boolean }> {
  const token = localStorage.getItem('token');
  
  // If no token is stored, fail immediately to avoid unnecessary API calls
  if (!token) {
    console.warn("No token found in localStorage, skipping validation");
    return { success: false, message: "No token available" } as T & { success: boolean, message: string };
  }
  
  const headers = getAuthHeaders();
  
  try {
    // Set a timeout to prevent hanging if the server is unresponsive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }), // Explicitly send token in request body
        credentials: 'include',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle 401 and 403 specifically as auth failures
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "Token invalid or expired" } as T & { success: boolean, message: string };
      }
      
      // Handle 500 errors specially to avoid crashing
      if (response.status >= 500) {
        console.warn(`Server error during token validation (${response.status}), assuming token still valid`);
        return { success: true, message: "Assuming valid due to server error" } as T & { success: boolean, message: string };
      }
      
      return await handleApiResponse<T & { success: boolean }>(response);
    } catch (responseError) {
      clearTimeout(timeoutId);
      throw responseError;
    }
  } catch (error) {
    console.warn(`Token validation failed, assuming token is still valid: ${error}`);
    // Return a "success" response to keep the user logged in if we can't reach the server
    return { 
      success: true, 
      message: "Assuming valid due to connection error" 
    } as T & { success: boolean, message: string };
  }
}

/**
 * Handles API requests with common error handling and authentication
 */
export const api = {
  /**
   * Make a GET request to the API
   * @param endpoint API endpoint
   * @param authenticated Whether to include auth token
   * @returns Response data
   */
  async get<T>(endpoint: string, authenticated = true): Promise<T> {
    const headers = authenticated ? getAuthHeaders() : { 'Content-Type': 'application/json' };
    try {
      const response = await fetch(apiUrl(endpoint), { 
        method: 'GET',
        headers,
        credentials: 'include' // Include cookies in the request
      });
      return handleApiResponse<T>(response);
    } catch (error) {
      return Promise.reject(handleFetchError(error, endpoint));
    }
  },
  
  /**
   * Make a POST request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param authenticated Whether to include auth token
   * @returns Response data
   */
  async post<T>(endpoint: string, data: any, authenticated = true): Promise<T> {
    // Special handling for token validation to be more fault-tolerant
    if (endpoint === '/api/auth/validate-token') {
      return validateTokenWithFallback<T>(endpoint, data);
    }
    
    const headers = authenticated ? getAuthHeaders() : { 'Content-Type': 'application/json' };
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include' // Include cookies in the request
      });
      
      // Special handling for login endpoint with malformed JSON
      if (endpoint === '/api/auth/login' && response.ok) {
        try {
          const responseText = await response.text();
          
          // Extract required fields manually for login
          try {
            // Try to extract the essential fields we need for login
            const id = responseText.match(/"id":(\d+)/)?.[1];
            const firstName = responseText.match(/"firstName":"([^"]+)"/)?.[1];
            const lastName = responseText.match(/"lastName":"([^"]+)"/)?.[1];
            const email = responseText.match(/"email":"([^"]+)"/)?.[1];
            const userType = responseText.match(/"userType":"([^"]+)"/)?.[1];
            const token = responseText.match(/"token":"([^"]+)"/)?.[1];
            
            // If we got all the needed fields, construct a valid response object
            if (id && firstName && lastName && email && userType) {
              console.log("Extracted login data manually due to malformed JSON from server");
              return {
                success: true,
                message: "Login successful",
                id: parseInt(id),
                firstName,
                lastName,
                email,
                userType,
                token: token || "dummy-token-fix-backend",
              } as unknown as T;
            }
          } catch (extractError) {
            console.error("Error extracting login data:", extractError);
          }
        } catch (textError) {
          console.error("Error reading response text:", textError);
        }
      }
      
      return handleApiResponse<T>(response);
    } catch (error) {
      return Promise.reject(handleFetchError(error, endpoint));
    }
  },
  
  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint
   * @param data Request body data
   * @param authenticated Whether to include auth token
   * @returns Response data
   */
  async put<T>(endpoint: string, data: any, authenticated = true): Promise<T> {
    const headers = authenticated ? getAuthHeaders() : { 'Content-Type': 'application/json' };
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include' // Include cookies in the request
      });
      return handleApiResponse<T>(response);
    } catch (error) {
      return Promise.reject(handleFetchError(error, endpoint));
    }
  },
  
  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint
   * @param authenticated Whether to include auth token
   * @returns Response data
   */
  async delete<T>(endpoint: string, authenticated = true): Promise<T> {
    const headers = authenticated ? getAuthHeaders() : { 'Content-Type': 'application/json' };
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'DELETE',
        headers,
        credentials: 'include' // Include cookies in the request
      });
      return handleApiResponse<T>(response);
    } catch (error) {
      return Promise.reject(handleFetchError(error, endpoint));
    }
  }
};

// Education API endpoints
export const getEducationList = async (candidateId: number): Promise<Education[]> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/education`), {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to fetch education list:', error);
    throw new Error('Failed to fetch education list');
  }
};

export const getEducation = async (candidateId: number, educationId: number): Promise<Education> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/education/${educationId}`), {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to fetch education:', error);
    throw new Error('Failed to fetch education');
  }
};

export const createEducation = async (candidateId: number, education: EducationFormData): Promise<Education> => {
  try {
    // Format dates to match backend expectations
    const formattedEducation = {
      ...education,
      startDate: education.startDate.split('T')[0], // Remove time part if present
      endDate: education.endDate?.split('T')[0] // Remove time part if present
    };

    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/education`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedEducation),
      credentials: 'include'
    });
    const result = await handleApiResponse<{ success: boolean; message: string; data: Education }>(response);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  } catch (error) {
    console.error('Failed to create education:', error);
    throw error;
  }
};

export const updateEducation = async (candidateId: number, educationId: number, education: EducationFormData): Promise<Education> => {
  try {
    // Format dates to match backend expectations
    const formattedEducation = {
      ...education,
      startDate: education.startDate.split('T')[0], // Remove time part if present
      endDate: education.endDate?.split('T')[0] // Remove time part if present
    };

    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/education/${educationId}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedEducation),
      credentials: 'include'
    });
    const result = await handleApiResponse<{ success: boolean; message: string; data: Education }>(response);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  } catch (error) {
    console.error('Failed to update education:', error);
    throw error;
  }
};

export const deleteEducation = async (candidateId: number, educationId: number): Promise<void> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/education/${educationId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const result = await handleApiResponse<{ success: boolean; message: string }>(response);
    if (!result.success) {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Failed to delete education:', error);
    throw error;
  }
};

// Certification API endpoints
export const getCertificationList = async (candidateId: number): Promise<Certification[]> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/certifications`), {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleApiResponse(response);
  } catch (error) {
    console.error('Failed to fetch certification list:', error);
    throw new Error('Failed to fetch certification list');
  }
};

export const createCertification = async (candidateId: number, certification: CertificationFormData): Promise<Certification> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/certifications`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certification),
      credentials: 'include'
    });
    const result = await handleApiResponse<{ success: boolean; message: string; data: Certification }>(response);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  } catch (error) {
    console.error('Failed to create certification:', error);
    throw error;
  }
};

export const updateCertification = async (candidateId: number, certificationId: number, certification: CertificationFormData): Promise<Certification> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/certifications/${certificationId}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(certification),
      credentials: 'include'
    });
    const result = await handleApiResponse<{ success: boolean; message: string; data: Certification }>(response);
    if (!result.success) {
      throw new Error(result.message);
    }
    return result.data;
  } catch (error) {
    console.error('Failed to update certification:', error);
    throw error;
  }
};

export const deleteCertification = async (candidateId: number, certificationId: number): Promise<void> => {
  try {
    const response = await fetch(apiUrl(`/api/candidates/${candidateId}/certifications/${certificationId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    await handleApiResponse(response);
  } catch (error) {
    console.error('Failed to delete certification:', error);
    throw error;
  }
}; 