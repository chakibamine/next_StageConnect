import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { BriefcaseIcon, ArrowRightIcon, LockIcon, MailIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem("rememberMe");
    return saved ? JSON.parse(saved) : false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Sign In | StageConnect";
  }, []);

  // Save remember me preference
  useEffect(() => {
    localStorage.setItem("rememberMe", JSON.stringify(rememberMe));
  }, [rememberMe]);

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
      const userRole = await login(email, password);
      
      // If remember me is checked, store the email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      // Show success message
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${userRole}`,
      });
      
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

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

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
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email address"
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
                <BriefcaseIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Connect & Collaborate</h3>
                <p className="text-white/80">Join our platform to connect with opportunities, build your network, and advance your career.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <BriefcaseIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Professional Growth</h3>
                <p className="text-white/80">Access resources, mentorship, and opportunities to grow your professional skills.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <BriefcaseIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Career Development</h3>
                <p className="text-white/80">Take the next step in your career with our comprehensive platform.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
