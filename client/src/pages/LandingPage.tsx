import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Users, 
  CheckCircle, 
  Building,
  ArrowUpRight,
  Star,
  Award,
  Globe
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    studentsPlaced: 0,
    partneredCompanies: 0,
    successfulMatches: 0
  });
  const [currentImage, setCurrentImage] = useState(0);
  const testimonials = [
    {
      quote: "This platform has been instrumental in helping me secure my dream internship at a leading tech company.",
      author: "Alex Johnson",
      title: "Computer Science Student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    {
      quote: "We've found exceptionally talented interns through this platform, streamlining our recruitment process significantly.",
      author: "Sarah Chen",
      title: "HR Director, TechCorp",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    },
    {
      quote: "As a supervisor, I can easily track my students' internship progress and provide timely guidance when needed.",
      author: "Dr. Michael Rivera",
      title: "University Supervisor",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
    }
  ];

  // Animate the stats count up
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const studentsPlaced = Math.min(prev.studentsPlaced + 5, 1200);
        const partneredCompanies = Math.min(prev.partneredCompanies + 2, 350);
        const successfulMatches = Math.min(prev.successfulMatches + 4, 950);
        
        if (studentsPlaced === 1200 && partneredCompanies === 350 && successfulMatches === 950) {
          clearInterval(interval);
        }
        
        return { studentsPlaced, partneredCompanies, successfulMatches };
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, []);

  // Testimonial slider timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_25%_at_50%_50%,var(--tw-gradient-from)_1%,var(--tw-gradient-to)_99%)] from-primary/20 to-transparent opacity-20"></div>
        <div className="absolute inset-y-0 right-0 -z-10 w-[40%] bg-gradient-to-l from-primary/5 to-transparent"></div>
        
        <div className="container px-4 md:px-6 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                Connecting talent with opportunity 
                <span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Our internship platform bridges the gap between students, employers, and educational institutions, creating meaningful career pathways.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {user ? "Go to Dashboard" : "Get Started"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                Learn More
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified Employers</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>University Approved</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
          
          <div className="relative w-full max-w-md lg:max-w-lg h-[400px] lg:h-[450px]">
            <div className="absolute top-0 right-0 bg-white rounded-lg shadow-xl border p-6 w-64 animate-float-slow">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Application Accepted</h3>
                  <p className="text-xs text-muted-foreground">Frontend Developer Intern</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-full"></div>
              </div>
            </div>
            
            <div className="absolute bottom-20 left-0 bg-white rounded-lg shadow-xl border p-4 w-56 animate-float-medium">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Interview Scheduled</h3>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-10 bg-white rounded-lg shadow-xl border p-4 w-48 animate-float">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-xs mt-2">"Great experience with my internship!"</p>
            </div>
            
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/2 left-1/2 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary">{stats.studentsPlaced.toLocaleString()}+</h2>
              <p className="text-muted-foreground">Students Placed</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary">{stats.partneredCompanies.toLocaleString()}+</h2>
              <p className="text-muted-foreground">Partnered Companies</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-primary">{stats.successfulMatches.toLocaleString()}+</h2>
              <p className="text-muted-foreground">Successful Matches</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Tailored for all stakeholders</h2>
            <p className="text-muted-foreground text-lg">
              Our platform offers specialized features to meet the needs of students, employers, and supervisors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Students</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Discover relevant internship opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Build and showcase your professional profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Track application status in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Connect with industry professionals</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button variant="outline" className="w-full gap-2">
                    Sign Up as Student
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Employers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Post internship opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Find the best talent for your organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Streamlined applicant management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Direct communication with candidates</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign Up as Employer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border transition-all hover:shadow-md">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">For Supervisors</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Monitor student progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Approve student applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Communicate with employers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Generate detailed reports</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/register">
                  <Button variant="outline" className="w-full gap-2">
                    Sign Up as Supervisor
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">What our users say</h2>
            <p className="text-muted-foreground text-lg">
              Hear from students, employers, and supervisors who've experienced the difference.
            </p>
          </div>
          
          <div className="relative h-96 overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 px-4 ${
                  index === currentImage ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <div className="max-w-2xl mx-auto text-center">
                  <div className="h-16 w-16 rounded-full mx-auto mb-6 overflow-hidden">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <p className="text-xl italic mb-6">
                    "{testimonial.quote}"
                  </p>
                  
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentImage 
                      ? "bg-primary" 
                      : "bg-muted hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold">Trusted by leading organizations</h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="h-12 w-28 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <Building className="h-12 w-full text-gray-600" />
            </div>
            <div className="h-12 w-28 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <Award className="h-12 w-full text-gray-600" />
            </div>
            <div className="h-12 w-28 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <Globe className="h-12 w-full text-gray-600" />
            </div>
            <div className="h-12 w-28 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <Building className="h-12 w-full text-gray-600" />
            </div>
            <div className="h-12 w-28 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <Award className="h-12 w-full text-gray-600" />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to transform your career journey?</h2>
              <p className="mb-6 text-primary-foreground/90">
                Join thousands of students, employers, and supervisors already benefiting from our platform.
              </p>
              <Button variant="secondary" size="lg" className="gap-2">
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold mb-4">Subscribe to our newsletter</h3>
              <p className="text-primary-foreground/90 mb-4">
                Stay updated with the latest internship opportunities and career insights.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your email"
                  className="bg-white/20 border-primary-foreground/20 placeholder:text-primary-foreground/50"
                />
                <Button variant="secondary">Subscribe</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Custom Animation Classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-medium {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
} 