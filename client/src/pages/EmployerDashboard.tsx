import { useState, useEffect } from "react";
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
  PieChartIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
  UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { internshipApi, applicationApi } from "@/services/api";

// Define internship type based on API response
type Internship = {
  id: number;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string;
  workType: string;
  duration: string;
  compensation: string;
  isPaid: boolean;
  applicants: number;
  status: string;
  posted: string;
  deadline: string;
  company?: {
    id: number;
    name: string;
    logo: string;
  };
};

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
  feedback?: string;
  // New fields for detailed applicant information
  applicant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photo: string;
    location: string;
    title: string;
    university: string;
    about: string;
    website: string;
    educationCount?: number;
    experienceCount?: number;
    certificationsCount?: number;
  };
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
  const [interviewDate, setInterviewDate] = useState<string>("");
  const [interviewTime, setInterviewTime] = useState<string>("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>("all");
  
  // API fetch management
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  
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

  // Define the internships state
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoadingInternships, setIsLoadingInternships] = useState(false);
  const [internshipError, setInternshipError] = useState<string | null>(null);

  // Real application state from API
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsByInternship, setApplicationsByInternship] = useState<{ [key: string]: Application[] }>({});

  // Application timeline data - applications per month
  const applicationTimelineData = [4, 6, 3, 7, 8, 12, 11, 9, 14, 17, 13, 15];

  // State to track expanded internships
  const [expandedInternships, setExpandedInternships] = useState<{ [key: string]: boolean }>({});

  // Toggle expansion state for an internship
  const toggleExpanded = (internshipId: number) => {
    setExpandedInternships(prev => ({
      ...prev,
      [internshipId.toString()]: !prev[internshipId.toString()]
    }));
  };

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

  // Fetch applications for all internships
  useEffect(() => {
    if (internships.length > 0) {
      fetchApplicationsForInternships();
    }
  }, [internships]);

  // Helper function to fetch applications
  const fetchApplicationsForInternships = async () => {
    if (!user || !user.company_id) return;
    
    setIsLoadingApplications(true);
    setApplicationError(null);
    
    try {
      // Create a map of internshipId to applications
      const appsByInternship: { [key: string]: Application[] } = {};
      let allApplications: Application[] = [];
      
      // For each internship, fetch its applications
      for (const internship of internships) {
        try {
          // Convert the internship.id to string for API call
          const internshipId = internship.id.toString();
          const response = await applicationApi.getApplications(internshipId);
          
          // Map the API response to our Application type
          const mappedApplications = response.content.map((app: any) => ({
            id: app.id.toString(),
            internshipId: internshipId,
            internshipTitle: internship.title,
            applicantName: app.applicantName || "Applicant",
            applicantPhoto: app.applicantPhoto || "https://randomuser.me/api/portraits/lego/1.jpg",
            university: app.applicant?.university || "Unknown University",
            email: app.applicantEmail || app.applicant?.email || "applicant@example.com",
            phone: app.applicantPhoneNumber || app.applicant?.phone || "N/A",
            portfolio: app.applicant?.website || undefined,
            skills: app.applicant?.skills || [],
            coverLetter: app.coverLetter || "No cover letter provided",
            // Convert API status to our format (pending, interview, accepted, rejected)
            status: app.status?.toLowerCase() === "pending" ? "pending" :
                   app.status?.toLowerCase() === "interview_scheduled" ? "interview" :
                   app.status?.toLowerCase() === "accepted" ? "accepted" : 
                   app.status?.toLowerCase() === "rejected" ? "rejected" : "pending",
            appliedAt: app.createdAt || new Date().toISOString(),
            interviewDate: app.interviewDate,
            interviewTime: app.interviewTime,
            // Add the full applicant details if available
            applicant: app.applicant
          })) as Application[];
          
          appsByInternship[internshipId] = mappedApplications;
          allApplications = [...allApplications, ...mappedApplications];
        } catch (error) {
          console.error(`Error fetching applications for internship ${internship.id}:`, error);
          // Continue with other internships even if one fails
        }
      }
      
      setApplicationsByInternship(appsByInternship);
      setApplications(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationError("Failed to fetch applications");
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Add a state to track when we need to refresh applications
  const [refreshApplications, setRefreshApplications] = useState(false);

  // Refresh applications when needed
  useEffect(() => {
    if (refreshApplications && internships.length > 0) {
      fetchApplicationsForInternships();
      setRefreshApplications(false);
    }
  }, [refreshApplications, internships]);

  // Update applicant status with API call
  const updateApplicantStatus = async (applicationId: string, newStatus: string) => {
    try {
      // Convert our status format to API format
      let apiStatus: string;
      
      // Map frontend status to backend API status values
      switch(newStatus) {
        case "pending": 
          apiStatus = "PENDING";
          break;
        case "interview": 
          apiStatus = "INTERVIEW_SCHEDULED";
          break;
        case "accepted": 
          apiStatus = "ACCEPTED";
          break;
        case "rejected": 
          apiStatus = "REJECTED";
          break;
        default:
          apiStatus = newStatus.toUpperCase();
      }
      
      // For interview status, we might want to add interview date and time
      let interviewDateToSend = "";
      let interviewTimeToSend = "";
      
      if (newStatus === "interview") {
        // Get the application to check if it has existing interview date and time
        const app = applications.find(a => a.id === applicationId);
        
        // Use existing values or set defaults if needed
        interviewDateToSend = app?.interviewDate || new Date().toISOString().split('T')[0]; // Today's date as default
        interviewTimeToSend = app?.interviewTime || "09:00"; // Default time
      }
      
      console.log(`Updating application ${applicationId} status to: ${apiStatus}`);
      console.log(`With interview details - Date: ${interviewDateToSend}, Time: ${interviewTimeToSend}`);
      
      const result = await applicationApi.updateApplicationStatus(
        applicationId, 
        apiStatus, 
        "",  // No feedback
        newStatus === "interview" ? interviewDateToSend : undefined,
        newStatus === "interview" ? interviewTimeToSend : undefined
      );
      console.log("API response:", result);
      
      // Update local state after successful API call
      setApplications(applications.map(app => 
        app.id === applicationId ? {
          ...app, 
          status: newStatus as any,
          ...(newStatus === "interview" && {
            interviewDate: interviewDateToSend,
            interviewTime: interviewTimeToSend
          })
        } : app
      ));
      
      // Mark applications for refresh to get latest data from backend
      setRefreshApplications(true);
        
      toast({
        title: "Status updated",
        description: `Application status has been changed to ${newStatus} (API: ${apiStatus})`,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  // Set applicant being viewed and initialize form data
  const viewApplicantDetails = (applicant: Application) => {
    setCurrentApplicant(applicant);
    // Use optional chaining to safely access feedback which may not be properly typed
    setApplicantNotes(applicant?.feedback || "");
    // Initialize interview date/time if they exist, or set defaults
    setInterviewDate(applicant.interviewDate || new Date().toISOString().split('T')[0]);
    setInterviewTime(applicant.interviewTime || "09:00");
    setShowApplicantView(true);
  };

  // Function to view the full applicant profile in a new tab
  const viewApplicantProfile = (applicantId: number) => {
    window.open(`/candidates/${applicantId}`, '_blank');
  };

  // Save applicant changes
  const saveApplicantChanges = async () => {
    if (!currentApplicant) return;
    
    try {
      // Update status in API if a status is set
      if (currentApplicant.status) {
        // Map frontend status to backend API status values
        let apiStatus: string;
        
        switch(currentApplicant.status) {
          case "pending": 
            apiStatus = "PENDING";
            break;
          case "interview": 
            apiStatus = "INTERVIEW_SCHEDULED";
            break;
          case "accepted": 
            apiStatus = "ACCEPTED";
            break;
          case "rejected": 
            apiStatus = "REJECTED";
            break;
          default:
            apiStatus = "PENDING"; // Default to pending if unknown status
        }
        
        console.log(`Saving application ${currentApplicant.id} with status: ${apiStatus}`);
        console.log(`Interview details - Date: ${interviewDate}, Time: ${interviewTime}`);
        
        const result = await applicationApi.updateApplicationStatus(
          currentApplicant.id, 
          apiStatus, 
          applicantNotes, // Pass notes as feedback
          interviewDate,  // Pass interview date 
          interviewTime   // Pass interview time
        );
        console.log("Save application response:", result);
      }
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === currentApplicant.id 
          ? {...app, 
             status: currentApplicant.status, 
             interviewDate: interviewDate,
             interviewTime: interviewTime,
            } 
          : app
      ));
      
      // Mark applications for refresh to get latest data from backend
      setRefreshApplications(true);
      
      toast({
        title: "Changes saved",
        description: `Applicant status set to: ${currentApplicant.status}`,
      });
      
      setShowApplicantView(false);
    } catch (error) {
      console.error("Error saving applicant changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  // Filter applications by status
  const getFilteredApplications = (statusFilter: string | null) => {
    if (!statusFilter || statusFilter === "all") return applications;
    return applications.filter(application => application.status === statusFilter);
  };

  // Get applications for a specific internship
  const getApplicationsForInternship = (internshipId: number) => {
    return applicationsByInternship[internshipId.toString()] || [];
  };

  // Get internship by id
  const getInternshipById = (id: number) => {
    return internships.find(internship => internship.id === id);
  };

  // Fetch internships for the company
  useEffect(() => {
    const fetchInternships = async () => {
      if (!user || !user.company_id) return;
      
      setIsLoadingInternships(true);
      setInternshipError(null);
      
      try {
        console.log("user.company_id ", user.company_id);
        const response = await internshipApi.getInternships(user.company_id.toString());
        
        if (response && response.content) {
          // Map API response to our local type
          const mappedInternships = response.content.map((item: any) => ({
            id: item.id,
            title: item.title || "Untitled Internship",
            department: item.department || "General",
            location: item.location || "Remote",
            description: item.description || "",
            requirements: item.requirements || "",
            workType: item.workType || "on-site",
            duration: item.duration || "",
            compensation: item.compensation || "",
            isPaid: item.isPaid !== undefined ? item.isPaid : true,
            applicants: item.applicantsCount || 0,
            status: item.status || "active",
            posted: item.postedDate || new Date().toISOString(),
            deadline: item.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            company: item.company
          }));
          
          setInternships(mappedInternships);
          
          // Update stats with actual data
          const activeCount = mappedInternships.filter((i) => i.status === "active").length;
          // We could update the stats here if we want to display real numbers
        }
      } catch (error) {
        console.error("Error fetching internships:", error);
        setInternshipError("Failed to fetch internships");
        toast({
          title: "Error",
          description: "Failed to fetch internships. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInternships(false);
      }
    };
    
    fetchInternships();
  }, [user]);

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
                      onClick={() => viewApplicantDetails(application)}
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
              <div className="space-y-4">
                {isLoadingInternships ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4 animate-pulse" />
                    <h3 className="text-lg font-medium mb-2">Loading internships...</h3>
                    <p className="text-muted-foreground">Please wait while we fetch your internship listings.</p>
                  </div>
                ) : internshipError ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading internships</h3>
                    <p className="text-muted-foreground mb-4">{internshipError}</p>
                    <Button 
                      onClick={() => {
                        // Retry loading internships
                        const fetchInternships = async () => {
                          if (!user || !user.company_id) return;
                          
                          setIsLoadingInternships(true);
                          setInternshipError(null);
                          
                          try {
                            const response = await internshipApi.getInternships(user.company_id.toString());
                            
                            if (response && response.content) {
                              // Map API response to our local type
                              const mappedInternships = response.content.map((item: any) => ({
                                id: item.id,
                                title: item.title || "Untitled Internship",
                                department: item.department || "General",
                                location: item.location || "Remote",
                                description: item.description || "",
                                requirements: item.requirements || "",
                                workType: item.workType || "on-site",
                                duration: item.duration || "",
                                compensation: item.compensation || "",
                                isPaid: item.isPaid !== undefined ? item.isPaid : true,
                                applicants: item.applicantsCount || 0,
                                status: item.status || "active",
                                posted: item.postedDate || new Date().toISOString(),
                                deadline: item.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                                company: item.company
                              }));
                              
                              setInternships(mappedInternships);
                              
                              // Update stats with actual data
                              const activeCount = mappedInternships.filter((i) => i.status === "active").length;
                              // We could update the stats here if we want to display real numbers
                            }
                          } catch (error) {
                            console.error("Error fetching internships:", error);
                            setInternshipError("Failed to fetch internships");
                            toast({
                              title: "Error",
                              description: "Failed to fetch internships. Please try again later.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsLoadingInternships(false);
                          }
                        };
                        
                        fetchInternships();
                      }}
                      className="gap-2 bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white"
                    >
                      Retry
                    </Button>
                  </div>
                ) : internships.length === 0 ? (
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
                ) : (
                  internships.map((internship: any) => {
                    const internshipApps = getApplicationsForInternship(internship.id);
                    const isExpanded = expandedInternships[internship.id.toString()] || false;
                    
                    return (
                      <div key={internship.id} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => toggleExpanded(internship.id)}
                        >
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
                              <div className="font-semibold">{internshipApps.length}</div>
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
                              <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleViewInternship(internship)}} className="h-8 w-8 text-neutral-600 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); handleEditInternship(internship)}} className="h-8 w-8 text-neutral-600 hover:text-[#0A77FF] hover:bg-[#0A77FF]/5">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => {e.stopPropagation(); toggleInternshipStatus(internship)}}
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
                                onClick={(e) => {e.stopPropagation(); confirmDelete(internship)}}
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Applications list for this internship */}
                        {isExpanded && (
                          <div className="border-t bg-muted/20">
                            <div className="p-3 bg-muted/30 border-b">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Applications for {internship.title}</h4>
                                <Badge variant="outline" className="text-xs">{internshipApps.length} total</Badge>
                              </div>
                            </div>
                            
                            {isLoadingApplications ? (
                              <div className="p-6 text-center">
                                <UsersIcon className="mx-auto h-6 w-6 text-muted-foreground/30 mb-2 animate-pulse" />
                                <p className="text-sm text-muted-foreground">Loading applications...</p>
                              </div>
                            ) : internshipApps.length === 0 ? (
                              <div className="p-6 text-center">
                                <UsersIcon className="mx-auto h-6 w-6 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No applications received for this internship.</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-border">
                                {internshipApps.map(app => (
                                  <div 
                                    key={app.id} 
                                    className="p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                                    onClick={(e) => {e.stopPropagation(); viewApplicantDetails(app)} }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <Avatar className="h-8 w-8 mr-3">
                                          <AvatarImage src={app.applicantPhoto} alt={app.applicantName} />
                                          <AvatarFallback>{app.applicantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h5 className="font-medium text-sm">{app.applicantName}</h5>
                                          <p className="text-xs text-muted-foreground">{app.university || app.applicant?.university || "Unknown"}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <p className="text-xs text-muted-foreground">Applied {formatRelativeTime(app.appliedAt)}</p>
                                        <Badge 
                                          className={
                                            app.status === "pending" ? "bg-amber-100 text-amber-700" :
                                            app.status === "interview" ? "bg-primary/10 text-primary" :
                                            app.status === "accepted" ? "bg-green-100 text-green-700" :
                                            "bg-red-100 text-red-700"
                                          }
                                        >
                                          {app.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {/* Display interview details for interview status */}
                                    {app.status === "interview" && app.interviewDate && (
                                      <div className="mt-2 ml-11 text-xs text-primary flex items-center">
                                        <CalendarIcon className="h-3 w-3 mr-1" />
                                        <span>Interview: {app.interviewDate} at {app.interviewTime || "TBD"}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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
                          <div className="font-semibold">{applications.filter(app => app.internshipId === internship.id.toString()).length}</div>
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
                  {isLoadingApplications ? (
                    <div className="col-span-4 text-center py-8">
                      <UsersIcon className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2 animate-pulse" />
                      <p className="text-muted-foreground">Loading applications data...</p>
                    </div>
                  ) : applicationError ? (
                    <div className="col-span-4 text-center py-8">
                      <UsersIcon className="mx-auto h-8 w-8 text-red-400 mb-2" />
                      <p className="text-muted-foreground">Error loading applications: {applicationError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          if (internships.length > 0) {
                            setIsLoadingApplications(true);
                            setApplicationError(null);
                            // Trigger fetching applications
                            fetchApplicationsForInternships();
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    internships
                      .filter(internship => {
                        const apps = getApplicationsForInternship(internship.id);
                        return apps.length > 0;
                      })
                      .map(internship => {
                        const internshipApps = getApplicationsForInternship(internship.id);
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
                      })
                  )}
                    
                  {!isLoadingApplications && !applicationError && internships.filter(internship => getApplicationsForInternship(internship.id).length > 0).length === 0 && (
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
                      onClick={() => viewApplicantDetails(application)}
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
              <DialogContent className="max-w-3xl">
                {currentApplicant && (
                  <>
                    <DialogHeader>
                      <DialogTitle>Applicant Details</DialogTitle>
                      <DialogDescription>Review and manage application from {currentApplicant.applicantName}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                      <div className="md:col-span-1 space-y-4">
                        <div className="text-center">
                          <Avatar className="h-24 w-24 mx-auto">
                            <AvatarImage 
                              src={currentApplicant.applicantPhoto || currentApplicant.applicant?.photo} 
                              alt={currentApplicant.applicantName} 
                            />
                            <AvatarFallback className="text-xl">{currentApplicant.applicantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <h2 className="text-lg font-semibold mt-3">{currentApplicant.applicantName}</h2>
                          <p className="text-sm text-muted-foreground">
                            {currentApplicant.applicant?.title || "Applicant"}
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4 space-y-3">
                          <h3 className="font-medium text-sm">Contact Information</h3>
                          <div className="text-sm space-y-2">
                            <div className="flex items-center gap-2">
                              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{currentApplicant.university || currentApplicant.applicant?.university || "Unknown University"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{currentApplicant.applicant?.location || "Location not provided"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-primary underline">
                                <a href={`mailto:${currentApplicant.email}`}>{currentApplicant.email}</a>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{currentApplicant.phone || currentApplicant.applicant?.phone || "Phone not provided"}</span>
                            </div>
                            {(currentApplicant.portfolio || currentApplicant.applicant?.website) && (
                              <div className="flex items-center gap-2">
                                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                                <a 
                                  href={currentApplicant.portfolio || currentApplicant.applicant?.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary underline"
                                >
                                  Portfolio / Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {currentApplicant.applicant && (
                          <div className="border rounded-lg p-4 space-y-3">
                            <h3 className="font-medium text-sm">Candidate Profile</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {currentApplicant.applicant.educationCount !== undefined && (
                                <div className="bg-muted/50 p-2 rounded-lg text-center">
                                  <div className="font-medium">{currentApplicant.applicant.educationCount}</div>
                                  <div className="text-xs text-muted-foreground">Education</div>
                                </div>
                              )}
                              {currentApplicant.applicant.experienceCount !== undefined && (
                                <div className="bg-muted/50 p-2 rounded-lg text-center">
                                  <div className="font-medium">{currentApplicant.applicant.experienceCount}</div>
                                  <div className="text-xs text-muted-foreground">Experience</div>
                                </div>
                              )}
                              {currentApplicant.applicant.certificationsCount !== undefined && (
                                <div className="bg-muted/50 p-2 rounded-lg text-center">
                                  <div className="font-medium">{currentApplicant.applicant.certificationsCount}</div>
                                  <div className="text-xs text-muted-foreground">Certifications</div>
                                </div>
                              )}
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => currentApplicant.applicant?.id && viewApplicantProfile(currentApplicant.applicant.id)}
                            >
                              <UserIcon className="h-4 w-4 mr-2" />
                              View Full Profile
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2 space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Applied Position</h3>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="font-medium">{currentApplicant.internshipTitle}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Applied {formatRelativeTime(currentApplicant.appliedAt)}
                              </span>
                              <span className="text-muted-foreground">•</span>
                              <Badge 
                                className={
                                  currentApplicant.status === "pending" ? "bg-amber-100 text-amber-700" :
                                  currentApplicant.status === "interview" ? "bg-primary/10 text-primary" :
                                  currentApplicant.status === "accepted" ? "bg-green-100 text-green-700" :
                                  "bg-red-100 text-red-700"
                                }
                              >
                                {currentApplicant.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-2">Cover Letter</h3>
                          <div className="bg-muted/30 p-3 rounded-md max-h-40 overflow-y-auto text-sm">
                            {currentApplicant.coverLetter || "No cover letter provided"}
                          </div>
                        </div>
                        
                        {currentApplicant.applicant?.about && (
                          <div className="border rounded-lg p-4">
                            <h3 className="font-medium mb-2">About</h3>
                            <div className="bg-muted/30 p-3 rounded-md max-h-40 overflow-y-auto text-sm">
                              {currentApplicant.applicant.about}
                            </div>
                          </div>
                        )}
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium mb-3">Application Status</h3>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant={currentApplicant.status === "pending" ? "default" : "outline"}
                                className={currentApplicant.status === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                                onClick={() => setCurrentApplicant({...currentApplicant, status: "pending"})}
                              >
                                Pending
                              </Button>
                              <Button
                                variant={currentApplicant.status === "interview" ? "default" : "outline"}
                                className={currentApplicant.status === "interview" ? "bg-primary hover:bg-primary/90" : ""}
                                onClick={() => setCurrentApplicant({...currentApplicant, status: "interview"})}
                              >
                                Interview
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant={currentApplicant.status === "accepted" ? "default" : "outline"}
                                  className={currentApplicant.status === "accepted" ? "bg-green-500 hover:bg-green-600" : ""}
                                  onClick={() => setCurrentApplicant({...currentApplicant, status: "accepted"})}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant={currentApplicant.status === "rejected" ? "default" : "outline"}
                                  className={currentApplicant.status === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
                                  onClick={() => setCurrentApplicant({...currentApplicant, status: "rejected"})}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                            
                            {currentApplicant.status === "interview" && (
                              <div className="border-t pt-3 mt-3">
                                <h4 className="text-sm font-medium mb-2">Schedule Interview</h4>
                                <div className="grid grid-cols-2 gap-3">
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
                              </div>
                            )}
                            
                            <div className="border-t pt-3 mt-3">
                              <h4 className="text-sm font-medium mb-2">Feedback Notes</h4>
                              <Textarea
                                placeholder="Add private notes about this applicant..."
                                value={applicantNotes}
                                onChange={(e) => setApplicantNotes(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
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
                    const internshipApps = applications.filter(app => app.internshipId === internship.id.toString());
                    const pendingCount = internshipApps.filter(app => app.status === 'pending').length;
                    const interviewCount = internshipApps.filter(app => app.status === 'interview').length;
                    const acceptedCount = internshipApps.filter(app => app.status === 'accepted').length;
                    const rejectedCount = internshipApps.filter(app => app.status === 'rejected').length;
                    
                    if (internshipApps.length === 0) return null;
                    
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
                              <span className="text-[#0A77FF] font-medium">{internshipApps.length}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#0A77FF]/10 rounded-full overflow-hidden">
                              <div className="flex h-full">
                                <div 
                                  className="bg-amber-500 h-full" 
                                  style={{ width: `${(pendingCount / internshipApps.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-[#0A77FF] h-full" 
                                  style={{ width: `${(interviewCount / internshipApps.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-green-500 h-full" 
                                  style={{ width: `${(acceptedCount / internshipApps.length) * 100}%` }}
                                ></div>
                                <div 
                                  className="bg-red-500 h-full" 
                                  style={{ width: `${(rejectedCount / internshipApps.length) * 100}%` }}
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