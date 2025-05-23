import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GraduationCapIcon,
  UserPlusIcon,
  AwardIcon,
  FileTextIcon,
  UploadIcon,
  FileDownIcon,
  EyeIcon,
  TrashIcon,
  XIcon,
  MessageCircleIcon,
  CheckIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import CreatePost from "@/components/profile/CreatePost";
import PostCard from "@/components/profile/PostCard";
import { Post } from "@shared/schema";
import CVGenerator from "@/components/cv/CVGenerator";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import ProfileEditForm, { ProfileData } from "@/components/profile/ProfileEditForm";
import EducationDialog from "@/components/profile/EducationDialog";
import CertificationDialog from "@/components/profile/CertificationDialog";
import ExperienceDialog from "@/components/profile/ExperienceDialog";
import { useLocation } from "wouter";
import { getEducationList, createEducation, updateEducation, deleteEducation, getCertificationList, createCertification, updateCertification, deleteCertification } from '../lib/api';
import type { Education, EducationFormData } from '../types/education';
import type { Certification, CertificationFormData } from '../types/certification';
import { Experience, ExperienceFormData } from '../types/experience';
import { experienceService } from '../services/experienceService';
import { connectionService } from "../services/connectionService";

interface ProfileProps {
  id?: string;
}

async function fetchCandidateProfile(candidateId: string) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    if (!apiUrl) {
      throw new Error("API URL is not configured. Please check your .env file.");
    }

    const response = await fetch(`${apiUrl}/api/candidates/${candidateId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const data = await response.json();
    return {
      ...data,
      profilePicture: data.photo || null,
      education: data.education || [],
      certifications: data.certifications || [],
      experiences: data.experiences || []
    };
  } catch (error) {
    console.error('Profile fetch error:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to fetch profile data.",
      variant: "destructive",
    });
    return null;
  }
}

async function deleteCandidateProfile(candidateId: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/candidates/${candidateId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete profile");
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete profile.",
      variant: "destructive",
    });
    return false;
  }
}

const initialProfile: ProfileData = {
  id: 0,
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@email.com",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  title: "Computer Science Student",
  company: "Paris University",
  website: "alexjohnson.dev",
  about: "Computer Science student passionate about web development and UX design. Looking for internship opportunities to apply my technical skills and gain professional experience.",
  education: [
    {
      id: 1,
      degree: "Bachelor of Computer Science",
      institution: "Paris University",
      startDate: "2020-09-01",
      endDate: "2024-06-30",
      description: "Specializing in software development and data structures. Coursework includes algorithms, web development, database management, and mobile application development."
    },
    {
      id: 2,
      degree: "High School Diploma",
      institution: "Lycée International de Paris",
      startDate: "2017-09-01",
      endDate: "2020-06-30",
      description: "Scientific track with focus on mathematics and computer science. Graduated with honors."
    }
  ],
  skills: [
    "JavaScript",
    "React",
    "TypeScript",
    "Java",
    "Spring Boot",
    "SQL"
  ],
  languages: [
    { language: "English", proficiency: "Fluent" },
    { language: "French", proficiency: "Native" },
    { language: "Spanish", proficiency: "Intermediate" }
  ],
  profilePicture: null
};

const Profile = ({ id }: ProfileProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: "Just completed my project on React and TypeScript. Excited to share more about what I've learned! #WebDevelopment #ReactJS",
      authorId: 1,
      image: null,
      createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likeCount: 12,
      commentCount: 3,
    },
    {
      id: 2,
      content: "Looking for recommendations on advanced JavaScript courses. Has anyone taken any good ones recently?",
      authorId: 1,
      image: null,
      createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      likeCount: 5,
      commentCount: 7,
    },
  ]);

  // Section editing states
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [showCertificationDialog, setShowCertificationDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);

  // Temporary state for form values to prevent re-renders
  const [tempEducation, setTempEducation] = useState<EducationFormData | null>(null);
  const [tempCertification, setTempCertification] = useState<Certification | null>(null);
  const [tempExperience, setTempExperience] = useState<ExperienceFormData | null>(null);

  // Profile state
  const [profile, setProfile] = useState<ProfileData>(initialProfile);

  // Define certifications and experiences as part of the profile state
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: 1,
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "Jan 2023",
      credentialId: "AWS-123456",
      url: "https://aws.amazon.com/certification"
    },
    {
      id: 2,
      name: "Google Cloud Professional Data Engineer",
      issuer: "Google Cloud",
      date: "Mar 2023",
      credentialId: "GCP-789012",
      url: "https://cloud.google.com/certification"
    }
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "TechCorp",
      location: "Paris, France",
      startDate: "Jun 2022",
      endDate: "Aug 2022",
      description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to implement new features and improve existing ones."
    },
    {
      id: 2,
      title: "Research Assistant",
      company: "Paris University",
      location: "Paris, France",
      startDate: "Sep 2021",
      endDate: "May 2022",
      description: "Conducted research in machine learning and data analysis. Assisted in writing research papers and preparing presentations."
    }
  ]);

  // Define state for profile editing form
  const [tempProfile, setTempProfile] = useState({...profile});

  const [, navigate] = useLocation();

  // Add this near the top where other state variables are defined
  const [educations, setEducations] = useState<Education[]>([]);

  // Add state for connection status in Profile component
  const [connectionStatus, setConnectionStatus] = useState<"none" | "pending" | "connected">("none");

  // Add a function to check connection status
  const checkConnectionStatus = async (profileId: number) => {
    if (!user || !user.id || user.id === profileId) return;
    
    try {
      const status = await connectionService.checkConnectionStatus(user.id, profileId);
      setConnectionStatus(status.status.toLowerCase() as "none" | "pending" | "connected");
    } catch (error) {
      console.error("Error checking connection status:", error);
      setConnectionStatus("none");
    }
  };

  // Add this to the useEffect that loads profile data
  useEffect(() => {
    if (id && user && user.id !== parseInt(id)) {
      const profileId = parseInt(id);
      checkConnectionStatus(profileId);
    }
  }, [id, user]);

  // Add this to your useEffect section
  useEffect(() => {
    if (profile.id) {
      fetchEducations();
    }
  }, [profile.id]);

  const fetchEducations = async () => {
    try {
      const data = await getEducationList(profile.id);
      setEducations(data);
    } catch (error) {
      console.error('Failed to fetch educations:', error);
      toast({
        title: "Error",
        description: "Failed to load education history.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    document.title = `${profile.firstName} ${profile.lastName} | StageConnect`;
  }, [profile.firstName, profile.lastName]);

  useEffect(() => {
    if (id) {
      fetchCandidateProfile(id).then(data => {
        if (data) {
          setProfile(prev => ({
            ...prev,
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            title: data.title,
            company: data.companyOrUniversity,
            website: data.website,
            about: data.about,
            profilePicture: data.profilePicture,
            education: data.education
          }));
          setEducations(data.education || []);
          setCertifications(data.certifications || []);
          setExperiences(data.experiences || []);
        }
      });
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }));
    }
  }, [id, user]);

  useEffect(() => {
    if (user && id) {
      setIsOwner(user.id === parseInt(id));
    } else if (user && !id) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, id]);

  const handleProfileUpdate = () => {
    // Update the main profile state with the temporary profile data
    setProfile(prev => ({
      ...prev,
      ...tempProfile,
      // Ensure we keep the arrays that might not be in tempProfile
      education: prev.education,
      skills: prev.skills,
      languages: prev.languages
    }));
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleStartEditing = () => {
    setTempProfile({...profile});
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setTempProfile({...profile});
    setIsEditing(false);
  };

  const handleAddPost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEducation: EducationFormData = {
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setEditingEducation(null);
    setTempEducation(newEducation);
    setShowEducationDialog(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setTempEducation({
      degree: edu.degree,
      institution: edu.institution,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description
    });
    setShowEducationDialog(true);
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await deleteEducation(profile.id, id);
      await fetchEducations(); // Refresh the education list
      toast({
        title: "Success",
        description: "Education entry deleted successfully."
      });
    } catch (error) {
      console.error('Failed to delete education:', error);
      toast({
        title: "Error",
        description: "Failed to delete education entry.",
        variant: "destructive"
      });
    }
  };

  const handleSaveEducation = async () => {
    if (!tempEducation) return;

    try {
      let savedEducation: Education;
      if (editingEducation?.id) {
        savedEducation = await updateEducation(profile.id, editingEducation.id, tempEducation);
      } else {
        savedEducation = await createEducation(profile.id, tempEducation);
      }

      await fetchEducations(); // Refresh the education list
      handleCloseEducationDialog();
      toast({
        title: "Success",
        description: `Education ${editingEducation?.id ? 'updated' : 'added'} successfully.`
      });
    } catch (error) {
      console.error('Failed to save education:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingEducation?.id ? 'update' : 'add'} education.`,
        variant: "destructive"
      });
    }
  };

  const handleCloseEducationDialog = () => {
    setShowEducationDialog(false);
    setEditingEducation(null);
    setTempEducation(null);
  };

  // Certification handlers
  const handleAddCertification = () => {
    setEditingCertification(null);
    setTempCertification({
      id: 0,
      name: "",
      issuer: "",
      date: "",
      credentialId: "",
      url: ""
    });
    setShowCertificationDialog(true);
  };

  const handleEditCertification = (cert: Certification) => {
    setEditingCertification(cert);
    setTempCertification(cert);
    setShowCertificationDialog(true);
  };

  const handleDeleteCertification = async (id: number) => {
    try {
      await deleteCertification(profile.id, id);
      // Refresh certifications list
      const updatedCertifications = await getCertificationList(profile.id);
      setCertifications(updatedCertifications);
      toast({
        title: "Success",
        description: "Certification deleted successfully."
      });
    } catch (error) {
      console.error('Failed to delete certification:', error);
      toast({
        title: "Error",
        description: "Failed to delete certification.",
        variant: "destructive"
      });
    }
  };

  const handleSaveCertification = async () => {
    if (!tempCertification) return;

    try {
      let savedCertification: Certification;
      if (editingCertification?.id) {
        savedCertification = await updateCertification(profile.id, editingCertification.id, tempCertification);
      } else {
        savedCertification = await createCertification(profile.id, tempCertification);
      }

      // Refresh certifications list
      const updatedCertifications = await getCertificationList(profile.id);
      setCertifications(updatedCertifications);

      handleCloseCertificationDialog();
      toast({
        title: "Success",
        description: `Certification ${editingCertification?.id ? 'updated' : 'added'} successfully.`
      });
    } catch (error) {
      console.error('Failed to save certification:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingCertification?.id ? 'update' : 'add'} certification.`,
        variant: "destructive"
      });
    }
  };

  const handleCloseCertificationDialog = () => {
    setShowCertificationDialog(false);
    setEditingCertification(null);
    setTempCertification(null);
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExperience: ExperienceFormData = {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setEditingExperience(null);
    setTempExperience(newExperience);
    setShowExperienceDialog(true);
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience(exp);
    setTempExperience({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: format(new Date(exp.startDate), 'yyyy-MM-dd'),
      endDate: exp.endDate ? format(new Date(exp.endDate), 'yyyy-MM-dd') : undefined,
      description: exp.description
    });
    setShowExperienceDialog(true);
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await experienceService.deleteExperience(profile.id, id);
      setExperiences(prev => prev.filter(exp => exp.id !== id));
      toast({
        title: "Experience deleted",
        description: "Experience has been deleted successfully."
      });
    } catch (error) {
      console.error('Failed to delete experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveExperience = async () => {
    if (!tempExperience) return;
    
    try {
      let savedExperience: Experience;
      if (editingExperience?.id) {
        savedExperience = await experienceService.updateExperience(profile.id, editingExperience.id, tempExperience);
        setExperiences(prev => prev.map(exp => 
          exp.id === editingExperience.id ? savedExperience : exp
        ));
      } else {
        savedExperience = await experienceService.createExperience(profile.id, tempExperience);
        setExperiences(prev => [...prev, savedExperience]);
      }
      setShowExperienceDialog(false);
      setEditingExperience(null);
      setTempExperience(null);
      toast({
        title: "Success",
        description: `Experience ${editingExperience ? 'updated' : 'added'} successfully.`
      });
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingExperience ? 'update' : 'add'} experience. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleCloseExperienceDialog = () => {
    setShowExperienceDialog(false);
    setEditingExperience(null); 
    setTempExperience(null);
  };

  // Update CV data to use the new states
  const cvData = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    title: profile.title,
    company: profile.company,
    summary: profile.about,
    education: profile.education,
    skills: profile.skills.map((skill, index) => ({
      id: index + 1,
      name: skill
    })),
    certifications: certifications,
    experiences: experiences
  };

  const handleConnect = async (profileId: string) => {
    try {
      const parsedProfileId = parseInt(profileId);
      
      if (!user || !user.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to connect with other users.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if already connected
      if (connectionStatus === "connected") {
        toast({
          title: "Already Connected",
          description: "You are already connected with this user.",
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

  const handleMessage = (profileId: string) => {
    const parsedProfileId = parseInt(profileId);
    // Navigate to messaging page with the selected user
    navigate(`/messaging?user=${parsedProfileId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {isEditing && isOwner ? (
        <ProfileEditForm 
          tempProfile={tempProfile}
          setTempProfile={setTempProfile}
          handleCancelEditing={handleCancelEditing}
          handleProfileUpdate={handleProfileUpdate}
        />
      ) : (
        <div className="mb-6">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-500"></div>
            <CardContent className="relative">
              <div className="absolute -top-16 left-4 md:left-8">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage 
                    src={typeof profile.profilePicture === 'string' ? `${profile.profilePicture}` : undefined}
                    alt={`${profile.firstName} ${profile.lastName}`} 
                  />
                  <AvatarFallback>{profile.firstName[0]}{profile.lastName[0]}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="pt-20 md:pt-16 md:ml-40 flex flex-col md:flex-row md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                  <p className="text-neutral-600">{profile.title} at {profile.company}</p>
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-1 md:space-y-0 mt-2 text-sm text-neutral-500">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-1" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.website && (
                      <div className="flex items-center">
                        <GlobeIcon className="h-4 w-4 mr-1" />
                        <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {isOwner ? (
                  <Button onClick={handleStartEditing}>
                    <PenIcon className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant={connectionStatus === "connected" ? "outline" : "default"}
                      disabled={connectionStatus === "pending"}
                      onClick={() => handleConnect(profile.id.toString())}
                    >
                      {connectionStatus === "connected" && <CheckIcon className="h-4 w-4 mr-2" />}
                      {connectionStatus === "pending" && "Request Pending"}
                      {connectionStatus === "none" && <UserPlusIcon className="h-4 w-4 mr-2" />}
                      {connectionStatus === "connected" ? "Connected" : connectionStatus === "none" ? "Connect" : ""}
                    </Button>
                    {connectionStatus === "connected" && (
                      <Button variant="outline" onClick={() => handleMessage(profile.id.toString())}>
                        <MessageCircleIcon className="h-4 w-4 mr-2" /> Message
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="w-full">
        <Tabs defaultValue="posts">
          <TabsList className="mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
            <TabsTrigger value="cv">CV</TabsTrigger>
            <TabsTrigger value="cover-letter">Lettre de motivation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <div className="space-y-4">
              {isOwner && <CreatePost onAddPost={handleAddPost} />}
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              {posts.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-neutral-500">No posts yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="education">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Education</CardTitle>
                {isOwner && (
                <Button size="sm" variant="outline" onClick={handleAddEducation}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add
                </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border-b border-neutral-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start">
                      <div className="rounded-md bg-neutral-100 p-2 mr-4">
                        <GraduationCapIcon className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-primary-600">{edu.institution}</p>
                        <p className="text-sm text-neutral-500">
                          {format(new Date(edu.startDate), 'MMM yyyy')} - {edu.endDate ? format(new Date(edu.endDate), 'MMM yyyy') : 'Present'}
                        </p>
                        {edu.description && (
                          <p className="mt-2 text-sm text-neutral-600">{edu.description}</p>
                        )}
                      </div>
                      {isOwner && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditEducation(edu)}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteEducation(edu.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      )}
                    </div>
                  </div>
                ))}
                {educations.length === 0 && (
                  <div className="text-center py-4 text-neutral-500">
                    No education added yet.
                  </div>
                )}
              </CardContent>
            </Card>
            <EducationDialog
              showEducationDialog={showEducationDialog}
              handleCloseEducationDialog={handleCloseEducationDialog}
              editingEducation={editingEducation}
              tempEducation={tempEducation}
              setTempEducation={setTempEducation}
              handleSaveEducation={handleSaveEducation}
            />
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Certifications</CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddCertification}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="border-b border-neutral-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start">
                      <div className="rounded-md bg-neutral-100 p-2 mr-4">
                        <AwardIcon className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{cert.name}</h3>
                        <p className="text-primary-600">{cert.issuer}</p>
                        <p className="text-sm text-neutral-500">Issued {cert.date} • Credential ID: {cert.credentialId}</p>
                        {cert.url && (
                          <a 
                            href={cert.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline text-sm mt-1 inline-block"
                          >
                            View credential
                          </a>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditCertification(cert)}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteCertification(cert.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {certifications.length === 0 && (
                  <div className="text-center py-4 text-neutral-500">
                    No certifications added yet. Click 'Add' to include your certifications.
                  </div>
                )}
              </CardContent>
            </Card>
            <CertificationDialog 
              showCertificationDialog={showCertificationDialog}
              handleCloseCertificationDialog={handleCloseCertificationDialog}
              editingCertification={editingCertification}
              tempCertification={tempCertification}
              setTempCertification={setTempCertification}
              handleSaveCertification={handleSaveCertification}
            />
          </TabsContent>

          <TabsContent value="experiences">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Work Experience</CardTitle>
                <Button size="sm" variant="outline" onClick={handleAddExperience}>
                  <PlusIcon className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-b border-neutral-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start">
                      <div className="rounded-md bg-neutral-100 p-2 mr-4">
                        <BriefcaseIcon className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{exp.title}</h3>
                        <p className="text-primary-600">{exp.company}</p>
                        <p className="text-sm text-neutral-500">{exp.location} • {exp.startDate} - {exp.endDate}</p>
                        <p className="mt-2 text-sm text-neutral-600">{exp.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditExperience(exp)}
                        >
                          <PenIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <div className="text-center py-4 text-neutral-500">
                    No work experience added yet. Click 'Add' to include your work experience.
                  </div>
                )}
              </CardContent>
            </Card>
            <ExperienceDialog 
              showExperienceDialog={showExperienceDialog}
              handleCloseExperienceDialog={handleCloseExperienceDialog}
              editingExperience={editingExperience}
              tempExperience={tempExperience}
              setTempExperience={setTempExperience}
              handleSaveExperience={handleSaveExperience}
            />
          </TabsContent>

          <TabsContent value="cv">
            <CVGenerator data={cvData} />
          </TabsContent>

          <TabsContent value="cover-letter">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Lettre de motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 rounded-lg">
                  <FileTextIcon className="h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-500 mb-4">Upload your cover letter to make it visible to recruiters</p>
                  <Button>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload Cover Letter
                  </Button>
                  <p className="text-xs text-neutral-400 mt-2">PDF, DOC, DOCX (max. 5MB)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
