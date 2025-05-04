import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Internships from "@/pages/Internships";
import InternshipDetail from "@/pages/InternshipDetail";
import Messaging from "@/pages/Messaging";
import Network from "@/pages/Network";
import CVBuilder from "@/pages/CVBuilder";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import EmployerDashboard from "@/pages/EmployerDashboard";
import SupervisorDashboard from "@/pages/SupervisorDashboard";
import Notifications from "@/pages/Notifications";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import EmployerProfile from "./pages/EmployerProfile";
import LandingPage from "./pages/LandingPage";
import { Suspense, useEffect } from "react";

// Add a loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Define public routes
const PUBLIC_ROUTES = ['/login', '/register', '/'];

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <QueryClientProvider client={queryClient}>
            <AppContent />
            <Toaster />
          </QueryClientProvider>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ component: Component, requiredRole, ...rest }: { 
  component: React.ComponentType<any>,
  requiredRole?: string | string[], 
  [x: string]: any 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return <LoadingFallback />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Authentication check failed - redirecting to login");
    navigate("/login");
    return null;
  }

  // If role is required, check if user has the required role
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      console.log(`Role check failed - user has role ${user.role} but needs ${roles.join(' or ')}`);
      navigate("/");
      return null;
    }
  }

  // User is authenticated and has required role (if specified)
  return <Component {...rest} />;
};

// Profile route component that handles both viewing and editing
const ProfileRoute = ({ id }: { id?: string }) => {
  const { user, isAuthenticated } = useAuth();
  
  // If no ID is provided, show the current user's profile
  if (!id) {
    return <Profile isEditable={true} />;
  }
  
  // If ID is provided, show the profile in view mode
  // The Profile component will handle the connection logic
  return <Profile id={id} isEditable={false} />;
};

// Employer profile route component that handles both viewing and editing
const EmployerProfileRoute = ({ id }: { id?: string }) => {
  const { user, isAuthenticated } = useAuth();
  
  // If no ID is provided, show the current user's profile
  if (!id) {
    return <EmployerProfile isEditable={true} />;
  }
  
  // If ID is provided, show the profile in view mode
  // The EmployerProfile component will handle the connection logic
  return <EmployerProfile id={id} isEditable={false} />;
};

// Home route that redirects based on authentication state and user role
const HomeRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // Home route logic - redirect based on auth status and role
  if (isAuthenticated && user) {
    switch (user.role) {
      case "employer":
        navigate("/employer-dashboard", { replace: true });
        return null;
      case "supervisor":
        navigate("/supervisor-dashboard", { replace: true });
        return null;
      case "student":
        navigate("/dashboard", { replace: true });
        return null;
      default:
        // Default case if role is unknown
        console.log(`Unknown user role "${user.role}" - showing landing page`);
        return <LandingPage />;
    }
  }
  
  // Not authenticated, show landing page
  return <LandingPage />;
};

// Auth guard that redirects unauthenticated users
const AuthGuard = ({ path, children }: { path: string, children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  // Don't redirect if on a public route
  if (PUBLIC_ROUTES.includes(path)) {
    return <>{children}</>;
  }
  
  // If still loading, show loading indicator
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // If not authenticated and not on a public route, redirect to login
  if (!isAuthenticated && location === path) {
    navigate("/login", { replace: true });
    return null;
  }
  
  // Otherwise, render children
  return <>{children}</>;
};

function AppContent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Log auth state on initial render to help with debugging
  useEffect(() => {
    if (!isLoading) {
      console.log(
        `Auth status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}, ` +
        `User: ${user ? `${user.firstName} (${user.role})` : 'None'}`
      );
    }
  }, [isLoading, isAuthenticated, user]);
  
  // Wait for auth to be determined before making routing decisions
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  // Get the role for conditional rendering with fallback
  const userRole = user?.role || "";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomeRoute} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Common routes for all authenticated users */}
          {isAuthenticated && (
            <>
              {/* Profile routes - accessible to all authenticated users */}
              <Route path="/profile">
                <ProtectedRoute component={ProfileRoute} />
              </Route>
              <Route path="/profile/:id">
                {(params) => <ProtectedRoute component={ProfileRoute} id={params.id} />}
              </Route>
              <Route path="/company/:id">
                {(params) => <ProtectedRoute component={EmployerProfile} id={params.id} />}
              </Route>
              
              {/* Common features */}
              <Route path="/messaging">
                <ProtectedRoute component={Messaging} />
              </Route>
              <Route path="/notifications">
                <ProtectedRoute component={Notifications} />
              </Route>
              <Route path="/network">
                <ProtectedRoute component={Network} />
              </Route>
            </>
          )}
          
          {/* Role-specific routes */}
          {isAuthenticated && userRole === "student" && (
            <>
              <Route path="/dashboard">
                <ProtectedRoute component={Dashboard} />
              </Route>
              <Route path="/internships">
                <ProtectedRoute component={Internships} />
              </Route>
              <Route path="/internships/:id">
                {(params) => <ProtectedRoute component={InternshipDetail} id={params.id} />}
              </Route>
              <Route path="/cv-builder">
                <ProtectedRoute component={CVBuilder} requiredRole="student" />
              </Route>
            </>
          )}
          
          {isAuthenticated && userRole === "employer" && (
            <>
              <Route path="/employer-dashboard">
                <ProtectedRoute component={EmployerDashboard} requiredRole="employer" />
              </Route>
            </>
          )}
          
          {isAuthenticated && userRole === "supervisor" && (
            <>
              <Route path="/supervisor-dashboard">
                <ProtectedRoute component={SupervisorDashboard} requiredRole="supervisor" />
              </Route>
            </>
          )}
          
          {/* Catch-all route */}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

export default App;
