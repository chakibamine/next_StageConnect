import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { BriefcaseIcon, BuildingIcon, GraduationCapIcon, CheckCircleIcon, ArrowRightIcon, MailIcon, LockIcon, UserCircleIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<string>("student");
  const [companyName, setCompanyName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Join StageConnect | Professional Internship Platform";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate company name for employers
    if (role === "employer" && !companyName) {
      toast({
        title: "Company name required",
        description: "Please enter your company name",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "You must accept the terms and conditions to register",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call register with all necessary information
      await register(
        firstName, 
        lastName, 
        email, 
        password, 
        role, 
        role === "employer" ? companyName : undefined
      );
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now log in.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left section - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg">
          <div className="flex items-center mb-8">
            <div className="text-[#0A77FF] text-3xl mr-3">
              <BriefcaseIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">StageConnect</h1>
              <p className="text-neutral-500 text-sm">Your Internship Platform</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Join StageConnect today</h2>
          <p className="text-neutral-600 mb-8">
            Take the first step toward your professional journey
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-sm font-medium text-neutral-700">First Name</Label>
                <div className="relative">
                  <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-sm font-medium text-neutral-700">Last Name</Label>
                <div className="relative">
                  <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">Confirm Password</Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="role" className="text-sm font-medium text-neutral-700">I am a</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="py-6 h-11 border-neutral-300 bg-white focus:ring-[#0A77FF]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student" className="flex items-center">
                    <div className="flex items-center">
                      <GraduationCapIcon className="h-4 w-4 mr-2 text-[#0A77FF]" />
                      Student looking for internships
                    </div>
                  </SelectItem>
                  <SelectItem value="employer" className="flex items-center">
                    <div className="flex items-center">
                      <BuildingIcon className="h-4 w-4 mr-2 text-[#0A77FF]" />
                      Employer hiring interns
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Company Name field - only shown if role is 'employer' */}
            {role === 'employer' && (
              <div className="space-y-3">
                <Label htmlFor="companyName" className="text-sm font-medium text-neutral-700">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <BuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input 
                    id="companyName" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    className="pl-10 py-6 h-11 border-neutral-300 bg-white focus-visible:ring-[#0A77FF]"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-1 text-[#0A77FF] border-neutral-300 focus:ring-[#0A77FF]"
              />
              <Label htmlFor="terms" className="text-sm text-neutral-600 leading-tight">
                By clicking Join, you agree to the StageConnect <a href="#" className="text-[#0A77FF] hover:underline">User Agreement</a>, <a href="#" className="text-[#0A77FF] hover:underline">Privacy Policy</a>, and <a href="#" className="text-[#0A77FF] hover:underline">Cookie Policy</a>.
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white py-6 h-11 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Join StageConnect"}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-neutral-600">
                Already on StageConnect?{" "}
                <Link href="/login" className="text-[#0A77FF] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Right section - Benefits */}
      <div className="hidden md:block md:w-[45%] lg:w-1/2 bg-gradient-to-br from-[#0A77FF]/90 to-[#0A77FF] text-white">
        <div className="flex flex-col justify-center h-full p-10 lg:p-16">
          <h2 className="text-3xl font-bold mb-8">
            Join the platform that connects talent with opportunity
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">For Students</h3>
                <p className="text-white/80">Find the perfect internship, build your professional network, and kickstart your career journey.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">For Employers</h3>
                <p className="text-white/80">Discover talented students, post internships, and build your future workforce.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Professional Growth</h3>
                <p className="text-white/80">Access resources and tools to help you succeed in your professional development.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium text-xl mb-1">Community Support</h3>
                <p className="text-white/80">Join a community of professionals and get the support you need to succeed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
