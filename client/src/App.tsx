import { Switch, Route } from "wouter";
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
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/" component={Login} />
              <Route path="/register" component={Register} />
            </>
          ) : (
            <>
              {/* Common routes for all users */}
              <Route path="/messaging" component={Messaging} />
              <Route path="/profile" component={Profile} />
              
              {/* Role-specific home routes */}
              <Route path="/">
                {user?.role === "employer" 
                  ? <EmployerDashboard /> 
                  : user?.role === "supervisor"
                  ? <SupervisorDashboard />
                  : <Dashboard />
                }
              </Route>
              
              {/* Student-specific routes */}
              {(user?.role === "student" || user?.role === "supervisor") && (
                <>
                  <Route path="/internships" component={Internships} />
                  <Route path="/internships/:id" component={InternshipDetail} />
                  <Route path="/network" component={Network} />
                  <Route path="/cv-builder" component={CVBuilder} />
                </>
              )}
              
              {/* Employer-specific routes */}
              {(user?.role === "employer" || user?.role === "supervisor") && (
                <>
                  <Route path="/employer-dashboard" component={EmployerDashboard} />
                </>
              )}
              
              {/* Supervisor-specific routes */}
              {user?.role === "supervisor" && (
                <>
                  <Route path="/supervisor-dashboard" component={SupervisorDashboard} />
                </>
              )}
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

export default App;
