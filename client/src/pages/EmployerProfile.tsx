import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  MailIcon, 
  PhoneIcon, 
  GlobeIcon, 
  PenIcon, 
  UserIcon, 
  PlusIcon, 
  LinkIcon, 
  BuildingIcon,
  UsersIcon,
  FileTextIcon,
  UploadIcon,
  FileDownIcon,
  EyeIcon,
  TrashIcon,
  XIcon,
  ClockIcon,
  CheckIcon,
  AwardIcon,
  TrophyIcon,
  BarChartIcon,
  MessageCircleIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CreatePost from "@/components/profile/CreatePost";
import PostCard from "@/components/profile/PostCard";
import { Post } from "@shared/schema";
import CompanyProfileEditForm from "@/components/profile/CompanyProfileEditForm";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Award, Medal, Star } from "lucide-react";
import EditItemDialog from "@/components/profile/EditItemDialog";
import { useRoute, useLocation } from "wouter"; // Import wouter routing hooks
import { Link } from "wouter";
import axios from "axios";
import { connectionService } from "@/services/connectionService";

// Define employer profile interfaces
interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  location: string;
  description: string;
  logo: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// Add internship interface after the other interfaces
interface Internship {
  id: number;
  title: string;
  department: string;
  location: string;
  workType: string;
  duration: string;
  compensation: string;
  applicants: number;
  status: string;
  posted: string;
  deadline: string;
}

// Add new editable content interfaces
interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: "award" | "trophy" | "chart"; // Corresponds to icon type
}

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
}

interface Client {
  id: number;
  name: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

interface InsightItem {
  id: number;
  title: string;
  description: string;
  linkText: string;
}

// Interface for props with optional companyId
interface EmployerProfileProps {
  id?: string;
  isEditable?: boolean;
  companyId?: string;
}

// Add API service for achievements
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const achievementApi = {
  getAchievements: async (companyId: string) => {
    try {
      console.log('Fetching achievements for company:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/achievements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch achievements: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw achievements response:', result);

      // Handle both possible response formats
      const achievements = result.data || result;
      console.log('Processed achievements:', achievements);
      return Array.isArray(achievements) ? achievements : [];
    } catch (error) {
      console.error('Error in getAchievements:', error);
      return [];
    }
  },

  createAchievement: async (companyId: string, achievement: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievement),
      credentials: "include",
    });
    return response.json();
  },

  updateAchievement: async (companyId: string, achievementId: number, achievement: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/achievements/${achievementId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievement),
      credentials: "include",
    });
    return response.json();
  },

  deleteAchievement: async (companyId: string, achievementId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/achievements/${achievementId}`, {
      method: 'DELETE',
      credentials: "include",
    });
    return response.json();
  }
};

// Update project API service to match achievements
const projectApi = {
  getProjects: async (companyId: string) => {
    try {
      console.log('Fetching projects for company:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/projects`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw projects response:', result);

      // Handle both possible response formats
      const projects = result.data || result;
      console.log('Processed projects:', projects);
      return Array.isArray(projects) ? projects : [];
    } catch (error) {
      console.error('Error in getProjects:', error);
      return [];
    }
  },

  createProject: async (companyId: string, project: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
      credentials: "include",
    });
    return response.json();
  },

  updateProject: async (companyId: string, projectId: number, project: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
      credentials: "include",
    });
    return response.json();
  },

  deleteProject: async (companyId: string, projectId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/projects/${projectId}`, {
      method: 'DELETE',
      credentials: "include",
    });
    return response.json();
  }
};

// Simplify internship API service
const internshipApi = {
  getInternships: async (companyId: string) => {
    try {
      console.log('Fetching internships for company:', companyId);
      const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch internships: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw internships response:', result);

      // Handle both possible response formats
      const internships = result.data || result;
      console.log('Processed internships:', internships);
      return Array.isArray(internships) ? internships : [];
    } catch (error) {
      console.error('Error in getInternships:', error);
      return [];
    }
  },

  createInternship: async (companyId: string, internship: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(internship),
      credentials: "include",
    });
    return response.json();
  },

  updateInternship: async (companyId: string, internshipId: number, internship: any) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(internship),
      credentials: "include",
    });
    return response.json();
  },

  deleteInternship: async (companyId: string, internshipId: number) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`, {
      method: 'DELETE',
      credentials: "include",
    });
    return response.json();
  },

  updateInternshipStatus: async (companyId: string, internshipId: number, status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      credentials: "include",
    });
    return response.json();
  }
};

