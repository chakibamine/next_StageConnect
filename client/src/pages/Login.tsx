import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { BriefcaseIcon, GraduationCapIcon, UserIcon, BuildingIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Login | StageConnect";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // For demo purposes, we'll automatically log in when clicking the login button
  const handleAutoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let prefixedUsername = username;
    
    // Based on the selected role, we'll prepend the role prefix
    if (activeRole === "student") {
      prefixedUsername = username.startsWith("student_") ? username : "student_" + username;
    } else if (activeRole === "employer") {
      prefixedUsername = username.startsWith("employer_") ? username : "employer_" + username;
    } else if (activeRole === "supervisor") {
      prefixedUsername = username.startsWith("supervisor_") ? username : "supervisor_" + username;
    }
    
    // Simulate a delay
    setTimeout(() => {
      login(prefixedUsername, password);
      navigate("/");
    }, 800);
  };
  
  // Get role-specific placeholder and information
  const getRolePlaceholder = () => {
    switch (activeRole) {
      case "student":
        return {
          username: "student account username",
          description: "Find internships, build your CV, and connect with employers."
        };
      case "employer":
        return {
          username: "employer account username",
          description: "Post internships, review applications, and find talent."
        };
      case "supervisor":
        return {
          username: "supervisor account username",
          description: "Monitor students, internships, and review applications."
        };
      default:
        return { username: "Your username", description: "" };
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block text-primary-600 text-3xl mb-4">
            <BriefcaseIcon className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome to StageConnect</h1>
          <p className="text-neutral-500 mt-2">Sign in to access your account</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeRole} 
              onValueChange={setActiveRole}
              className="w-full mb-6"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCapIcon className="h-4 w-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger value="employer" className="flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  <span>Employer</span>
                </TabsTrigger>
                <TabsTrigger value="supervisor" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Supervisor</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="student" className="mt-4">
                <div className="text-xs text-muted-foreground mb-4 space-y-2">
                  <p>
                    Sign in as a student to find internships, build your CV, and network with employers.
                  </p>
                  <div className="flex items-center justify-between bg-muted p-2 rounded text-[11px] font-mono">
                    <span>Demo: student_demo / password</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-xs" 
                      onClick={() => {
                        setUsername("student_demo");
                        setPassword("password");
                      }}
                    >
                      Use these
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="employer" className="mt-4">
                <div className="text-xs text-muted-foreground mb-4 space-y-2">
                  <p>
                    Sign in as an employer to post internships and review applicants.
                  </p>
                  <div className="flex items-center justify-between bg-muted p-2 rounded text-[11px] font-mono">
                    <span>Demo: employer_demo / password</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-xs" 
                      onClick={() => {
                        setUsername("employer_demo");
                        setPassword("password");
                      }}
                    >
                      Use these
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="supervisor" className="mt-4">
                <div className="text-xs text-muted-foreground mb-4 space-y-2">
                  <p>
                    Sign in as a supervisor to monitor students, internships, and review applications.
                  </p>
                  <div className="flex items-center justify-between bg-muted p-2 rounded text-[11px] font-mono">
                    <span>Demo: supervisor_demo / password</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-xs" 
                      onClick={() => {
                        setUsername("supervisor_demo");
                        setPassword("password");
                      }}
                    >
                      Use these
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <form onSubmit={handleAutoLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder={getRolePlaceholder().username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center mt-2">
              <p className="text-sm text-neutral-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-xs text-neutral-500">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
