import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, getAuthHeaders } from "@/lib/api";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "student" | "supervisor" | "employer";
  profilePicture?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<"admin" | "student" | "supervisor" | "employer" | void>;
  register: (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    role: string,
    companyName?: string
  ) => Promise<void>;
  logout: () => void;
}

// Define response types for better type safety
interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  companyName?: string;
  profile?: {
    profilePicture?: string;
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  id?: number;
}

interface ValidateTokenResponse {
  success: boolean;
  message: string;
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
}

// Default context value with no-op functions
const defaultContextValue: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Helper to safely load data from localStorage with fallbacks
const loadFromStorage = <T extends unknown>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Function to store auth data consistently
  const saveAuthData = (token: string, userData: User) => {
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Also set in memory
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Error saving auth data to localStorage:", e);
    }
  };

  // Function to clear auth data consistently
  const clearAuthData = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      // Also clear from memory
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error("Error clearing auth data from localStorage:", e);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      setIsLoading(true);
      
      // First, try to load user from localStorage
      const token = localStorage.getItem("token");
      const storedUser = loadFromStorage<User | null>("user", null);
      
      if (token && storedUser) {
        // Immediately set user as authenticated from localStorage
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Validate token with backend in the background
        try {
          console.log("Validating token with backend...");
          const response = await api.post<ValidateTokenResponse>(
            '/api/auth/validate-token', 
            {}, // The token will be sent by the validateTokenWithFallback function
            true
          );
          
          // If validation fails, clear auth data and log user out
          if (!response.success) {
            console.warn("Token validation failed:", response.message);
            clearAuthData();
          } else {
            console.log("Token validation successful");
          }
        } catch (validationError) {
          // Keep the user logged in if backend validation fails
          // This is already handled by validateTokenWithFallback
          console.error("Token validation error (keeping session):", validationError);
        }
      } else {
        // No stored credentials, ensure user is logged out
        clearAuthData();
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Make real API call to backend using our API utility
      const data = await api.post<LoginResponse>(
        '/api/auth/login', 
        { email, password }, 
        false
      );
      
      // Map backend userType to frontend role
      let userRole: "admin" | "student" | "supervisor" | "employer" = "student";
      
      if (data.userType === "student" || data.userType === "CANDIDATE") {
        userRole = "student";
      } else if (data.userType === "employer" || data.userType === "RESPONSIBLE") {
        userRole = "employer";
      } else if (data.userType === "supervisor") {
        userRole = "supervisor";
      } else if (data.userType === "admin") {
        userRole = "admin";
      }
      
      const user: User = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: userRole,
        profilePicture: data.profile?.profilePicture,
      };
      
      // Add company field for employer
      if (userRole === "employer" && data.companyName) {
        user.company = data.companyName;
      }
      
      // Store token and user in localStorage using the helper function
      saveAuthData(data.token, user);
      
      // Return the user type for immediate UI updates
      return userRole;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    role: string,
    companyName?: string
  ) => {
    setIsLoading(true);
    
    try {
      // Make real API call to the register endpoint using our API utility
      await api.post<RegisterResponse>(
        '/api/auth/register', 
        {
          firstName,
          lastName,
          email,
          password,
          role, // This will be mapped to userType in the backend
          ...(companyName && { companyName }) // Only include companyName if provided
        }, 
        false
      );
      
      // Registration successful
      return;
    } catch (error) {
      console.error("Registration error", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
