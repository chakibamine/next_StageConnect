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
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { internshipApi, applicationApi, type Internship, type Application } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const InternshipDetail = () => {
  const [, params] = useRoute("/internships/:id");
  const internshipId = params?.id ? params.id : "";
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Attempting to fetch internship with ID: ${internshipId}`);
        // Fetch the internship by ID only (no companyId required)
        let data: Internship | null = null;
        try {
          data = await internshipApi.getInternshipById(internshipId);
          console.log("Successfully fetched internship:", data);
        } catch (err: any) {
          console.error("Error fetching internship:", err);
          throw err;
        }
        setInternship(data);

        // Set a safe document title - handle missing company
        const companyName = data.company?.name || "Unknown Company";
        document.title = `${data.title} at ${companyName} | StageConnect`;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch internship details";
        console.error("Setting error state:", errorMessage);
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Failed to fetch internship details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (internshipId) {
      console.log("Internship ID is present, fetching details");
      fetchInternshipDetails();
    } else {
      console.warn("No internship ID provided");
      setError("No internship ID provided");
      setLoading(false);
    }
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
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Internship link copied to clipboard",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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

  const submitApplication = async () => {
    try {
      if (!user || !internship) {
        toast({
          title: "Error",
          description: "Missing user or internship information",
          variant: "destructive",
        });
        return;
      }

      // Format data according to backend expectations
      const applicationData = {
        user_id: user.id,
        questionAnswers: applicationForm.questionsAnswers,
        availableStartDate: applicationForm.questionsAnswers.availableDate
      };

      // Submit application
      const response = await applicationApi.submitApplication(internshipId.toString(), applicationData);
      
      // Handle response
      if (response && response.success) {
        setShowApplyDialog(false);
        setApplicationStep(1);
        // Reset form data
        setApplicationForm({
          questionsAnswers: {
            whyInterested: "",
            relevantExperience: "",
            availableDate: ""
          }
        });
        
        toast({
          title: "Success",
          description: response.message || "Your application has been successfully submitted.",
        });
      } else {
        // This should not typically happen due to error handling in the API service
        toast({
          title: "Error",
          description: response.message || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Application submission error:", err);
      
      // Handle specific error cases
      let errorMessage = "Failed to submit application. Please try again later.";
      
      if (err.message) {
        if (err.message.includes("already applied")) {
          errorMessage = "You have already applied to this internship.";
        } else if (err.message.includes("not found")) {
          errorMessage = "User or internship information is invalid.";
        } else {
          errorMessage = err.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Safely format posted and deadline dates
  let postedString = "N/A";
  let deadlineString = "N/A";
  if (internship) {
    if (internship.posted) {
      const postedDate = new Date(internship.posted);
      if (!isNaN(postedDate.getTime())) {
        postedString = formatDistanceToNow(postedDate, { addSuffix: true });
      }
    }
    if (internship.deadline) {
      const deadlineDate = new Date(internship.deadline);
      if (!isNaN(deadlineDate.getTime())) {
        deadlineString = format(deadlineDate, "MMMM d, yyyy");
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Internship Not Found</h2>
            <p className="text-neutral-600 mb-6">
              {error || "The internship you're looking for doesn't exist or has been removed."}
            </p>
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
                    {internship.company?.name || "Unknown Company"}
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
                    <h4 className="font-semibold">{internship.company?.name || "Unknown Company"}</h4>
                    <p className="text-sm text-neutral-600">
                      {internship.company?.name || "This company"} is a leading company in its industry, committed to innovation and excellence. They provide a supportive environment for interns to learn and grow.
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
                Posted {postedString} • 
                Application deadline: {deadlineString}
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
                Application deadline is {deadlineString}.
              </p>
              <div className="flex items-center space-x-2 text-sm text-neutral-600 mb-4">
                <UsersIcon className="h-4 w-4" />
                <span>{internship.applicants} people have applied</span>
              </div>
              <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">Apply to this Internship</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Apply to {internship.title}</DialogTitle>
                    <DialogDescription>
                      Complete the following steps to submit your application to {internship.company?.name || "Unknown Company"}.
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
              {/* Similar internships would be fetched from the API */}
              <div className="text-center text-neutral-500">
                Loading similar internships...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail; 