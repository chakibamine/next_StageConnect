import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  BuildingIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon, 
  BriefcaseIcon, 
  BookmarkIcon,
  CreditCardIcon,
  UsersIcon,
  ArrowLeftIcon,
  Share2Icon,
  FileTextIcon,
  MessageSquareIcon,
  SendIcon,
  CheckCircleIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow, format } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Internship } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

const InternshipDetail = () => {
  const [, params] = useRoute("/internships/:id");
  const internshipId = params?.id ? parseInt(params.id) : 0;
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const { user } = useAuth();
  const [applicationForm, setApplicationForm] = useState({
    questionsAnswers: {
      whyInterested: "",
      relevantExperience: "",
      availableDate: ""
    }
  });
  const { toast } = useToast();

  // Mock internship data fetch
  useEffect(() => {
    const mockInternships: Internship[] = [
      {
        id: 1,
        title: "UX/UI Design Intern",
        company: "DesignHub",
        location: "Paris, France",
        description: "Join our creative team to design intuitive user interfaces for web and mobile applications. You'll work with experienced designers and developers to create elegant solutions to complex UX challenges.",
        requirements: "Proficiency in Figma, Adobe XD, and basic knowledge of HTML/CSS. Studying design or a related field.",
        duration: "6 months",
        isPaid: true,
        workType: "Hybrid",
        compensation: "€800/month",
        applicationDeadline: new Date("2023-06-15"),
        postedBy: 1,
        createdAt: new Date("2023-05-01"),
      },
      {
        id: 2,
        title: "Software Engineering Intern",
        company: "TechCorp",
        location: "Lyon, France",
        description: "Looking for a passionate software engineering intern to join our development team. You'll be working on real projects using technologies like React, Node.js, and AWS. Great opportunity to apply your technical skills in a real-world setting.",
        requirements: "Knowledge of JavaScript, React, and Node.js. Currently pursuing a degree in Computer Science or related field.",
        duration: "3 months",
        isPaid: true,
        workType: "On-site",
        compensation: "€900/month",
        applicationDeadline: new Date("2023-06-30"),
        postedBy: 2,
        createdAt: new Date("2023-04-28"),
      },
      {
        id: 3,
        title: "Marketing Analytics Intern",
        company: "GlobalBrands",
        location: "Paris, France",
        description: "GlobalBrands is seeking a Marketing Analytics Intern to help analyze campaign performance and provide data-driven insights. You'll work with marketing teams to optimize strategies and measure ROI across different channels.",
        requirements: "Strong analytical skills, knowledge of Excel and Google Analytics. Studying Marketing, Business, or Statistics.",
        duration: "6 months",
        isPaid: true,
        workType: "Remote",
        compensation: "€850/month",
        applicationDeadline: new Date("2023-06-10"),
        postedBy: 3,
        createdAt: new Date("2023-04-30"),
      },
      {
        id: 4,
        title: "Research & Development Intern",
        company: "BioInnovate",
        location: "Marseille, France",
        description: "BioInnovate is looking for a research intern to assist in our biotech R&D department. The ideal candidate will have a background in biology or chemistry and a strong interest in laboratory research and innovation.",
        requirements: "Background in Biology, Chemistry or related field. Laboratory experience is a plus.",
        duration: "6+ months",
        isPaid: true,
        workType: "On-site",
        compensation: "€950/month",
        applicationDeadline: new Date("2023-07-15"),
        postedBy: 4,
        createdAt: new Date("2023-04-25"),
      },
      {
        id: 5,
        title: "Junior UX Designer",
        company: "Creative Studio",
        location: "Paris, France",
        description: "Creative Studio is seeking a Junior UX Designer to join our team. You'll work closely with senior designers on various client projects, focusing on creating intuitive and engaging user experiences.",
        requirements: "Basic knowledge of UX design principles and tools like Figma or Sketch. A portfolio of design projects is a plus. Pursuing a degree in Design or related field.",
        duration: "6 months",
        isPaid: true,
        workType: "Hybrid",
        compensation: "€850/month",
        applicationDeadline: new Date("2023-07-20"),
        postedBy: 5,
        createdAt: new Date("2023-05-10"),
      },
      {
        id: 6,
        title: "Product Design Intern",
        company: "TechStart",
        location: "Remote",
        description: "TechStart is looking for a talented Product Design Intern to help us create innovative digital products. You'll be involved in all aspects of the design process from research to implementation.",
        requirements: "Understanding of UI/UX principles. Familiarity with design software like Figma, Sketch, or Adobe XD. Currently enrolled in a Design, HCI, or related program.",
        duration: "3 months",
        isPaid: true,
        workType: "Remote",
        compensation: "€800/month",
        applicationDeadline: new Date("2023-06-25"),
        postedBy: 6,
        createdAt: new Date("2023-05-05"),
      },
      {
        id: 7,
        title: "UI/UX Design Assistant",
        company: "DigitalEdge",
        location: "Lyon, France",
        description: "DigitalEdge is seeking a UI/UX Design Assistant to support our design team on client projects. You'll help create wireframes, mockups, and prototypes for web and mobile applications.",
        requirements: "Understanding of UI/UX design principles. Proficiency with design tools like Figma or Adobe XD. Creative portfolio demonstrating UI design skills.",
        duration: "4 months",
        isPaid: true,
        workType: "On-site",
        compensation: "€875/month",
        applicationDeadline: new Date("2023-07-05"),
        postedBy: 7,
        createdAt: new Date("2023-05-15"),
      },
    ];

    // Simulate API call
    setTimeout(() => {
      const foundInternship = mockInternships.find(i => i.id === internshipId);
      if (foundInternship) {
        setInternship(foundInternship);
        document.title = `${foundInternship.title} at ${foundInternship.company} | StageConnect`;
      }
      setLoading(false);
    }, 500);
  }, [internshipId]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Added to saved",
      description: isSaved 
        ? "Internship removed from your saved list" 
        : "Internship saved to your profile",
    });
  };

  const handleShare = () => {
    // In production, would use actual share API
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Internship link copied to clipboard",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Check if this is a nested property (questionsAnswers)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setApplicationForm({
        ...applicationForm,
        [parent]: {
          ...applicationForm[parent as keyof typeof applicationForm] as Record<string, string>,
          [child]: value
        }
      });
    } else {
      setApplicationForm({
        ...applicationForm,
        [name]: value
      });
    }
  };

  const nextStep = () => {
    setApplicationStep(prev => prev + 1);
  };

  const prevStep = () => {
    setApplicationStep(prev => prev - 1);
  };

  const submitApplication = () => {
    // Here would be the API call to submit the application
    console.log("Application submitted:", {
      user: user,
      internship: internship,
      answers: applicationForm.questionsAnswers
    });
    setShowApplyDialog(false);
    setApplicationStep(1);
    toast({
      title: "Application submitted",
      description: "Your application has been successfully submitted.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-3xl">
          <div className="h-8 bg-neutral-200 rounded w-2/3"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Internship Not Found</h2>
            <p className="text-neutral-600 mb-6">The internship you're looking for doesn't exist or has been removed.</p>
            <Link href="/internships">
              <Button>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Internships
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Link href="/internships">
          <Button variant="outline" size="sm">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Internships
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{internship.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1 text-neutral-600">
                    <BuildingIcon className="h-4 w-4 mr-1" />
                    {internship.company}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={isSaved ? "text-primary-600" : "text-neutral-400 hover:text-primary-600"}
                    onClick={handleSave}
                  >
                    <BookmarkIcon className={isSaved ? "fill-primary-600" : ""} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2Icon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-primary-50 rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-primary-600 mb-1" />
                  <span className="text-sm font-medium text-center">{internship.location}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-primary-50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-primary-600 mb-1" />
                  <span className="text-sm font-medium text-center">{internship.duration}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-primary-50 rounded-lg">
                  <BriefcaseIcon className="h-5 w-5 text-primary-600 mb-1" />
                  <span className="text-sm font-medium text-center">{internship.workType}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-primary-50 rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-primary-600 mb-1" />
                  <span className="text-sm font-medium text-center">{internship.compensation}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-neutral-700 whitespace-pre-line">{internship.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                <p className="text-neutral-700 whitespace-pre-line">{internship.requirements}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">About the Company</h3>
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center mr-4">
                    <BuildingIcon className="h-6 w-6 text-neutral-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{internship.company}</h4>
                    <p className="text-sm text-neutral-600">
                      {internship.company} is a leading company in its industry, committed to innovation and excellence. They provide a supportive environment for interns to learn and grow.
                    </p>
                    <Button variant="link" className="px-0 text-primary-600 h-auto">
                      View company profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-neutral-500">
                Posted {formatDistanceToNow(new Date(internship.createdAt), { addSuffix: true })} • 
                Application deadline: {format(new Date(internship.applicationDeadline), "MMMM d, yyyy")}
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Questions & Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" alt="User Avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">John Doe</h4>
                      <span className="text-xs text-neutral-500 ml-2">2 days ago</span>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">
                      Is it possible to extend the internship beyond the initial duration if both parties agree?
                    </p>
                    <div className="mt-3 pl-5 border-l-2 border-neutral-200">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100" alt="Recruiter Avatar" />
                          <AvatarFallback>RC</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium text-sm">Recruiter</h4>
                            <span className="text-xs text-neutral-500 ml-2">1 day ago</span>
                          </div>
                          <p className="text-sm text-neutral-700 mt-1">
                            Yes, there is a possibility to extend the internship duration based on performance and mutual agreement. This would be discussed toward the end of the initial period.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>YOU</AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input placeholder="Ask a question about this internship..." className="pr-10" />
                  <Button className="absolute right-0 top-0 h-full" size="icon" variant="ghost">
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Apply Now</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 mb-4">
                Don't miss this opportunity to kick-start your career. 
                Application deadline is {format(new Date(internship.applicationDeadline), "MMMM d, yyyy")}.
              </p>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-4">
                <UsersIcon className="h-4 w-4" />
                <span>{Math.floor(Math.random() * 100)} people have applied</span>
              </div>
              <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">Apply to this Internship</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Apply to {internship.title}</DialogTitle>
                    <DialogDescription>
                      Complete the following steps to submit your application to {internship.company}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Application Progress</span>
                        <span className="text-sm text-neutral-500">{applicationStep}/1</span>
                      </div>
                      <Progress value={applicationStep * 100} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-primary-50 rounded-lg mb-4">
                        <h4 className="font-medium text-sm">Applying as</h4>
                        <div className="flex items-center mt-2">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={user?.profilePicture} alt={user?.firstName} />
                            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-neutral-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                    
                      <h3 className="text-base font-medium">Internship Questions</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="whyInterested">Why are you interested in this internship?</Label>
                          <Textarea 
                            id="whyInterested" 
                            name="questionsAnswers.whyInterested" 
                            rows={3} 
                            value={applicationForm.questionsAnswers.whyInterested} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="relevantExperience">Describe any relevant experience you have.</Label>
                          <Textarea 
                            id="relevantExperience" 
                            name="questionsAnswers.relevantExperience" 
                            rows={3} 
                            value={applicationForm.questionsAnswers.relevantExperience} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="availableDate">When can you start if selected?</Label>
                          <Input 
                            id="availableDate" 
                            name="questionsAnswers.availableDate" 
                            value={applicationForm.questionsAnswers.availableDate} 
                            onChange={handleInputChange} 
                            placeholder="e.g., July 1, 2023" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex justify-between">
                    <div>
                      <Button onClick={submitApplication}>
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Submit Application
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Similar Internships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/internships/5" className="block">
                <div className="border-b border-neutral-200 pb-3 hover:bg-neutral-50 p-2 rounded-md transition-colors">
                  <h4 className="font-medium">Junior UX Designer</h4>
                  <p className="text-sm text-neutral-600">Creative Studio • Paris</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2 text-xs">6 months</Badge>
                    <Badge variant="outline" className="text-xs">Paid</Badge>
                  </div>
                </div>
              </Link>
              <Link href="/internships/6" className="block">
                <div className="border-b border-neutral-200 pb-3 hover:bg-neutral-50 p-2 rounded-md transition-colors">
                  <h4 className="font-medium">Product Design Intern</h4>
                  <p className="text-sm text-neutral-600">TechStart • Remote</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2 text-xs">3 months</Badge>
                    <Badge variant="outline" className="text-xs">Paid</Badge>
                  </div>
                </div>
              </Link>
              <Link href="/internships/7" className="block">
                <div className="hover:bg-neutral-50 p-2 rounded-md transition-colors">
                  <h4 className="font-medium">UI/UX Design Assistant</h4>
                  <p className="text-sm text-neutral-600">DigitalEdge • Lyon</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="mr-2 text-xs">4 months</Badge>
                    <Badge variant="outline" className="text-xs">Paid</Badge>
                  </div>
                </div>
              </Link>
              <Link href="/internships">
                <Button variant="outline" className="w-full">
                  View More
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail; 