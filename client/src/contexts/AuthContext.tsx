import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  username: string;
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
  login: (username: string, password: string) => Promise<"admin" | "student" | "supervisor" | "employer" | void>;
  register: (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    role: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing stored user data", error);
          localStorage.removeItem("user");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In production, this would make an API call
      // For demo purposes, we simulate different user types based on username prefix
      // student_demo, employer_demo, supervisor_demo
      
      let userRole: "student" | "employer" | "supervisor" | "admin" = "student";
      let firstName = "Alex";
      let lastName = "Johnson";
      let profileImg = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80";
      let userId = 1;
      
      if (username.startsWith("employer_")) {
        userRole = "employer";
        firstName = "Emily";
        lastName = "Rodriguez";
        profileImg = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80";
        userId = 2;
      } else if (username.startsWith("supervisor_")) {
        userRole = "supervisor";
        firstName = "Michael";
        lastName = "Chen";
        profileImg = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80";
        userId = 3;
      } else if (username.startsWith("admin_")) {
        userRole = "admin";
        firstName = "Sarah";
        lastName = "Miller";
        profileImg = "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80";
        userId = 4;
      }
      
      const user: User = {
        id: userId,
        username,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        role: userRole,
        profilePicture: profileImg,
      };
      
      // Add company field for employer
      if (userRole === "employer") {
        user.company = "TechRecruiters Inc.";
      }
      
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Return the user type for immediate UI updates
      return userRole;
    } catch (error) {
      console.error("Login error", error);
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string, 
    role: string
  ) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would make an API call
      // For demo purposes, we'll just simulate a successful registration
      console.log("Registration successful", { firstName, lastName, email, role });
    } catch (error) {
      console.error("Registration error", error);
      throw new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
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
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