const EmployerProfile = ({ id, isEditable = true, companyId }: EmployerProfileProps) => {
  const [, params] = useRoute("/company/:id");
  const profileId = id || params?.id || companyId || "1"; // Provide a default value
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Determine if this is the user's own profile
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Add state for following
  const [isFollowing, setIsFollowing] = useState(false);

  // Company profile state
  const [company, setCompany] = useState<CompanyInfo>({
    name: "TechInnovate Solutions",
    industry: "Software Development",
    size: "50-100",
    founded: "2015",
    website: "techinnovate.com",
    location: "Paris, France",
    description: "TechInnovate Solutions is a leading technology company specializing in innovative software solutions for businesses. We focus on creating user-friendly applications that solve real-world problems and enhance productivity.",
    logo: "https://images.unsplash.com/photo-1569369926046-3015a262bba8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "contact@techinnovate.com",
    phone: "+33 1 23 45 67 89",
    address: "123 Tech Boulevard",
    city: "Paris",
    postalCode: "75001",
    country: "France"
  });

  // Temporary state for editing
  const [tempCompany, setTempCompany] = useState<CompanyInfo>({...company});
  const [tempContactInfo, setTempContactInfo] = useState<ContactInfo>({...contactInfo});
  
  // Posts for the company's feed
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: "We're excited to announce that we're now hiring for several internship positions! Visit our careers page to learn more. #Internships #JobOpportunities #TechCareers",
      authorId: 1,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80",
      createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likeCount: 45,
      commentCount: 12,
    },
    {
      id: 2,
      content: "Proud to announce our partnership with Paris University to provide mentorship and internship opportunities for computer science students. Looking forward to meeting the next generation of tech talent!",
      authorId: 1,
      image: null,
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      likeCount: 72,
      commentCount: 18,
    },
  ]);

  // Add internship management state
  const [internships, setInternships] = useState<Internship[]>([
    {
      id: 1,
      title: "UX/UI Design Intern",
      department: "Design",
      location: "Paris, France",
      workType: "on-site",
      duration: "3 months",
      compensation: "€800/month",
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
      workType: "hybrid",
      duration: "6 months",
      compensation: "€950/month",
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
      workType: "remote",
      duration: "4 months",
      compensation: "€700/month",
      applicants: 4,
      status: "active",
      posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]);

  // Add editable content state
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      title: "Best Workplace Award 2023",
      description: "Recognized as one of the top employers in the technology sector for our innovative work culture and employee benefits.",
      icon: "award"
    },
    {
      id: 2,
      title: "Technology Innovation Prize",
      description: "Our flagship product received the Technology Innovation Prize at the European Tech Summit.",
      icon: "trophy"
    },
    {
      id: 3,
      title: "50% Annual Growth",
      description: "Achieved consistent growth over the past three years, expanding our team and client base significantly.",
      icon: "chart"
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "Enterprise Resource Management Platform",
      description: "A comprehensive solution for large enterprises to manage resources, streamline operations, and increase productivity.",
      tags: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Smart City Infrastructure System",
      description: "IoT-powered infrastructure management system deployed in three major European cities.",
      tags: ["IoT", "Python", "Data Analytics"]
    }
  ]);

  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Global Tech Inc." },
    { id: 2, name: "EuroFinance" },
    { id: 3, name: "MedSolutions" },
    { id: 4, name: "RetailDirect" }
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: "Jean Dupont",
      role: "Chief Executive Officer",
      bio: "20+ years of experience in the technology sector, previously founded two successful startups.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
    },
    {
      id: 2,
      name: "Sophie Martin",
      role: "Chief Technology Officer",
      bio: "Former lead engineer at a Fortune 500 company, with expertise in cloud infrastructure and AI.",
      imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
    },
    {
      id: 3,
      name: "Thomas Laurent",
      role: "Chief Operating Officer",
      bio: "Specializes in streamlining operations and scaling businesses efficiently.",
      imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
    },
    {
      id: 4,
      name: "Emma Rousseau",
      role: "Chief Marketing Officer",
      bio: "Award-winning marketer with a background in digital strategies for tech companies.",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
    }
  ]);

  const [insights, setInsights] = useState<InsightItem[]>([
    {
      id: 1,
      title: "The Future of Enterprise Software",
      description: "Our research team has published a comprehensive white paper on emerging trends in enterprise software, focusing on AI integration, microservices architecture, and enhanced security protocols.",
      linkText: "Read White Paper"
    },
    {
      id: 2,
      title: "Digital Transformation Roadmap",
      description: "Our latest case study explores how businesses can navigate digital transformation challenges, with actionable steps and metrics for measuring success.",
      linkText: "View Case Study"
    }
  ]);

  // Dialog state for editing different content types
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [itemType, setItemType] = useState<"achievement" | "project" | "client" | "teamMember" | "insight" | null>(null);
  const [currentItem, setCurrentItem] = useState<any>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: string} | null>(null);

  const [showInternshipDialog, setShowInternshipDialog] = useState(false);
  const [currentInternship, setCurrentInternship] = useState<Internship | null>(null);
  const [internshipForm, setInternshipForm] = useState({
    title: "",
    department: "",
    location: "",
    workType: "on-site",
    duration: "",
    compensation: "",
    deadline: ""
  });

  // Generic form state for editing different content types
  const [itemForm, setItemForm] = useState<any>({});

  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showTechnologiesDialog, setShowTechnologiesDialog] = useState(false);
  const [showLegalDialog, setShowLegalDialog] = useState(false);
  const [showSocialMediaDialog, setShowSocialMediaDialog] = useState(false);
  
  // Add state for technologies
  const [technologies, setTechnologies] = useState([
    "React", "TypeScript", "Node.js", "Next.js", 
    "Python", "Django", "PostgreSQL", "MongoDB",
    "AWS", "Docker", "Kubernetes", "CI/CD"
  ]);
  
  // Add state for legal information
  const [legalInfo, setLegalInfo] = useState({
    registrationNumber: "RCS Paris B 123 456 789",
    vatId: "FR 12 345 678 901",
    legalForm: "Société par Actions Simplifiée (SAS)"
  });
  
  // Add state for social media
  const [socialMedia, setSocialMedia] = useState({
    linkedin: { active: true, url: "https://linkedin.com/company/techinnovate" },
    twitter: { active: true, url: "https://twitter.com/techinnovate" },
    instagram: { active: true, url: "https://instagram.com/techinnovate" },
    facebook: { active: true, url: "https://facebook.com/techinnovate" }
  });
  
  // Temporary state for editing
  const [tempTechnologies, setTempTechnologies] = useState<string[]>([...technologies]);
  const [tempLegalInfo, setTempLegalInfo] = useState({...legalInfo});
  const [tempSocialMedia, setTempSocialMedia] = useState({...socialMedia});
  const [tempAboutInfo, setTempAboutInfo] = useState({
    mission: "At " + company.name + ", our mission is to empower businesses with innovative technology solutions that drive growth and efficiency. We believe in creating software that puts users first and solves real-world problems through thoughtful design and robust engineering.",
    history: "Founded in " + company.founded + " by a team of industry veterans, " + company.name + " started with a vision to bridge the gap between complex technological capabilities and user-friendly applications. What began as a small operation with a handful of employees has now grown into a leading technology provider with clients across Europe and North America.",
    responsibility: company.name + " is committed to making a positive impact beyond our business operations. We have implemented sustainable practices throughout our organization, supported local community initiatives, and established a foundation that focuses on improving technology education and access for underserved communities."
  });
  
  // Add state for connection status
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected">("none");

  // Add a function to check connection status
  const checkConnectionStatus = async (profileId: string) => {
    if (!user || !user.id || profileId === user.id.toString()) return;
    
    try {
      const status = await connectionService.checkConnectionStatus(user.id, parseInt(profileId));
      setConnectionStatus(status.status.toLowerCase() as "none" | "pending" | "connected");
    } catch (error) {
      console.error("Error checking connection status:", error);
      setConnectionStatus("none");
    }
  };

  // Fetch company data
  const fetchCompanyData = async (id: string) => {
    try {
      console.log(`${API_BASE_URL}/api/companies/${id}`);
      const response = await fetch(`${API_BASE_URL}/api/companies/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to fetch company: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }

      const data = await response.json();
      
      // Update company state
      setCompany({
        name: data.name,
        industry: data.industry,
        size: data.size,
        founded: data.foundedDate,
        website: data.website,
        location: data.location,
        description: data.description || "",
        logo: data.photo ? `${API_BASE_URL}${data.photo}` : company.logo
      });

      // Update contact info state
      setContactInfo({
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country
      });

      // Update other states
      setTechnologies(data.technologies || []);
      setLegalInfo({
        registrationNumber: data.registrationNumber,
        vatId: data.vatId,
        legalForm: data.legalForm
      });
      setSocialMedia({
        linkedin: { active: !!data.linkedInUrl, url: data.linkedInUrl || "" },
        twitter: { active: !!data.twitterUrl, url: data.twitterUrl || "" },
        instagram: { active: !!data.instagramUrl, url: data.instagramUrl || "" },
        facebook: { active: !!data.facebookUrl, url: data.facebookUrl || "" }
      });

      return data;
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch company data",
        variant: "destructive",
      });
    }
  };

  // Update company data
  const updateCompanyData = async (formData: FormData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}api/companies/${profileId}`,
        {
          method: 'PUT',
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Failed to update company: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
      }
      
      const data = await response.json();
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating company data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update company profile",
        variant: "destructive",
      });
    }
  };

  // Update useEffect to handle all data fetching consistently
  useEffect(() => {
    const fetchAllData = async () => {
      if (!profileId) {
        console.log('No profile ID available');
        return;
      }

      console.log('Starting to fetch data for profile:', profileId);
      console.log('Current user data:', user);
      console.log('User company_id:', user?.company_id);
      console.log('JWT extracted company_id check');

      try {
        // Fetch company data
        await fetchCompanyData(profileId);
        console.log('Company data fetched successfully');

        // Fetch achievements
        console.log('Fetching achievements...');
        const achievementsData = await achievementApi.getAchievements(profileId);
        console.log('Achievements data received:', achievementsData);
        setAchievements(achievementsData);

        // Fetch projects
        console.log('Fetching projects...');
        const projectsData = await projectApi.getProjects(profileId);
        console.log('Projects data received:', projectsData);
        setProjects(projectsData);

        // Set profile ownership
        const parsedProfileId = parseInt(profileId);
        const isOwner = user?.company_id === parsedProfileId;
        console.log('Profile ownership check:', {
          userCompanyId: user?.company_id,
          parsedProfileId,
          isOwner
        });
        setIsOwnProfile(isOwner);

        // Check connection status
        if (user && user.id && profileId !== user.id.toString()) {
          await checkConnectionStatus(profileId);
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    // Set page title
    document.title = `${company.name} | StageConnect`;
    
    // Execute data fetching
    fetchAllData();
  }, [profileId, user, company.name]);

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };
  
  // Update handleProfileUpdate to use the API
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempCompany.name,
          industry: tempCompany.industry,
          size: tempCompany.size,
          foundedDate: tempCompany.founded,
          website: tempCompany.website,
          location: tempCompany.location,
          description: tempCompany.description,
          email: tempContactInfo.email,
          phone: tempContactInfo.phone,
          address: tempContactInfo.address,
          city: tempContactInfo.city,
          postalCode: tempContactInfo.postalCode,
          country: tempContactInfo.country
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update company profile');
      }

      // Update the main states with the temporary values
      setCompany(tempCompany);
      setContactInfo(tempContactInfo);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company profile:', error);
    }
  };

  const handleStartEditing = () => {
    // Set temporary states with current values
    setTempCompany({...company});
    setTempContactInfo({...contactInfo});
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  // Add internship handling functions
  const handleAddInternship = () => {
    setInternshipForm({
      title: "",
      department: "",
      location: "",
      workType: "on-site",
      duration: "",
      compensation: "",
      deadline: ""
    });
    setCurrentInternship(null);
    setShowInternshipDialog(true);
  };

  const handleEditInternship = (internship: Internship) => {
    setCurrentInternship(internship);
    setInternshipForm({
      title: internship.title,
      department: internship.department,
      location: internship.location,
      workType: internship.workType,
      duration: internship.duration,
      compensation: internship.compensation,
      deadline: new Date(internship.deadline).toISOString().split('T')[0]
    });
    setShowInternshipDialog(true);
  };

  // Update handleSaveInternship to use the API
  const handleSaveInternship = async () => {
    if (!internshipForm.title || !internshipForm.department) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentInternship) {
        // Update existing internship
        const result = await internshipApi.updateInternship(profileId, currentInternship.id, internshipForm);
        if (result.success) {
          setInternships(internships.map(internship => 
            internship.id === currentInternship.id ? result.data : internship
          ));
          toast({
            title: "Success",
            description: "Internship updated successfully",
          });
        }
      } else {
        // Create new internship
        const result = await internshipApi.createInternship(profileId, internshipForm);
        if (result.success) {
          setInternships([...internships, result.data]);
          toast({
            title: "Success",
            description: "Internship created successfully",
          });
        }
      }
      setShowInternshipDialog(false);
    } catch (error) {
      console.error('Error saving internship:', error);
      toast({
        title: "Error",
        description: "Failed to save internship",
        variant: "destructive",
      });
    }
  };

  // Update toggleInternshipStatus to use the API
  const toggleInternshipStatus = async (id: number) => {
    try {
      const internship = internships.find(int => int.id === id);
      if (!internship) return;

      const newStatus = internship.status === "active" ? "closed" : "active";
      const result = await internshipApi.updateInternshipStatus(profileId, id, newStatus);
      
      if (result.success) {
        setInternships(internships.map(int => 
          int.id === id ? { ...int, status: newStatus } : int
        ));
        toast({
          title: `Internship ${newStatus}`,
          description: `${internship.title} is now ${newStatus}.`,
        });
      }
    } catch (error) {
      console.error('Error updating internship status:', error);
      toast({
        title: "Error",
        description: "Failed to update internship status",
        variant: "destructive",
      });
    }
  };

  const handleInternshipInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInternshipForm({
      ...internshipForm,
      [name]: value
    });
  };

  const handleInternshipSelectChange = (name: string, value: string) => {
    setInternshipForm({
      ...internshipForm,
      [name]: value
    });
  };

  const handleOpenEditDialog = (type: "achievement" | "project" | "client" | "teamMember" | "insight", item: any) => {
    setItemType(type);
    setCurrentItem(item);
    setItemForm({...item});
    setShowItemDialog(true);
  };

  const handleAddItem = (type: "achievement" | "project" | "client" | "teamMember" | "insight") => {
    setItemType(type);
    setCurrentItem(null);
    
    // Initialize empty form based on type
    switch(type) {
      case "achievement":
        setItemForm({ title: "", description: "", icon: "award" });
        break;
      case "project":
        setItemForm({ title: "", description: "", tags: [] });
        break;
      case "client":
        setItemForm({ name: "" });
        break;
      case "teamMember":
        setItemForm({ name: "", role: "", bio: "", imageUrl: "" });
        break;
      case "insight":
        setItemForm({ title: "", description: "", linkText: "" });
        break;
    }
    
    setShowItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!itemType) return;

    try {
      if (itemType === "achievement") {
        if (currentItem) {
          // Update existing achievement
          const result = await achievementApi.updateAchievement(profileId, currentItem.id, itemForm);
          if (result.success) {
            setAchievements(achievements.map(a => a.id === currentItem.id ? result.data : a));
            toast({
              title: "Success",
              description: "Achievement updated successfully",
            });
          }
        } else {
          // Create new achievement
          const result = await achievementApi.createAchievement(profileId, itemForm);
          if (result.success) {
            setAchievements([...achievements, result.data]);
            toast({
              title: "Success",
              description: "Achievement created successfully",
            });
          }
        }
      } else if (itemType === "project") {
        if (currentItem) {
          // Update existing project
          const result = await projectApi.updateProject(profileId, currentItem.id, itemForm);
          if (result.success) {
            setProjects(projects.map(p => p.id === currentItem.id ? result.data : p));
            toast({
              title: "Success",
              description: "Project updated successfully",
            });
          }
        } else {
          // Create new project
          const result = await projectApi.createProject(profileId, itemForm);
          if (result.success) {
            setProjects([...projects, result.data]);
            toast({
              title: "Success",
              description: "Project created successfully",
            });
          }
        }
      } else {
        // Handle other item types
        if (currentItem) {
          // Update existing item
          switch(itemType) {
            case "client":
              setClients(clients.map(item => 
                item.id === currentItem.id ? { ...item, ...itemForm } : item
              ));
              break;
            case "teamMember":
              setTeamMembers(teamMembers.map(item => 
                item.id === currentItem.id ? { ...item, ...itemForm } : item
              ));
              break;
            case "insight":
              setInsights(insights.map(item => 
                item.id === currentItem.id ? { ...item, ...itemForm } : item
              ));
              break;
          }
          toast({
            title: "Item updated",
            description: `The ${itemType} has been updated successfully.`,
          });
        } else {
          // Create new item
          const newId = Date.now();
          switch(itemType) {
            case "client":
              setClients([...clients, { ...itemForm, id: newId }]);
              break;
            case "teamMember":
              setTeamMembers([...teamMembers, { ...itemForm, id: newId }]);
              break;
            case "insight":
              setInsights([...insights, { ...itemForm, id: newId }]);
              break;
          }
          toast({
            title: "Item added",
            description: `A new ${itemType} has been added successfully.`,
          });
        }
      }
      setShowItemDialog(false);
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "achievement") {
        const result = await achievementApi.deleteAchievement(profileId, itemToDelete.id);
        if (result.success) {
          setAchievements(achievements.filter(a => a.id !== itemToDelete.id));
          toast({
            title: "Success",
            description: "Achievement deleted successfully",
          });
        }
      } else if (itemToDelete.type === "project") {
        const result = await projectApi.deleteProject(profileId, itemToDelete.id);
        if (result.success) {
          setProjects(projects.filter(p => p.id !== itemToDelete.id));
          toast({
            title: "Success",
            description: "Project deleted successfully",
          });
        }
      } else if (itemToDelete.type === "internship") {
        const result = await internshipApi.deleteInternship(profileId, itemToDelete.id);
        if (result.success) {
          setInternships(internships.filter(i => i.id !== itemToDelete.id));
          toast({
            title: "Success",
            description: "Internship deleted successfully",
          });
        }
      } else {
        // Delete other item types
        switch(itemToDelete.type) {
          case "client":
            setClients(clients.filter(item => item.id !== itemToDelete.id));
            break;
          case "teamMember":
            setTeamMembers(teamMembers.filter(item => item.id !== itemToDelete.id));
            break;
          case "insight":
            setInsights(insights.filter(item => item.id !== itemToDelete.id));
            break;
          case "post":
            setPosts(posts.filter(item => item.id !== itemToDelete.id));
            break;
        }
        toast({
          title: "Item deleted",
          description: `The ${itemToDelete.type} has been deleted.`,
        });
      }
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemForm({
      ...itemForm,
      [name]: value
    });
  };

  const handleItemSelectChange = (name: string, value: string) => {
    setItemForm({
      ...itemForm,
      [name]: value
    });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    setItemForm({
      ...itemForm,
      tags: tagsArray
    });
  };

  const DeleteConfirmDialog = () => (
    <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this {itemToDelete?.type}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed" : "Following",
      description: isFollowing 
        ? `You are no longer following ${company.name}` 
        : `You are now following ${company.name}`,
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "Message feature",
      description: "Messaging functionality would be implemented here.",
    });
  };

  // Function to navigate to a company profile
  const goToCompanyProfile = (id: string) => {
    navigate(`/company/${id}`);
  };

  // Update the handleConnect function to use the connectionService
  const handleConnect = async (profileId: string) => {
    try {
      const parsedProfileId = parseInt(profileId);
      
      if (!user || !user.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to connect with this company.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if already connected
      if (connectionStatus === "connected") {
        toast({
          title: "Already Connected",
          description: "You are already connected with this company.",
        });
        return;
      }
      
      // Check if request already pending
      if (connectionStatus === "pending") {
        toast({
          title: "Request Pending",
          description: "Your connection request is already pending.",
        });
        return;
      }
      
      // Send connection request through the API
      const response = await connectionService.sendConnectionRequest(user.id, parsedProfileId);
      
      if (response.success) {
        setConnectionStatus("pending");
        toast({
          title: "Connection Request Sent",
          description: "Your connection request has been sent successfully.",
        });
      } else {
        throw new Error(response.message || "Failed to send connection request");
      }
    } catch (error) {
      console.error("Failed to send connection request:", error);
      let errorMsg = "Failed to send connection request. Please try again.";
      
      // Extract more specific error message if available
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  // Update the handleMessage function to use parseInt
  const handleMessage = (profileId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to message this company.",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to messaging interface with this company
    navigate(`/messages?recipient=${profileId}`);
  };

  // Add dialog state handlers
  const handleOpenAboutDialog = () => {
    setShowAboutDialog(true);
  };

  const handleOpenTechnologiesDialog = () => {
    setShowTechnologiesDialog(true);
  };

  const handleOpenSocialMediaDialog = () => {
    setShowSocialMediaDialog(true);
  };

  const handleOpenLegalDialog = () => {
    setShowLegalDialog(true);
  };

  // Add about info handler
  const handleSaveAboutInfo = () => {
    setTempAboutInfo(tempAboutInfo);
    setShowAboutDialog(false);
    toast({
      title: "Success",
      description: "About information updated successfully",
    });
  };

  // Add technology handlers
  const handleAddTechnology = (tech: string) => {
    if (tech && !tempTechnologies.includes(tech)) {
      setTempTechnologies([...tempTechnologies, tech]);
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setTempTechnologies(tempTechnologies.filter(t => t !== tech));
  };

  const handleSaveTechnologies = () => {
    setTechnologies(tempTechnologies);
    setShowTechnologiesDialog(false);
    toast({
      title: "Success",
      description: "Technologies updated successfully",
    });
  };

  // Add legal info handler
  const handleSaveLegalInfo = () => {
    setLegalInfo(tempLegalInfo);
    setShowLegalDialog(false);
    toast({
      title: "Success",
      description: "Legal information updated successfully",
    });
  };

  // Add social media handlers
  const handleSocialMediaToggle = (platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook') => {
    setTempSocialMedia({
      ...tempSocialMedia,
      [platform]: {
        ...tempSocialMedia[platform],
        active: !tempSocialMedia[platform].active
      }
    });
  };

  const handleSocialMediaUrlChange = (platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook', url: string) => {
    setTempSocialMedia({
      ...tempSocialMedia,
      [platform]: {
        ...tempSocialMedia[platform],
        url
      }
    });
  };

  const handleSaveSocialMedia = () => {
    setSocialMedia(tempSocialMedia);
    setShowSocialMediaDialog(false);
    toast({
      title: "Success",
      description: "Social media information updated successfully",
    });
  };

  const handleOpenDeleteDialog = (type: string, id: number) => {
    setItemToDelete({ type, id });
    setShowDeleteDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {isEditing && isOwnProfile ? (
        <CompanyProfileEditForm 
          tempCompany={tempCompany}
          setTempCompany={setTempCompany}
          tempContactInfo={tempContactInfo}
          setTempContactInfo={setTempContactInfo}
          handleCancelEditing={handleCancelEditing}
          onProfileUpdate={handleProfileUpdate}
          profileId={profileId}
        />
      ) : (
        <>
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <CardContent className="relative">
              <div className="absolute -top-16 left-4 md:left-8">
                <Avatar className="h-32 w-32 border-4 border-white bg-white">
                  <AvatarImage src={company.logo} alt={company.name} />
                  <AvatarFallback><BuildingIcon className="h-16 w-16 text-blue-500" /></AvatarFallback>
                </Avatar>
              </div>
              
              <div className="pt-20 md:pt-16 md:ml-40 flex flex-col md:flex-row md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{company.name}</h1>
                  <p className="text-neutral-600">{company.industry}</p>
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0 mt-2 text-sm text-neutral-500">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-1" />
                      <span>{contactInfo.email}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center">
                        <GlobeIcon className="h-4 w-4 mr-1" />
                        <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  {isEditable ? (
                    <Button onClick={handleStartEditing}>
                      <PenIcon className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      {connectionStatus === "connected" ? (
                        <div className="flex space-x-2">
                          <Button variant="outline">
                            <CheckIcon className="h-4 w-4 mr-2" /> Connected
                          </Button>
                          <Button variant="outline" onClick={() => handleMessage(profileId)}>
                            <MessageCircleIcon className="h-4 w-4 mr-2" /> Message
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant={connectionStatus === "pending" ? "outline" : "default"}
                          disabled={connectionStatus === "pending"}
                          onClick={() => handleConnect(profileId)}
                        >
                          {connectionStatus === "pending" ? "Request Pending" : "Connect"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add company navigation breadcrumb when viewing profile from /company/:id */}
          {profileId && (
            <div className="flex items-center mb-4 text-sm breadcrumbs">
              <ul className="flex space-x-2">
                <li><Link href="/">Home</Link></li>
                <li className="before:content-['/'] before:mx-2">
                  <Link href="/network">Companies</Link>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <span className="font-medium">{company.name}</span>
                </li>
              </ul>
            </div>
          )}
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isEditable && <TabsTrigger value="posts">Posts</TabsTrigger>}
              <TabsTrigger value="internships">Internships</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab - Will be expanded */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-700">{company.description}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {achievements.map((achievement) => (
                          <div key={achievement.id} className="flex gap-4 items-start group">
                            <div className="bg-primary/10 p-2 rounded-full">
                              {achievement.icon === "award" && <AwardIcon className="h-6 w-6 text-primary" />}
                              {achievement.icon === "trophy" && <TrophyIcon className="h-6 w-6 text-primary" />}
                              {achievement.icon === "chart" && <BarChartIcon className="h-6 w-6 text-primary" />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{achievement.title}</h3>
                              <p className="text-neutral-600 text-sm">{achievement.description}</p>
                            </div>
                            {isOwnProfile && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenEditDialog("achievement", achievement)}
                                >
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog("achievement", achievement.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                        {isOwnProfile && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-2" 
                            onClick={() => handleAddItem("achievement")}
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Achievement
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Featured Projects</CardTitle>
                      {isOwnProfile && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddItem("project")}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {projects.map((project) => (
                          <div key={project.id} className="border rounded-lg p-4 group relative">
                            {isOwnProfile && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded p-1">
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenEditDialog("project", project)}
                                >
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog("project", project.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-neutral-600 text-sm mt-1">{project.description}</p>
                            <div className="flex gap-2 mt-2">
                              {project.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {posts.slice(0, 2).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      {posts.length === 0 && (
                        <p className="text-neutral-500 text-center">No posts to display</p>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("posts")}>
                        View All Updates
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Industry</h3>
                        <p>{company.industry}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Company size</h3>
                        <p>{company.size} employees</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Founded</h3>
                        <p>{company.founded}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Website</h3>
                        <a 
                          href={`https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                        <p>{contactInfo.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                        <p>{contactInfo.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Address</h3>
                        <p>{contactInfo.address}, {contactInfo.city}, {contactInfo.postalCode}</p>
                        <p>{contactInfo.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Open Positions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Currently hiring for {internships.filter(i => i.status === "active").length} positions</p>
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("internships")}>
                          <BriefcaseIcon className="h-4 w-4 mr-2" />
                          View Open Positions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Our Clients</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddItem("client")}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {clients.map((client) => (
                          <div key={client.id} className="border rounded-md flex items-center justify-center p-4 h-20 group relative">
                            {isOwnProfile && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded p-1">
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenEditDialog("client", client)}
                                >
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog("client", client.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <p className="font-medium text-center">{client.name}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Posts Tab - Will be expanded */}
            <TabsContent value="posts">
              <div className="space-y-4">
                <CreatePost onAddPost={handleAddPost} />
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
                {posts.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-neutral-500">You haven't posted anything yet. Share your first company update!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Internships Tab - Will be expanded */}
            <TabsContent value="internships">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Internship Opportunities</CardTitle>
                    <CardDescription>
                      {isOwnProfile 
                        ? "Manage and showcase your current internship positions" 
                        : `Internship opportunities at ${company.name}`}
                    </CardDescription>
                  </div>
                  {isOwnProfile && (
                    <Button onClick={handleAddInternship}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add New Internship
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {internships.length === 0 ? (
                      <div className="text-center py-10">
                        <BriefcaseIcon className="mx-auto h-10 w-10 text-neutral-300 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No internships posted yet</h3>
                        <p className="text-neutral-500 mb-4">
                          {isOwnProfile 
                            ? "Create your first internship listing to start attracting candidates."
                            : `${company.name} hasn't posted any internship opportunities yet.`}
                        </p>
                        {isOwnProfile && (
                          <Button onClick={handleAddInternship}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Create New Listing
                          </Button>
                        )}
                      </div>
                    ) : (
                      internships.map((internship) => (
                        <div key={internship.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50">
                          <div>
                            <h3 className="font-medium">{internship.title}</h3>
                            <div className="flex items-center text-sm text-neutral-500 mt-1">
                              <span>{internship.department}</span>
                              <span className="mx-2">•</span>
                              <span>{internship.location}</span>
                              <span className="mx-2">•</span>
                              <span>
                                Deadline: {new Date(internship.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="font-semibold">{internship.applicants}</div>
                              <div className="text-xs text-neutral-500">Applicants</div>
                            </div>
                            <Badge variant={internship.status === "active" ? "default" : "secondary"}>
                              {internship.status === "active" ? "Active" : "Closed"}
                            </Badge>
                            {isOwnProfile ? (
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEditInternship(internship)}>
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => toggleInternshipStatus(internship.id)}>
                                  {internship.status === "active" ? (
                                    <XIcon className="h-4 w-4" />
                                  ) : (
                                    <CheckIcon className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            ) : (
                              internship.status === "active" && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    toast({
                                      title: "Application Started",
                                      description: `You are applying to ${internship.title} at ${company.name}.`,
                                    });
                                    // In a real app, this would navigate to an application form
                                    // navigate(`/apply/${companyId}/${internship.id}`);
                                  }}
                                >
                                  Apply Now
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats and Metrics - Only shown for own profile */}
              {isOwnProfile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-500">
                        Total Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {internships.reduce((total, internship) => total + internship.applicants, 0)}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <UsersIcon className="text-primary h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Across all internship positions
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-500">
                        Active Positions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {internships.filter(i => i.status === "active").length}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <BriefcaseIcon className="text-primary h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Currently accepting applications
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-neutral-500">
                        Upcoming Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {internships.filter(i => 
                            i.status === "active" && 
                            new Date(i.deadline).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                          ).length}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-full">
                          <ClockIcon className="text-primary h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Closing in the next 7 days
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* About Tab - Will be expanded */}
            <TabsContent value="about">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>About {company.name}</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenAboutDialog}
                        >
                          <PenIcon className="h-4 w-4 mr-2" />
                          Edit About
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-neutral-700">{company.description}</p>
                        
                        <div>
                          <h3 className="font-medium text-lg mb-2">Our Mission</h3>
                          <p className="text-neutral-700">
                            {tempAboutInfo.mission}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-lg mb-2">Company History</h3>
                          <p className="text-neutral-700">
                            {tempAboutInfo.history}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-lg mb-2">Our Values</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-muted/30 p-4 rounded-md">
                              <h4 className="font-medium">Excellence</h4>
                              <p className="text-sm text-neutral-600 mt-1">We deliver products and services of the highest quality, continuously pushing the boundaries of what's possible.</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-md">
                              <h4 className="font-medium">Innovation</h4>
                              <p className="text-sm text-neutral-600 mt-1">We embrace new technologies and ideas, fostering a culture of continuous improvement and creative problem-solving.</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-md">
                              <h4 className="font-medium">Integrity</h4>
                              <p className="text-sm text-neutral-600 mt-1">We conduct business ethically and transparently, building trust with our clients, partners, and employees.</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-md">
                              <h4 className="font-medium">Collaboration</h4>
                              <p className="text-sm text-neutral-600 mt-1">We believe in the power of teamwork and partnership, both internally and with our clients, to achieve exceptional results.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-lg mb-2">Corporate Responsibility</h3>
                          <p className="text-neutral-700">
                            {tempAboutInfo.responsibility}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Technologies We Use</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenTechnologiesDialog}
                        >
                          <PenIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {technologies.map((tech) => (
                          <div key={tech} className="bg-neutral-100 p-2 rounded-md text-center">
                            {tech}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Industry Insights</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem("insight")}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Insight
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.map((insight) => (
                          <div key={insight.id} className="border p-4 rounded-lg group relative">
                            {isOwnProfile && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded p-1">
                                <Button
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleOpenEditDialog("insight", insight)}
                                >
                                  <PenIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog("insight", insight.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <h3 className="font-medium">{insight.title}</h3>
                            <p className="text-sm text-neutral-600 mt-1">{insight.description}</p>
                            <Button variant="link" className="px-0 h-8 mt-1">{insight.linkText}</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Company Information</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="ghost" 
                          size="icon" 
                          onClick={handleStartEditing}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Industry</h3>
                        <p>{company.industry}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Company size</h3>
                        <p>{company.size} employees</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Founded</h3>
                        <p>{company.founded}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Website</h3>
                        <a 
                          href={`https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Headquarters</h3>
                        <p>{company.location}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Contact Information</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="ghost" 
                          size="icon" 
                          onClick={handleStartEditing}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Email</h3>
                        <p>{contactInfo.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Phone</h3>
                        <p>{contactInfo.phone}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Address</h3>
                        <p>{contactInfo.address}, {contactInfo.city}, {contactInfo.postalCode}</p>
                        <p>{contactInfo.country}</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Social Media</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="ghost" 
                          size="icon" 
                          onClick={handleOpenSocialMediaDialog}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {socialMedia.linkedin.active && (
                          <a 
                            href={socialMedia.linkedin.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                              </svg>
                            </Button>
                          </a>
                        )}
                        {socialMedia.twitter.active && (
                          <a 
                            href={socialMedia.twitter.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-2.783-2.783-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
                              </svg>
                            </Button>
                          </a>
                        )}
                        {socialMedia.instagram.active && (
                          <a 
                            href={socialMedia.instagram.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                              </svg>
                            </Button>
                          </a>
                        )}
                        {socialMedia.facebook.active && (
                          <a 
                            href={socialMedia.facebook.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                              </svg>
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Legal Information</CardTitle>
                      {isOwnProfile && (
                        <Button
                          variant="ghost" 
                          size="icon" 
                          onClick={handleOpenLegalDialog}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Registration Number</h3>
                        <p className="text-sm">{legalInfo.registrationNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">VAT ID</h3>
                        <p className="text-sm">{legalInfo.vatId}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500">Legal Form</h3>
                        <p className="text-sm">{legalInfo.legalForm}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Internship Form Dialog */}
      <Dialog open={showInternshipDialog} onOpenChange={setShowInternshipDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentInternship ? "Edit Internship" : "Create New Internship"}
            </DialogTitle>
            <DialogDescription>
              {currentInternship
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
                  onChange={handleInternshipInputChange} 
                  placeholder="e.g., UX/UI Design Intern"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <Input 
                  id="department" 
                  name="department" 
                  value={internshipForm.department} 
                  onChange={handleInternshipInputChange} 
                  placeholder="e.g., Design, Engineering, Marketing"
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
                  onChange={handleInternshipInputChange} 
                  placeholder="e.g., Paris, France"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workType">Work Type</Label>
                <Select 
                  value={internshipForm.workType} 
                  onValueChange={(value) => handleInternshipSelectChange("workType", value)}
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
                  onChange={handleInternshipInputChange} 
                  placeholder="e.g., 3 months, 6 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compensation">Compensation</Label>
                <Input 
                  id="compensation" 
                  name="compensation" 
                  value={internshipForm.compensation} 
                  onChange={handleInternshipInputChange} 
                  placeholder="e.g., €800/month"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input 
                id="deadline" 
                name="deadline" 
                type="date" 
                value={internshipForm.deadline} 
                onChange={handleInternshipInputChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInternshipDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSaveInternship}>
              {currentInternship ? "Save Changes" : "Create Internship"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <EditItemDialog 
        showItemDialog={showItemDialog}
        setShowItemDialog={setShowItemDialog}
        itemType={itemType}
        currentItem={currentItem}
        itemForm={itemForm}
        handleItemInputChange={handleItemInputChange}
        handleItemSelectChange={handleItemSelectChange}
        handleTagsChange={handleTagsChange}
        handleSaveItem={handleSaveItem}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog />

      {/* About Information Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit About Information</DialogTitle>
            <DialogDescription>
              Update your company's about information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mission">Our Mission</Label>
              <Textarea 
                id="mission" 
                value={tempAboutInfo.mission}
                onChange={(e) => setTempAboutInfo({...tempAboutInfo, mission: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="history">Company History</Label>
              <Textarea 
                id="history" 
                value={tempAboutInfo.history}
                onChange={(e) => setTempAboutInfo({...tempAboutInfo, history: e.target.value})}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsibility">Corporate Responsibility</Label>
              <Textarea 
                id="responsibility" 
                value={tempAboutInfo.responsibility}
                onChange={(e) => setTempAboutInfo({...tempAboutInfo, responsibility: e.target.value})}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAboutDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAboutInfo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Technologies Dialog */}
      <Dialog open={showTechnologiesDialog} onOpenChange={setShowTechnologiesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Technologies</DialogTitle>
            <DialogDescription>
              Add or remove technologies your company uses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-wrap gap-2">
              {tempTechnologies.map((tech) => (
                <div key={tech} className="bg-neutral-100 rounded-md px-3 py-1 flex items-center">
                  {tech}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1" 
                    onClick={() => handleRemoveTechnology(tech)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                id="newTech" 
                placeholder="Add new technology..." 
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTechnology((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  const input = document.getElementById('newTech') as HTMLInputElement;
                  handleAddTechnology(input.value);
                  input.value = '';
                }}
              >
                Add
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTechnologiesDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTechnologies}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Legal Information Dialog */}
      <Dialog open={showLegalDialog} onOpenChange={setShowLegalDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Legal Information</DialogTitle>
            <DialogDescription>
              Update your company's legal details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input 
                id="registrationNumber" 
                value={tempLegalInfo.registrationNumber}
                onChange={(e) => setTempLegalInfo({...tempLegalInfo, registrationNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatId">VAT ID</Label>
              <Input 
                id="vatId" 
                value={tempLegalInfo.vatId}
                onChange={(e) => setTempLegalInfo({...tempLegalInfo, vatId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalForm">Legal Form</Label>
              <Input 
                id="legalForm" 
                value={tempLegalInfo.legalForm}
                onChange={(e) => setTempLegalInfo({...tempLegalInfo, legalForm: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLegalDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLegalInfo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Social Media Dialog */}
      <Dialog open={showSocialMediaDialog} onOpenChange={setShowSocialMediaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Social Media</DialogTitle>
            <DialogDescription>
              Manage your company's social media presence.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="linkedin" 
                    checked={tempSocialMedia.linkedin.active}
                    onChange={() => handleSocialMediaToggle('linkedin')}
                  />
                  <Label htmlFor="linkedin">LinkedIn</Label>
                </div>
                <Input 
                  id="linkedinUrl" 
                  value={tempSocialMedia.linkedin.url}
                  onChange={(e) => handleSocialMediaUrlChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                  disabled={!tempSocialMedia.linkedin.active}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="twitter" 
                    checked={tempSocialMedia.twitter.active}
                    onChange={() => handleSocialMediaToggle('twitter')}
                  />
                  <Label htmlFor="twitter">Twitter</Label>
                </div>
                <Input 
                  id="twitterUrl" 
                  value={tempSocialMedia.twitter.url}
                  onChange={(e) => handleSocialMediaUrlChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourcompany"
                  disabled={!tempSocialMedia.twitter.active}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="instagram" 
                    checked={tempSocialMedia.instagram.active}
                    onChange={() => handleSocialMediaToggle('instagram')}
                  />
                  <Label htmlFor="instagram">Instagram</Label>
                </div>
                <Input 
                  id="instagramUrl" 
                  value={tempSocialMedia.instagram.url}
                  onChange={(e) => handleSocialMediaUrlChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourcompany"
                  disabled={!tempSocialMedia.instagram.active}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="facebook" 
                    checked={tempSocialMedia.facebook.active}
                    onChange={() => handleSocialMediaToggle('facebook')}
                  />
                  <Label htmlFor="facebook">Facebook</Label>
                </div>
                <Input 
                  id="facebookUrl" 
                  value={tempSocialMedia.facebook.url}
                  onChange={(e) => handleSocialMediaUrlChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourcompany"
                  disabled={!tempSocialMedia.facebook.active}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSocialMediaDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSocialMedia}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add this card when viewing as a visitor */}
      {!isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Company Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">1,243 followers</p>
                <p className="text-sm text-neutral-500">Including 12 people from your network</p>
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="border-2 border-background">
                    <AvatarImage src={`https://i.pravatar.cc/100?img=${i+10}`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                ))}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +7
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <p className="font-medium">Similar Companies</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div 
                    className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-neutral-50"
                    onClick={() => goToCompanyProfile('techcorp')}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" />
                      <AvatarFallback>TC</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">TechCorp</div>
                  </div>
                  <div 
                    className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer hover:bg-neutral-50"
                    onClick={() => goToCompanyProfile('datasoft')}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80" />
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">DataSoft</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add quick contact section for visitors */}
      {!isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Connect with {company.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                {connectionStatus === "connected" ? (
                  <div className="flex w-full justify-between">
                    <Button 
                      className="w-[48%]" 
                      variant="outline"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" /> Connected
                    </Button>
                    <Button 
                      className="w-[48%]" 
                      variant="outline" 
                      onClick={() => handleMessage(profileId)}
                    >
                      <MessageCircleIcon className="h-4 w-4 mr-2" /> 
                      Message
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleConnect(profileId)}
                    disabled={connectionStatus === "pending"}
                    variant={connectionStatus === "pending" ? "outline" : "default"}
                  >
                    {connectionStatus === "pending" ? "Request Pending" : "Connect with " + company.name}
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 py-2 border-t">
                <p className="font-medium">Contact Information</p>
                <div className="flex items-center space-x-2">
                  <MailIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">{contactInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm">{contactInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GlobeIcon className="h-4 w-4 text-neutral-500" />
                  <a 
                    href={`https://${company.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <p className="font-medium">Hiring Activity</p>
                <p className="text-sm text-neutral-600">Actively recruiting for {internships.filter(i => i.status === "active").length} positions</p>
                <Button 
                  variant="link" 
                  className="px-0 text-sm h-8" 
                  onClick={() => setActiveTab("internships")}
                >
                  View all internships
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployerProfile; 