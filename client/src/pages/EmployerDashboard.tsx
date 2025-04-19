import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  BriefcaseIcon, 
  UsersIcon, 
  GraduationCapIcon, 
  CheckCircleIcon,
  CalendarIcon,
  BarChart3Icon,
  TrendingUpIcon,
  Plus,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XIcon,
  CheckIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  BuildingIcon,
  SearchIcon,
  FilterIcon,
  ChevronDownIcon,
  PieChartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define application type
type Application = {
  id: string;
  internshipId: string;
  internshipTitle: string;
  applicantName: string;
  applicantPhoto: string;
  university: string;
  email: string;
  phone: string;
  portfolio?: string;
  skills: string[];
  coverLetter: string;
  status: "pending" | "interview" | "accepted" | "rejected";
  appliedAt: string;
  interviewDate?: string;
  interviewTime?: string;
};

// Function to format relative time
function formatRelativeTime(dateString: string) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Company info
const companyInfo = {
  name: "TechCorp Solutions",
  logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80",
  activeInternships: 3,
  totalPositions: 8
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [currentInternship, setCurrentInternship] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState<any>(null);
  
  // Applicant management state
  const [showApplicantView, setShowApplicantView] = useState(false);
  const [currentApplicant, setCurrentApplicant] = useState<Application | null>(null);
  const [applicantNotes, setApplicantNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>("all");
  
  // Form state
  const [internshipForm, setInternshipForm] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
    requirements: "",
    workType: "on-site",
    duration: "",
    compensation: "",
    isPaid: true,
    applicationDeadline: "",
  });

  // Static employer statistics
  const stats = { 
    totalInternships: 5, 
    activeInternships: 3,
    totalApplications: 24,
    pendingApplications: 8,
    acceptedApplications: 4,
    rejectedApplications: 6,
    interviewingApplications: 6
  };

  // Static recent applications with expanded data
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app1",
      internshipId: "int1",
      internshipTitle: "Frontend Developer Intern",
      applicantName: "Sarah Johnson",
      applicantPhoto: "https://randomuser.me/api/portraits/women/44.jpg",
      university: "Stanford University",
      email: "sarah.j@stanford.edu",
      phone: "+1 555-123-4567",
      portfolio: "https://sarahjohnson.dev",
      skills: ["React", "TypeScript", "UI/UX", "Figma"],
      coverLetter: "I am excited to apply for the Frontend Developer Internship. With my background in React and TypeScript, I believe I can contribute significantly to your team while gaining valuable industry experience.",
      status: "interview",
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      interviewTime: "14:00",
    },
    {
      id: "app2",
      internshipId: "int2",
      internshipTitle: "Data Science Intern",
      applicantName: "Michael Chen",
      applicantPhoto: "https://randomuser.me/api/portraits/men/22.jpg",
      university: "MIT",
      email: "mchen@mit.edu",
      phone: "+1 555-987-6543",
      skills: ["Python", "Data Analysis", "Machine Learning", "SQL"],
      coverLetter: "I am writing to express my interest in the Data Science Internship position. My strong foundation in statistical analysis and machine learning, combined with my passion for solving complex problems, makes me a suitable candidate for this role.",
      status: "pending",
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "app3",
      internshipId: "int1",
      internshipTitle: "Frontend Developer Intern",
      applicantName: "Emma Wilson",
      applicantPhoto: "https://randomuser.me/api/portraits/women/63.jpg",
      university: "UC Berkeley",
      email: "emma.w@berkeley.edu",
      phone: "+1 555-345-6789",
      portfolio: "https://emmawilson.io",
      skills: ["JavaScript", "React", "CSS", "Web Design"],
      coverLetter: "I'm applying for the Frontend Developer Internship at your company. With my passion for creating beautiful and functional user interfaces, I am eager to contribute to your team's projects and grow my skills in a professional environment.",
      status: "accepted",
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "app4",
      internshipId: "int3",
      internshipTitle: "UX Research Intern",
      applicantName: "David Kim",
      applicantPhoto: "https://randomuser.me/api/portraits/men/36.jpg",
      university: "Rhode Island School of Design",
      email: "david.k@risd.edu",
      phone: "+1 555-234-5678",
      portfolio: "https://davidkim.design",
      skills: ["User Research", "Prototyping", "Usability Testing", "Sketch"],
      coverLetter: "I am interested in the UX Research Internship position at your company. My background in design thinking and user-centered research methods has prepared me to make meaningful contributions to your projects.",
      status: "rejected",
      appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "app5",
      internshipId: "int2",
      internshipTitle: "Data Science Intern",
      applicantName: "Olivia Martinez",
      applicantPhoto: "https://randomuser.me/api/portraits/women/25.jpg",
      university: "Georgia Tech",
      email: "o.martinez@gatech.edu",
      phone: "+1 555-876-5432",
      skills: ["R", "Statistics", "Data Visualization", "Big Data"],
      coverLetter: "I am reaching out to express my enthusiasm for the Data Science Internship position. My academic background and practical experience in statistical analysis and data modeling align well with the requirements of this role.",
      status: "pending",
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Application timeline data - applications per month
  const applicationTimelineData = [4, 6, 3, 7, 8, 12, 11, 9, 14, 17, 13, 15];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInternshipForm({
      ...internshipForm,
      [name]: value
    });
  };

  // Handle select input changes
  const handleSelectChange = (name: string, value: string) => {
    setInternshipForm({
      ...internshipForm,
      [name]: value
    });
  };

  // Create a new internship
  const handleCreateInternship = () => {
    // Form validation
    if (!internshipForm.title || !internshipForm.department || !internshipForm.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newInternship = {
      id: internships.length + 1,
      ...internshipForm,
      applicants: 0,
      status: "active",
      posted: new Date().toISOString(),
      deadline: internshipForm.applicationDeadline 
        ? new Date(internshipForm.applicationDeadline).toISOString() 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (currentInternship) {
      // Update existing internship
      const updatedInternships = internships.map(internship => 
        internship.id === currentInternship.id ? { ...internship, ...internshipForm } : internship
      );
      setInternships(updatedInternships);
      toast({
        title: "Internship updated",
        description: `${internshipForm.title} has been updated successfully.`,
      });
    } else {
      // Add new internship
      setInternships([...internships, newInternship]);
      toast({
        title: "Internship created",
        description: `${internshipForm.title} has been posted successfully.`,
      });
    }

    // Reset form
    setInternshipForm({
      title: "",
      department: "",
      location: "",
      description: "",
      requirements: "",
      workType: "on-site",
      duration: "",
      compensation: "",
      isPaid: true,
      applicationDeadline: "",
    });
    setCurrentInternship(null);
    setShowInternshipForm(false);
  };

  // Edit an existing internship
  const handleEditInternship = (internship: any) => {
    setCurrentInternship(internship);
    setInternshipForm({
      title: internship.title,
      department: internship.department,
      location: internship.location,
      description: internship.description || "",
      requirements: internship.requirements || "",
      workType: internship.workType || "on-site",
      duration: internship.duration || "",
      compensation: internship.compensation || "",
      isPaid: internship.isPaid,
      applicationDeadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : "",
    });
    setIsViewMode(false);
    setShowInternshipForm(true);
  };

  // View internship details
  const handleViewInternship = (internship: any) => {
    setCurrentInternship(internship);
    setInternshipForm({
      title: internship.title,
      department: internship.department,
      location: internship.location,
      description: internship.description || "",
      requirements: internship.requirements || "",
      workType: internship.workType || "on-site",
      duration: internship.duration || "",
      compensation: internship.compensation || "",
      isPaid: internship.isPaid,
      applicationDeadline: internship.deadline ? new Date(internship.deadline).toISOString().split('T')[0] : "",
    });
    setIsViewMode(true);
    setShowInternshipForm(true);
  };

  // Show delete confirmation dialog
  const confirmDelete = (internship: any) => {
    setInternshipToDelete(internship);
    setShowDeleteDialog(true);
  };

  // Delete an internship
  const handleDeleteInternship = () => {
    if (!internshipToDelete) return;
    
    const updatedInternships = internships.filter(
      internship => internship.id !== internshipToDelete.id
    );
    setInternships(updatedInternships);
    
    toast({
      title: "Internship deleted",
      description: `${internshipToDelete.title} has been deleted.`,
    });
    
    setInternshipToDelete(null);
    setShowDeleteDialog(false);
  };

  // Close form and reset
  const handleCloseForm = () => {
    setInternshipForm({
      title: "",
      department: "",
      location: "",
      description: "",
      requirements: "",
      workType: "on-site",
      duration: "",
      compensation: "",
      isPaid: true,
      applicationDeadline: "",
    });
    setCurrentInternship(null);
    setIsViewMode(false);
    setShowInternshipForm(false);
  };

  // Toggle internship status
  const toggleInternshipStatus = (internship: any) => {
    const newStatus = internship.status === "active" ? "closed" : "active";
    const updatedInternships = internships.map(item => 
      item.id === internship.id ? { ...item, status: newStatus } : item
    );
    setInternships(updatedInternships);
    
    toast({
      title: `Internship ${newStatus}`,
      description: `${internship.title} is now ${newStatus}.`,
    });
  };

  // Update applicant status
  const updateApplicantStatus = (applicationId: string, newStatus: string) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? {...app, status: newStatus as any} : app
    ));
  };

  // View applicant details
  const viewApplicantDetails = (applicationId: string) => {
    const applicant = applications.find(app => app.id === applicationId);
    if (applicant) {
      setCurrentApplicant(applicant);
      setInterviewDate(applicant.interviewDate || "");
      setInterviewTime(applicant.interviewTime || "");
      setApplicantNotes("");
      setFeedbackRating(0);
      setShowApplicantView(true);
    }
  };

  // Save applicant changes
  const saveApplicantChanges = () => {
    if (currentApplicant) {
      setApplications(applications.map(app => 
        app.id === currentApplicant.id 
          ? {...app, 
             status: currentApplicant.status, 
             interviewDate: interviewDate,
             interviewTime: interviewTime,
             // In a real app, we would save notes and rating to the database
            } 
          : app
      ));
      setShowApplicantView(false);
    }
  };

  // Filter applications by status
  const getFilteredApplications = (status: string | null) => {
    if (!status) return applications;
    return applications.filter(application => application.status === status);
  };

  // Get internship by id
  const getInternshipById = (id: number) => {
    return internships.find(internship => internship.id === id);
  };

  // Define the internships state
  const [internships, setInternships] = useState([
    {
      id: 1,
      title: "UX/UI Design Intern",
      department: "Design",
      location: "Paris, France",
      description: "We are looking for a passionate UX/UI Design Intern to join our growing design team. You will work closely with our experienced designers to create beautiful, functional interfaces for our web and mobile platforms.",
      requirements: "Knowledge of design tools like Figma and Adobe XD. Understanding of user-centered design principles. Currently pursuing a degree in Design, HCI, or related field.",
      workType: "on-site",
      duration: "3 months",
      compensation: "€800/month",
      isPaid: true,
      applicants: 8,
      status: "active",
      posted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: "Frontend Developer Intern",
      department: "Engineering",
      location: "Paris, France",
      description: "Join our engineering team as a Frontend Developer Intern. You will be involved in building and improving our user interfaces using React and TypeScript.",
      requirements: "Familiarity with JavaScript, HTML, and CSS. Knowledge of React is a plus. Currently pursuing a degree in Computer Science or related field.",
      workType: "hybrid",
      duration: "6 months",
      compensation: "€950/month",
      isPaid: true,
      applicants: 12,
      status: "active",
      posted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: "Marketing Intern",
      department: "Marketing",
      location: "Remote",
      description: "We're seeking a Marketing Intern to assist our marketing team with social media campaigns, content creation, and market research.",
      requirements: "Strong written and verbal communication skills. Interest in digital marketing. Currently pursuing a degree in Marketing, Communications, or related field.",
      workType: "remote",
      duration: "4 months",
      compensation: "€700/month",
      isPaid: true,
      applicants: 4,
      status: "active",
      posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      title: "Data Analysis Intern",
      department: "Business Intelligence",
      location: "Lyon, France",
      description: "Work with our BI team to analyze user data and provide insights that will help improve our product and business strategies.",
      requirements: "Experience with Excel and basic SQL. Interest in data analysis. Currently pursuing a degree in Statistics, Mathematics, Business, or related field.",
      workType: "on-site",
      duration: "6 months",
      compensation: "€900/month",
      isPaid: true,
      applicants: 0,
      status: "closed",
      posted: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      title: "HR Intern",
      department: "Human Resources",
      location: "Paris, France",
      description: "Join our HR team to assist with recruitment, onboarding, and other HR operations.",
      requirements: "Excellent interpersonal skills. Knowledge of HR practices. Currently pursuing a degree in Human Resources, Business Administration, or related field.",
      workType: "hybrid",
      duration: "3 months",
      compensation: "€750/month",
      isPaid: true,
      applicants: 0,
      status: "closed",
      posted: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  if (!user || user.role !== "employer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
        <p>You must be signed in as an employer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage internships and applications for {companyInfo.name}</p>
        </div>
        <Button 
          onClick={() => {
            setCurrentInternship(null);
            setIsViewMode(false);
            setShowInternshipForm(true);
          }}
          className="gap-2 bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
        >
          <Plus className="h-4 w-4" /> Post New Internship
        </Button>
      </div>

      <div className="flex items-center mb-8 bg-card rounded-xl shadow-sm border">
        <div className="p-6 flex items-center">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden mr-5">
            {companyInfo.logo ? (
              <img src={companyInfo.logo} alt={companyInfo.name} className="w-full h-full object-cover" />
            ) : (
              <BuildingIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{companyInfo.name}</h2>
            <p className="text-muted-foreground text-sm">
              {companyInfo.activeInternships} active internships • {companyInfo.totalPositions} total positions
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center pr-6 gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Application Response Rate</p>
            <p className="text-xl font-semibold text-[#0A77FF]">94%</p>
          </div>
          <div className="h-10 border-l border-border"></div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Average Hiring Time</p>
            <p className="text-xl font-semibold text-[#0A77FF]">9 days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Total Internships</p>
                <h3 className="text-2xl font-bold">{stats.totalInternships}</h3>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {stats.activeInternships} Active
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-[#0A77FF]/10 text-[#0A77FF] rounded-full">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Applications</p>
                <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="h-3 w-3 mr-1" /> 
                  +5 this week
                </p>
              </div>
              <div className="p-3 bg-[#0A77FF]/10 text-[#0A77FF] rounded-full">
                <UsersIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Interviews</p>
                <h3 className="text-2xl font-bold">{stats.interviewingApplications}</h3>
                <p className="text-xs text-neutral-500 flex items-center mt-1">
                  Next in 2 days
                </p>
              </div>
              <div className="p-3 bg-[#0A77FF]/10 text-[#0A77FF] rounded-full">
                <CalendarIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Pending Review</p>
                <h3 className="text-2xl font-bold">{stats.pendingApplications}</h3>
                <p className="text-xs text-amber-600 flex items-center mt-1">
                  Requires attention
                </p>
              </div>
              <div className="p-3 bg-[#0A77FF]/10 text-[#0A77FF] rounded-full">
                <ClockIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="bg-background rounded-lg border p-1">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 h-auto">
            <TabsTrigger 
              value="overview" 
              className={cn(
                "rounded text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                "py-2"
              )}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="internships" 
              className={cn(
                "rounded text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                "py-2"
              )}
            >
              Internships
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className={cn(
                "rounded text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
                "py-2"
              )}
            >
              Applications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recent Applications</CardTitle>
                  <Button variant="outline" size="sm" className="h-8 gap-1 text-[#0A77FF] border-[#0A77FF] hover:bg-[#0A77FF]/5">
                    View All <ChevronDownIcon className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredApplications("all").slice(0, 3).map((application: Application) => (
                    <div 
                      key={application.id} 
                      className="flex items-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => viewApplicantDetails(application.id)}
                    >
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage 
                          src={application.applicantPhoto} 
                          alt={application.applicantName} 
                        />
                        <AvatarFallback className="bg-[#0A77FF]/10 text-[#0A77FF]">
                          {application.applicantName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{application.applicantName}</h3>
                            <p className="text-sm text-muted-foreground">{application.internshipTitle}</p>
                          </div>
                          <Badge 
                            className={
                              application.status === "pending" ? "bg-amber-100 text-amber-700" :
                              application.status === "interview" ? "bg-[#0A77FF]/10 text-[#0A77FF]" :
                              application.status === "accepted" ? "bg-green-100 text-green-700" :
                              "bg-red-100 text-red-700"
                            }
                          >
                            {application.status === "pending" ? "Pending Review" :
                             application.status === "interview" ? "Interview Scheduled" :
                             application.status === "accepted" ? "Accepted" : "Rejected"}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>Applied {formatRelativeTime(application.appliedAt)}</span>
                          {application.interviewDate && (
                            <span>Interview: {application.interviewDate} at {application.interviewTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Pending</span>
                      <span className="text-[#0A77FF] font-medium">{stats.pendingApplications}</span>
                    </div>
                    <div className="h-2 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${(stats.pendingApplications / stats.totalApplications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Interviews</span>
                      <span className="text-[#0A77FF] font-medium">{stats.interviewingApplications}</span>
                    </div>
                    <div className="h-2 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0A77FF] rounded-full" 
                        style={{ width: `${(stats.interviewingApplications / stats.totalApplications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Accepted</span>
                      <span className="text-[#0A77FF] font-medium">{stats.acceptedApplications}</span>
                    </div>
                    <div className="h-2 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(stats.acceptedApplications / stats.totalApplications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Rejected</span>
                      <span className="text-[#0A77FF] font-medium">{stats.rejectedApplications}</span>
                    </div>
                    <div className="h-2 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${(stats.rejectedApplications / stats.totalApplications) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Your Internships</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 gap-1 text-[#0A77FF] border-[#0A77FF] hover:bg-[#0A77FF]/5"
                  onClick={() => setActiveTab("internships")}
                >
                  Manage All <ChevronDownIcon className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {internships.filter(internship => internship.status === "active").map((internship) => (
                  <Card key={internship.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 bg-[#0A77FF]/5">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-medium">{internship.title}</CardTitle>
                        <Badge 
                          className="bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                        >
                          Active
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center mt-1">
                        <MapPinIcon className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {internship.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center text-sm">
                          <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" /> 
                          <span className="text-muted-foreground">
                            {internship.applicants} applicants
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <BriefcaseIcon className="h-4 w-4 mr-2 text-muted-foreground" /> 
                          <span className="text-muted-foreground">
                            {internship.workType.charAt(0).toUpperCase() + internship.workType.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" /> 
                          <span className="text-muted-foreground">
                            Deadline: {new Date(internship.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 gap-1 text-[#0A77FF] border-[#0A77FF] hover:bg-[#0A77FF]/5"
                        onClick={() => handleViewInternship(internship)}
                      >
                        <EyeIcon className="h-4 w-4" /> View
                      </Button>
                      <Button 
                        size="sm"
                        className="h-8 gap-1 bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                        onClick={() => handleEditInternship(internship)}
                      >
                        <PencilIcon className="h-4 w-4" /> Edit
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internships">
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Your Internship Listings</CardTitle>
                    <CardDescription>Manage your current and upcoming internship opportunities</CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setCurrentInternship(null);
                      setIsViewMode(false);
                      setShowInternshipForm(true);
                    }}
                    className="gap-2 bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Listing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {internships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-medium">{internship.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>{internship.department}</span>
                          <span className="mx-2">•</span>
                          <span>{internship.location}</span>
                          {internship.deadline && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="font-semibold">{applications.filter(app => app.internshipId === internship.id).length}</div>
                          <div className="text-xs text-muted-foreground">Applicants</div>
                        </div>
                        <Badge className={
                          internship.status === "active" ? "bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white" :
                          internship.status === "draft" ? "bg-muted text-muted-foreground" :
                          "bg-neutral-200 text-neutral-700"
                        }>
                          {internship.status === "active" ? "Active" : 
                           internship.status === "draft" ? "Draft" : "Closed"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewInternship(internship)} className="h-8 w-8 text-neutral-600 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditInternship(internship)} className="h-8 w-8 text-neutral-600 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleInternshipStatus(internship)}
                            className="h-8 w-8 text-neutral-600 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5"
                          >
                            {internship.status === "active" ? (
                              <XIcon className="h-4 w-4" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => confirmDelete(internship)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {internships.length === 0 && (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No internships yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first internship listing to start attracting candidates.</p>
                    <Button 
                      onClick={() => {
                        setCurrentInternship(null);
                        setIsViewMode(false);
                        setShowInternshipForm(true);
                      }}
                      className="gap-2 bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Listing
                    </Button>
                  </div>
                )}

                {/* Internship Form Dialog */}
                <Dialog open={showInternshipForm} onOpenChange={setShowInternshipForm}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isViewMode ? "Internship Details" : currentInternship ? "Edit Internship" : "Create New Internship"}
                      </DialogTitle>
                      <DialogDescription>
                        {isViewMode 
                          ? "View the details of this internship listing" 
                          : currentInternship
                          ? "Make changes to your existing internship listing"
                          : "Fill in the details to create a new internship opportunity"}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                          <Input 
                            id="title" 
                            name="title" 
                            value={internshipForm.title} 
                            onChange={handleInputChange} 
                            placeholder="e.g., UX/UI Design Intern"
                            disabled={isViewMode}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                          <Input 
                            id="department" 
                            name="department" 
                            value={internshipForm.department} 
                            onChange={handleInputChange} 
                            placeholder="e.g., Design, Engineering, Marketing"
                            disabled={isViewMode}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                          <Input 
                            id="location" 
                            name="location" 
                            value={internshipForm.location} 
                            onChange={handleInputChange} 
                            placeholder="e.g., Paris, France"
                            disabled={isViewMode}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workType">Work Type</Label>
                          <Select 
                            value={internshipForm.workType} 
                            onValueChange={(value) => handleSelectChange("workType", value)}
                            disabled={isViewMode}
                          >
                            <SelectTrigger className="border-input focus-visible:ring-[#0A77FF]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="on-site">On-site</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="duration">Duration</Label>
                          <Input 
                            id="duration" 
                            name="duration" 
                            value={internshipForm.duration} 
                            onChange={handleInputChange} 
                            placeholder="e.g., 3 months, 6 months"
                            disabled={isViewMode}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="compensation">Compensation</Label>
                          <Input 
                            id="compensation" 
                            name="compensation" 
                            value={internshipForm.compensation} 
                            onChange={handleInputChange} 
                            placeholder="e.g., €800/month"
                            disabled={isViewMode}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={internshipForm.description} 
                          onChange={handleInputChange} 
                          placeholder="Describe the internship role and responsibilities"
                          rows={4}
                          disabled={isViewMode}
                          className="border-input focus-visible:ring-[#0A77FF]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea 
                          id="requirements" 
                          name="requirements" 
                          value={internshipForm.requirements} 
                          onChange={handleInputChange} 
                          placeholder="List the skills and qualifications required"
                          rows={4}
                          disabled={isViewMode}
                          className="border-input focus-visible:ring-[#0A77FF]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicationDeadline">Application Deadline</Label>
                        <Input 
                          id="applicationDeadline" 
                          name="applicationDeadline" 
                          type="date" 
                          value={internshipForm.applicationDeadline} 
                          onChange={handleInputChange}
                          disabled={isViewMode}
                          className="border-input focus-visible:ring-[#0A77FF]"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={handleCloseForm}>
                        {isViewMode ? "Close" : "Cancel"}
                      </Button>
                      {!isViewMode && (
                        <Button 
                          type="submit" 
                          onClick={handleCreateInternship}
                          className="bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                        >
                          {currentInternship ? "Save Changes" : "Create Internship"}
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the "{internshipToDelete?.title}" internship listing.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteInternship} className="bg-red-500 hover:bg-red-600">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Internship Applications Overview</CardTitle>
                <CardDescription>Status of applications across all your internship listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {internships
                    .filter(internship => applications.filter(app => app.internshipId === internship.id).length > 0)
                    .map(internship => {
                      const internshipApps = applications.filter(app => app.internshipId === internship.id);
                      return (
                        <div key={internship.id} className="border rounded-lg p-4 hover:border-[#0A77FF]/50 hover:shadow-sm transition-all">
                          <h3 className="font-medium text-sm">{internship.title}</h3>
                          <div className="mt-2 flex items-center">
                            <UsersIcon className="h-4 w-4 text-[#0A77FF] mr-2" />
                            <span className="text-2xl font-bold">{internshipApps.length}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-neutral-100">
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="flex gap-1 items-center">
                                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                <span>{internshipApps.filter(a => a.status === "pending").length} Pending</span>
                              </div>
                              <div className="flex gap-1 items-center">
                                <div className="w-2 h-2 rounded-full bg-[#0A77FF]"></div>
                                <span>{internshipApps.filter(a => a.status === "interview").length} Interview</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {internship.status === "active" ? "Active" : "Closed"} • {internship.location}
                          </p>
                        </div>
                      );
                    })}
                    
                  {internships.filter(internship => applications.filter(app => app.internshipId === internship.id).length > 0).length === 0 && (
                    <div className="col-span-4 text-center py-8">
                      <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-muted-foreground">No applications received yet for your internship listings.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">All Applications</CardTitle>
                    <CardDescription>Review and manage incoming applications</CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search applications..." 
                        className="pl-9 w-[240px] border-input focus-visible:ring-[#0A77FF]"
                      />
                    </div>
                    <div className="relative">
                      <Tabs value={applicantStatusFilter} onValueChange={setApplicantStatusFilter} className="w-[400px]">
                        <TabsList className="bg-muted/50 p-1 h-auto">
                          <TabsTrigger 
                            value="all" 
                            className={cn(
                              "rounded text-sm data-[state=active]:bg-[#0A77FF] data-[state=active]:text-white",
                              "py-1.5 px-3"
                            )}
                          >
                            All
                          </TabsTrigger>
                          <TabsTrigger 
                            value="pending" 
                            className={cn(
                              "rounded text-sm data-[state=active]:bg-[#0A77FF] data-[state=active]:text-white",
                              "py-1.5 px-3"
                            )}
                          >
                            Pending
                          </TabsTrigger>
                          <TabsTrigger 
                            value="interview" 
                            className={cn(
                              "rounded text-sm data-[state=active]:bg-[#0A77FF] data-[state=active]:text-white",
                              "py-1.5 px-3"
                            )}
                          >
                            Interview
                          </TabsTrigger>
                          <TabsTrigger 
                            value="accepted" 
                            className={cn(
                              "rounded text-sm data-[state=active]:bg-[#0A77FF] data-[state=active]:text-white",
                              "py-1.5 px-3"
                            )}
                          >
                            Accepted
                          </TabsTrigger>
                          <TabsTrigger 
                            value="rejected" 
                            className={cn(
                              "rounded text-sm data-[state=active]:bg-[#0A77FF] data-[state=active]:text-white",
                              "py-1.5 px-3"
                            )}
                          >
                            Rejected
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications
                    .filter(application => applicantStatusFilter === "all" || application.status === applicantStatusFilter)
                    .map((application) => (
                    <div 
                      key={application.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => viewApplicantDetails(application.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage 
                            src={application.applicantPhoto} 
                            alt={application.applicantName} 
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {application.applicantName.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{application.applicantName}</h4>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">{application.internshipTitle}</p>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{application.university}</p>
                          </div>
                          {application.status === "interview" && application.interviewDate && (
                            <div className="mt-1 inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Interview: {new Date(application.interviewDate).toLocaleDateString()} at {application.interviewTime}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {formatRelativeTime(application.appliedAt)}
                        </div>
                        <Badge className={
                          application.status === "pending" ? "bg-amber-100 text-amber-700" :
                          application.status === "interview" ? "bg-primary/10 text-primary" :
                          application.status === "accepted" ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        }>
                          {application.status === "pending" ? "Pending Review" :
                          application.status === "interview" ? "Interview" :
                          application.status === "accepted" ? "Accepted" : "Rejected"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1 text-primary border-primary hover:bg-primary/5"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {applications.filter(app => applicantStatusFilter === "all" || app.status === applicantStatusFilter).length === 0 && (
                    <div className="text-center py-12">
                      <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No applications found</h3>
                      <p className="text-muted-foreground">
                        {applicantStatusFilter !== "all" 
                          ? `No applications with status "${applicantStatusFilter}" found.` 
                          : "Applications will appear here once candidates apply to your internships."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Applicant Details Dialog */}
            <Dialog open={showApplicantView} onOpenChange={setShowApplicantView}>
              <DialogContent className="sm:max-w-[700px]">
                {currentApplicant && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img src={currentApplicant.applicantPhoto} alt={currentApplicant.applicantName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          {currentApplicant.applicantName}
                          <Badge 
                            variant={
                              currentApplicant.status === "pending" ? "secondary" :
                              currentApplicant.status === "interview" ? "default" :
                              currentApplicant.status === "accepted" ? "default" :
                              "outline"
                            }
                            className={
                              currentApplicant.status === "pending" ? "ml-2" :
                              currentApplicant.status === "interview" ? "bg-primary text-primary-foreground ml-2" :
                              currentApplicant.status === "accepted" ? "bg-green-600 hover:bg-green-700 text-white ml-2" :
                              "bg-red-100 text-red-700 ml-2"
                            }
                          >
                            {currentApplicant.status === "pending" ? "Pending Review" :
                              currentApplicant.status === "interview" ? "Interview" :
                              currentApplicant.status === "accepted" ? "Accepted" : "Rejected"}
                          </Badge>
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        Application for {currentApplicant.internshipTitle} • Applied {formatRelativeTime(currentApplicant.appliedAt)}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Applicant Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex">
                            <span className="w-20 text-muted-foreground">University:</span>
                            <span>{currentApplicant.university}</span>
                          </div>
                          <div className="flex">
                            <span className="w-20 text-muted-foreground">Email:</span>
                            <span>{currentApplicant.email}</span>
                          </div>
                          <div className="flex">
                            <span className="w-20 text-muted-foreground">Phone:</span>
                            <span>{currentApplicant.phone}</span>
                          </div>
                          {currentApplicant.portfolio && (
                            <div className="flex">
                              <span className="w-20 text-muted-foreground">Portfolio:</span>
                              <a href={currentApplicant.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#0A77FF] hover:underline">
                                View Portfolio
                              </a>
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-medium mt-4 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-1">
                          {currentApplicant.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-[#0A77FF]/5 text-[#0A77FF] border-[#0A77FF]/20">{skill}</Badge>
                          ))}
                        </div>

                        <h3 className="text-sm font-medium mt-4 mb-2">Cover Letter</h3>
                        <div className="bg-muted/50 p-3 rounded-md text-sm max-h-[150px] overflow-y-auto">
                          {currentApplicant.coverLetter}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Interview Schedule</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor="interviewDate">Date</Label>
                            <Input 
                              id="interviewDate"
                              type="date"
                              value={interviewDate}
                              onChange={(e) => setInterviewDate(e.target.value)}
                              className="border-input focus-visible:ring-[#0A77FF]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interviewTime">Time</Label>
                            <Input 
                              id="interviewTime"
                              type="time"
                              value={interviewTime}
                              onChange={(e) => setInterviewTime(e.target.value)}
                              className="border-input focus-visible:ring-[#0A77FF]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <Label htmlFor="feedback">Feedback & Notes</Label>
                          <Textarea 
                            id="feedback"
                            placeholder="Add your notes about this candidate..."
                            rows={5}
                            value={applicantNotes}
                            onChange={(e) => setApplicantNotes(e.target.value)}
                            className="border-input focus-visible:ring-[#0A77FF]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={`text-2xl ${feedbackRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setFeedbackRating(star)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <h3 className="text-sm font-medium mb-2">Application Status</h3>
                          <Select 
                            defaultValue={currentApplicant.status}
                            onValueChange={(value: "pending" | "interview" | "accepted" | "rejected") => {
                              updateApplicantStatus(currentApplicant.id, value);
                              setCurrentApplicant({...currentApplicant, status: value});
                            }}
                          >
                            <SelectTrigger className="w-full border-input focus-visible:ring-primary">
                              <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending Review</SelectItem>
                              <SelectItem value="interview">Schedule Interview</SelectItem>
                              <SelectItem value="accepted">Accept Candidate</SelectItem>
                              <SelectItem value="rejected">Reject Candidate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowApplicantView(false)}>Cancel</Button>
                      <Button 
                        onClick={saveApplicantChanges}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Applications by Internship</CardTitle>
                <CardDescription>Overview of applications for each internship position</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {internships.map(internship => {
                    const internshipApplications = applications.filter(app => app.internshipId === internship.id);
                    const pendingCount = internshipApplications.filter(app => app.status === 'pending').length;
                    const interviewCount = internshipApplications.filter(app => app.status === 'interview').length;
                    const acceptedCount = internshipApplications.filter(app => app.status === 'accepted').length;
                    const rejectedCount = internshipApplications.filter(app => app.status === 'rejected').length;
                    
                    if (internshipApplications.length === 0) return null;
                    
                    return (
                      <Card key={internship.id} className="border">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{internship.title}</CardTitle>
                          <CardDescription className="text-xs">{internship.department} • {internship.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Applications</span>
                              <span className="text-[#0A77FF] font-medium">{internshipApplications.length}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                              <div className="flex h-full">
                                <div 
                                  className="bg-amber-500 h-full" 
                                  style={{ width: `${(pendingCount / internshipApplications.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-[#0A77FF] h-full" 
                                  style={{ width: `${(interviewCount / internshipApplications.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-green-500 h-full" 
                                  style={{ width: `${(acceptedCount / internshipApplications.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-red-500 h-full" 
                                  style={{ width: `${(rejectedCount / internshipApplications.length) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="bg-muted p-2 rounded text-center">
                                <div className="text-amber-500 font-medium">{pendingCount}</div>
                                <div className="text-xs text-muted-foreground">Pending</div>
                              </div>
                              <div className="bg-muted p-2 rounded text-center">
                                <div className="text-[#0A77FF] font-medium">{interviewCount}</div>
                                <div className="text-xs text-muted-foreground">Interview</div>
                              </div>
                              <div className="bg-muted p-2 rounded text-center">
                                <div className="text-green-500 font-medium">{acceptedCount}</div>
                                <div className="text-xs text-muted-foreground">Accepted</div>
                              </div>
                              <div className="bg-muted p-2 rounded text-center">
                                <div className="text-red-500 font-medium">{rejectedCount}</div>
                                <div className="text-xs text-muted-foreground">Rejected</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Key Metrics</CardTitle>
                <CardDescription>Performance indicators for your recruiting process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Interview Rate</div>
                    <div className="text-2xl font-bold">
                      {Math.round((stats.interviewingApplications / stats.totalApplications) * 100)}%
                    </div>
                    <div className="text-xs text-green-600 mt-1">↑ 4% from last month</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Time to Response</div>
                    <div className="text-2xl font-bold">2.3 days</div>
                    <div className="text-xs text-green-600 mt-1">↓ 1.2 days from last month</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Acceptance Rate</div>
                    <div className="text-2xl font-bold">
                      {Math.round((stats.acceptedApplications / stats.interviewingApplications) * 100)}%
                    </div>
                    <div className="text-xs text-green-600 mt-1">↑ 8% from last month</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Average Rating</div>
                    <div className="text-2xl font-bold">4.2</div>
                    <div className="flex text-yellow-400 mt-1">
                      {"★".repeat(4)}{"☆".repeat(1)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}