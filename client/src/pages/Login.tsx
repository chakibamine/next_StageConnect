import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { BriefcaseIcon, GraduationCapIcon, UserIcon, BuildingIcon, ArrowRightIcon, LockIcon, MailIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Sign In | StageConnect";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get role-specific placeholder and information
  const getRolePlaceholder = () => {
    switch (activeRole) {
      case "student":
        return {
          email: "student email address",
          description: "Find internships, build your CV, and connect with employers."
        };
      case "employer":
        return {
          email: "employer email address",
          description: "Post internships, review applications, and find talent."
        };
      case "supervisor":
        return {
          email: "supervisor email address",
          description: "Monitor students, internships, and review applications."
        };
      default:
        return { email: "Your email address", description: "" };
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="text-[#0A77FF] text-3xl mr-3">
              <BriefcaseIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">StageConnect</h1>
              <p className="text-neutral-500 text-sm">Your Internship Platform</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Sign in</h2>
          <p className="text-neutral-600 mb-8">
            Stay connected to opportunities and your professional network
          </p>
          
          <Tabs 
            value={activeRole} 
            onValueChange={setActiveRole}
            className="w-full mb-6"
          >
            <TabsList className="grid grid-cols-3 w-full bg-neutral-100 p-1 rounded-xl">
              <TabsTrigger 
                value="student" 
                className={cn(
                  "flex items-center gap-2 rounded-lg text-sm",
                  activeRole === "student" 
                    ? "bg-white text-[#0A77FF] shadow-sm" 
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <GraduationCapIcon className="h-4 w-4" />
                <span>Student</span>
              </TabsTrigger>
              <TabsTrigger 
                value="employer" 
                className={cn(
                  "flex items-center gap-2 rounded-lg text-sm",
                  activeRole === "employer" 
                    ? "bg-white text-[#0A77FF] shadow-sm" 
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <BuildingIcon className="h-4 w-4" />
                <span>Employer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="supervisor" 
                className={cn(
                  "flex items-center gap-2 rounded-lg text-sm",
                  activeRole === "supervisor" 
                    ? "bg-white text-[#0A77FF] shadow-sm" 
                    : "text-neutral-600 hover:text-neutral-900"
                )}
              >
                <UserIcon className="h-4 w-4" />
                <span>Supervisor</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="mt-6">
              <div className="text-sm text-neutral-600 mb-6">
                <p>
                  Sign in as a student to find internships, build your CV, and network with employers.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="employer" className="mt-6">
              <div className="text-sm text-neutral-600 mb-6">
                <p>
                  Sign in as an employer to post internships and review applicants.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="supervisor" className="mt-6">
              <div className="text-sm text-neutral-600 mb-6">
                <p>
                  Sign in as a supervisor to monitor students, internships, and review applications.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={getRolePlaceholder().email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                <Link href="/forgot-password" className="text-sm text-[#0A77FF] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="text-[#0A77FF] border-neutral-300 focus:ring-[#0A77FF]"
              />
              <Label htmlFor="remember" className="text-sm text-neutral-600">
                Remember me
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white py-6 h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-neutral-600">
              New to StageConnect?{" "}
              <Link href="/register" className="text-[#0A77FF] font-medium hover:underline">
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right section - Image and benefits */}
      <div className="hidden md:block md:w-[45%] lg:w-1/2 bg-gradient-to-br from-[#0A77FF]/90 to-[#0A77FF] text-white">
        <div className="flex flex-col justify-center h-full p-10 lg:p-16">
          <h2 className="text-3xl font-bold mb-8">
            Welcome to the platform where talent and opportunity connect
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <GraduationCapIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Students</h3>
                <p className="text-white/80">Find the perfect internship to kickstart your career and build valuable professional connections.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Employers</h3>
                <p className="text-white/80">Discover top talent for your organization and build a pipeline of future employees.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Supervisors</h3>
                <p className="text-white/80">Monitor and guide the internship process to ensure successful outcomes for both students and employers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
