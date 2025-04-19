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
  BuildingIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const [currentApplicant, setCurrentApplicant] = useState<any>(null);
  const [applicantNotes, setApplicantNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  
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

  // Define application type
  type Application = {
    id: number;
    internshipId: number;
    internshipTitle: string;
    applicantName: string;
    applicantPhoto: string;
    university: string;
    email: string;
    phone: string;
    coverLetter: string;
    skills: string[];
    portfolio: string;
    status: string;
    interviewDate: string | null;
    interviewTime: string | null;
    feedback: string;
    rating: number;
    notes: string;
    appliedAt: string;
  };

  // Static recent applications with expanded data
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 1,
      internshipId: 1,
      internshipTitle: "UX/UI Design Intern",
      applicantName: "Emma Davis",
      applicantPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      university: "Paris Design Academy",
      email: "emma.davis@example.com",
      phone: "+33 6 12 34 56 78",
      coverLetter: "I am excited to apply for the UX/UI Design Intern position at your company. As a design student at Paris Design Academy, I have developed strong skills in user-centered design principles and have experience with industry standard tools like Figma and Adobe XD.",
      skills: ["Figma", "Adobe XD", "UI Design", "Wireframing", "Prototyping"],
      portfolio: "https://emmadavis-portfolio.example.com",
      status: "pending",
      interviewDate: null,
      interviewTime: null,
      feedback: "",
      rating: 0,
      notes: "",
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      internshipId: 2,
      internshipTitle: "Frontend Developer Intern",
      applicantName: "Alex Johnson",
      applicantPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      university: "Lyon Tech Institute",
      email: "alex.johnson@example.com",
      phone: "+33 6 87 65 43 21",
      coverLetter: "I am writing to express my interest in the Frontend Developer Intern position. I am currently studying Computer Science at Lyon Tech Institute and have been building web applications using React and Next.js for the past two years.",
      skills: ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
      portfolio: "https://ajohnson-dev.example.com",
      status: "interview",
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewTime: "14:30",
      feedback: "",
      rating: 0,
      notes: "Strong React skills, needs to work on TypeScript. Scheduled for first interview.",
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      internshipId: 3,
      internshipTitle: "Marketing Intern",
      applicantName: "Sophia Chen",
      applicantPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      university: "Paris Business School",
      email: "sophia.chen@example.com",
      phone: "+33 6 23 45 67 89",
      coverLetter: "With my background in digital marketing and analytics, I believe I am an excellent candidate for the Marketing Intern position. At Paris Business School, I have specialized in data-driven marketing strategies and have completed several projects analyzing campaign performance.",
      skills: ["Social Media Marketing", "Google Analytics", "Content Creation", "SEO", "Data Analysis"],
      portfolio: "https://sophiachen-marketing.example.com",
      status: "accepted",
      interviewDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewTime: "10:15",
      feedback: "Sophia demonstrated excellent analytical skills and had innovative ideas for improving our marketing campaigns. Her experience with Google Analytics will be particularly valuable.",
      rating: 5,
      notes: "Excellent candidate. Great cultural fit. Accepting with immediate start.",
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      internshipId: 1,
      internshipTitle: "UX/UI Design Intern",
      applicantName: "Thomas Martin",
      applicantPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80", 
      university: "Digital Arts College",
      email: "thomas.martin@example.com",
      phone: "+33 6 98 76 54 32",
      coverLetter: "I am interested in the UX/UI Design Intern position as I am looking to apply my design education in a professional setting. I have completed several UX projects during my studies and am familiar with the design thinking process.",
      skills: ["UI Design", "Sketch", "Adobe Photoshop", "Illustrator"],
      portfolio: "https://tmartin-design.example.com",
      status: "rejected",
      interviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewTime: "11:00",
      feedback: "Thomas has good theoretical knowledge but lacks practical experience with modern design tools like Figma. Portfolio showed limited UX understanding.",
      rating: 2,
      notes: "Not a good fit at this time. Consider for future opportunities after more experience.",
      appliedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      internshipId: 2,
      internshipTitle: "Frontend Developer Intern",
      applicantName: "Julie Bernard",
      applicantPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      university: "Computer Science Institute",
      email: "julie.bernard@example.com",
      phone: "+33 6 45 67 89 01",
      coverLetter: "As a computer science student with a passion for web development, I am excited about the Frontend Developer Intern role. I have completed several projects using React and am eager to apply my skills in a professional environment.",
      skills: ["JavaScript", "React", "CSS", "Git", "Node.js"],
      portfolio: "https://juliebernard-dev.example.com",
      status: "interview",
      interviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      interviewTime: "16:00",
      feedback: "",
      rating: 0,
      notes: "Impressive portfolio. Second round interview scheduled.",
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 6,
      internshipId: 3,
      internshipTitle: "Marketing Intern",
      applicantName: "David Rousseau",
      applicantPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80",
      university: "Marketing Academy",
      email: "david.rousseau@example.com",
      phone: "+33 6 78 90 12 34",
      coverLetter: "I am writing to apply for the Marketing Intern position. My coursework at Marketing Academy has given me a strong foundation in marketing principles, and I have practical experience managing social media campaigns for student organizations.",
      skills: ["Content Marketing", "Social Media", "Email Campaigns", "Market Research"],
      portfolio: "",
      status: "pending",
      interviewDate: null,
      interviewTime: null,
      feedback: "",
      rating: 0,
      notes: "",
      appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ].map((app) => ({
    ...app,
    interviewDate: app.interviewDate || null,
    interviewTime: app.interviewTime || null,
    portfolio: app.portfolio || "",
    feedback: app.feedback || "",
    notes: app.notes || "",
    rating: app.rating || 0
  })));

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
  const updateApplicantStatus = (applicantId: number, newStatus: string) => {
    const updatedApplications = applications.map(application => {
      if (application.id === applicantId) {
        return {
          ...application,
          status: newStatus,
          // If status is changed to interview, set a default date 3 days from now
          interviewDate: newStatus === "interview" && !application.interviewDate 
            ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : application.interviewDate,
          interviewTime: newStatus === "interview" && !application.interviewTime
            ? "14:00"
            : application.interviewTime
        };
      }
      return application;
    });
    
    setApplications(updatedApplications);
    
    const statusMessages = {
      pending: "Application marked as pending",
      interview: "Candidate moved to interview stage",
      accepted: "Candidate has been accepted",
      rejected: "Candidate has been rejected"
    };
    
    toast({
      title: statusMessages[newStatus as keyof typeof statusMessages] || "Status updated",
      description: "The applicant has been notified of the status change",
    });
  };

  // View applicant details
  const viewApplicantDetails = (applicantId: number) => {
    const applicant = applications.find(app => app.id === applicantId);
    if (applicant) {
      setCurrentApplicant(applicant);
      setApplicantNotes(applicant.notes || "");
      setInterviewDate(applicant.interviewDate || "");
      setInterviewTime(applicant.interviewTime || "");
      setFeedbackRating(applicant.rating || 0);
      setShowApplicantView(true);
    }
  };

  // Save applicant changes
  const saveApplicantChanges = () => {
    if (!currentApplicant) return;
    
    const updatedApplications = applications.map(application => {
      if (application.id === currentApplicant.id) {
        return {
          ...application,
          notes: applicantNotes,
          interviewDate: interviewDate,
          interviewTime: interviewTime,
          rating: feedbackRating,
          feedback: application.feedback // Keep existing feedback
        };
      }
      return application;
    });
    
    setApplications(updatedApplications);
    
    toast({
      title: "Applicant updated",
      description: "The applicant information has been updated successfully",
    });
    
    setShowApplicantView(false);
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
        <h1 className="text-2xl font-bold mb-4">Employer Dashboard</h1>
        <p>You must be signed in as an employer to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Employer Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Manage your internship listings, applications, and company profile.
      </p>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="w-full justify-start border-b pb-0">
          <TabsTrigger value="overview" className="rounded-b-none">Overview</TabsTrigger>
          <TabsTrigger value="internships" className="rounded-b-none">Manage Internships</TabsTrigger>
          <TabsTrigger value="applicants" className="rounded-b-none">Applicants</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-b-none">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Internships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.activeInternships}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BriefcaseIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.activeInternships} of {stats.totalInternships} total
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <UsersIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across all internship positions
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <GraduationCapIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Awaiting your review
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accepted Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <CheckCircleIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Positions filled successfully
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest candidates applying to your internships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img src={application.applicantPhoto} alt={application.applicantName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{application.applicantName}</h4>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">{application.internshipTitle}</p>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{application.university}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        <Badge 
                          variant={
                            application.status === "accepted" ? "default" :
                            application.status === "rejected" ? "destructive" :
                            application.status === "interview" ? "secondary" : 
                            "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Recent application volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <div className="flex h-[170px] items-end gap-1 pt-2">
                    {applicationTimelineData.map((count, i) => {
                      const height = Math.max(15, (count / Math.max(...applicationTimelineData)) * 100);
                      return (
                        <div key={i} className="relative flex flex-1 flex-col items-center">
                          <div 
                            className="w-full bg-primary/90 rounded-t" 
                            style={{ height: `${height}%` }}
                          />
                          <span className="absolute -bottom-5 text-xs text-muted-foreground">
                            {new Date(2023, i).toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="internships">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Internship Listings</CardTitle>
                    <CardDescription>Manage your current and upcoming internship opportunities</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setCurrentInternship(null);
                    setIsViewMode(false);
                    setShowInternshipForm(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Listing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {internships.map((internship) => (
                    <div key={internship.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
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
                        <Badge variant={
                          internship.status === "active" ? "default" :
                          internship.status === "draft" ? "outline" :
                          "secondary"
                        }>
                          {internship.status === "active" ? "Active" : 
                           internship.status === "draft" ? "Draft" : "Closed"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewInternship(internship)}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditInternship(internship)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleInternshipStatus(internship)}
                          >
                            {internship.status === "active" ? (
                              <XIcon className="h-4 w-4" />
                            ) : (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(internship)}>
                            <TrashIcon className="h-4 w-4 text-red-500" />
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
                    <Button onClick={() => {
                      setCurrentInternship(null);
                      setIsViewMode(false);
                      setShowInternshipForm(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
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
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workType">Work Type</Label>
                          <Select 
                            value={internshipForm.workType} 
                            onValueChange={(value) => handleSelectChange("workType", value)}
                            disabled={isViewMode}
                          >
                            <SelectTrigger>
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
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={handleCloseForm}>
                        {isViewMode ? "Close" : "Cancel"}
                      </Button>
                      {!isViewMode && (
                        <Button type="submit" onClick={handleCreateInternship}>
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

            <Card>
              <CardHeader>
                <CardTitle>Internship Applications Overview</CardTitle>
                <CardDescription>Status of applications across all your internship listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {internships
                    .filter(internship => applications.filter(app => app.internshipId === internship.id).length > 0)
                    .map(internship => (
                      <div key={internship.id} className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm">{internship.title}</h3>
                        <div className="mt-2 flex items-center">
                          <UsersIcon className="h-4 w-4 text-primary mr-2" />
                          <span className="text-2xl font-bold">{applications.filter(app => app.internshipId === internship.id).length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {internship.status === "active" ? "Active" : "Closed"} - {internship.location}
                        </p>
                      </div>
                    ))}
                    
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

        <TabsContent value="applicants">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Applications</CardTitle>
                    <CardDescription>Review and manage incoming applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Tabs value={applicantStatusFilter} onValueChange={setApplicantStatusFilter} className="w-[400px]">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="interview">Interview</TabsTrigger>
                        <TabsTrigger value="accepted">Accepted</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications
                    .filter(application => applicantStatusFilter === "all" || application.status === applicantStatusFilter)
                    .map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                          <img src={application.applicantPhoto} alt={application.applicantName} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium">{application.applicantName}</h4>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">{application.internshipTitle}</p>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{application.university}</p>
                          </div>
                          {application.status === "interview" && application.interviewDate && (
                            <div className="mt-1 inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              Interview: {new Date(application.interviewDate).toLocaleDateString()} at {application.interviewTime}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 inline mr-1" />
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                        <Badge 
                          variant={
                            application.status === "accepted" ? "default" :
                            application.status === "rejected" ? "destructive" :
                            application.status === "interview" ? "secondary" : 
                            "outline"
                          }
                        >
                          {application.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewApplicantDetails(application.id)}>
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
                              currentApplicant.status === "accepted" ? "default" :
                              currentApplicant.status === "rejected" ? "destructive" :
                              currentApplicant.status === "interview" ? "secondary" : 
                              "outline"
                            }
                            className="ml-2"
                          >
                            {currentApplicant.status}
                          </Badge>
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        Application for {currentApplicant.internshipTitle} • Applied {new Date(currentApplicant.appliedAt).toLocaleDateString()}
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
                              <a href={currentApplicant.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                View Portfolio
                              </a>
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-medium mt-4 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-1">
                          {currentApplicant.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>

                        <h3 className="text-sm font-medium mt-4 mb-2">Cover Letter</h3>
                        <div className="bg-neutral-50 p-3 rounded-md text-sm max-h-[150px] overflow-y-auto">
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
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="interviewTime">Time</Label>
                            <Input 
                              id="interviewTime"
                              type="time"
                              value={interviewTime}
                              onChange={(e) => setInterviewTime(e.target.value)}
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
                            onValueChange={(value) => {
                              updateApplicantStatus(currentApplicant.id, value);
                              setCurrentApplicant({...currentApplicant, status: value});
                            }}
                          >
                            <SelectTrigger>
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
                      <Button onClick={saveApplicantChanges}>Save Changes</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Applications by Internship</CardTitle>
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
                    
                    return (
                      <Card key={internship.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{internship.title}</CardTitle>
                          <CardDescription className="text-xs">{internship.department} • {internship.location}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Applications</span>
                              <span className="font-medium">{internshipApplications.length}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="bg-neutral-50 p-2 rounded text-center">
                                <div className="text-amber-500 font-medium">{pendingCount}</div>
                                <div className="text-xs text-muted-foreground">Pending</div>
                              </div>
                              <div className="bg-neutral-50 p-2 rounded text-center">
                                <div className="text-blue-500 font-medium">{interviewCount}</div>
                                <div className="text-xs text-muted-foreground">Interview</div>
                              </div>
                              <div className="bg-neutral-50 p-2 rounded text-center">
                                <div className="text-green-500 font-medium">{acceptedCount}</div>
                                <div className="text-xs text-muted-foreground">Accepted</div>
                              </div>
                              <div className="bg-neutral-50 p-2 rounded text-center">
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
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Distribution of your applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Pending</span>
                        <span className="font-medium">{stats.pendingApplications}</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${(stats.pendingApplications / stats.totalApplications) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>In Progress</span>
                        <span className="font-medium">{stats.interviewingApplications}</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(stats.interviewingApplications / stats.totalApplications) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Accepted</span>
                        <span className="font-medium">{stats.acceptedApplications}</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${(stats.acceptedApplications / stats.totalApplications) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Rejected</span>
                        <span className="font-medium">{stats.rejectedApplications}</span>
                      </div>
                      <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${(stats.rejectedApplications / stats.totalApplications) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Timeline</CardTitle>
                  <CardDescription>Applications received over time</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-[200px] w-full">
                    <div className="flex h-[170px] items-end gap-1 pt-6">
                      {applicationTimelineData.map((count, i) => {
                        const height = Math.max(15, (count / Math.max(...applicationTimelineData)) * 100);
                        return (
                          <div key={i} className="relative flex flex-1 flex-col items-center">
                            <div 
                              className="w-full bg-primary/90 rounded-t" 
                              style={{ height: `${height}%` }}
                            />
                            <span className="absolute -bottom-5 text-xs text-muted-foreground">
                              {new Date(2023, i).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="absolute -top-5 text-xs font-medium">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recruiting Efficiency</CardTitle>
                <CardDescription>Key metrics for your hiring process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Time to Fill</div>
                    <div className="text-2xl font-bold">14.3 days</div>
                    <div className="text-xs text-green-600 mt-1">↓ 12% from last month</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Cost per Hire</div>
                    <div className="text-2xl font-bold">€250</div>
                    <div className="text-xs text-green-600 mt-1">↓ 8% from last month</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Application Quality</div>
                    <div className="text-2xl font-bold">72%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 5% from last month</div>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Response Rate</div>
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-xs text-green-600 mt-1">↑ 3% from last month</div>
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