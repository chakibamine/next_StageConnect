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
  MessageCircleIcon
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

// Define types for our sections
interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  url?: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

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

    return await response.json();
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
  const [tempEducation, setTempEducation] = useState<Education | null>(null);
  const [tempCertification, setTempCertification] = useState<Certification | null>(null);
  const [tempExperience, setTempExperience] = useState<Experience | null>(null);

  // Profile state
  const [profile, setProfile] = useState<ProfileData>({
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
        startDate: "Sep 2020",
        endDate: "Present",
        description: "Specializing in software development and data structures. Coursework includes algorithms, web development, database management, and mobile application development."
      },
      {
        id: 2,
        degree: "High School Diploma",
        institution: "Lycée International de Paris",
        startDate: "Sep 2017",
        endDate: "Jun 2020",
        description: "Scientific track with focus on mathematics and computer science. Graduated with honors."
      }
    ],
    skills: [
      "JavaScript",
      "React",
      "TypeScript",
      "HTML/CSS",
      "Node.js",
      "Python",
      "UI/UX Design",
      "Git",
      "SQL"
    ],
    languages: [
      { language: "English", proficiency: "Fluent" },
      { language: "French", proficiency: "Native" },
      { language: "Spanish", proficiency: "Intermediate" }
    ],
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
  });

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
            profilePicture: data.photo,
          }));
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
      // If no id is provided, it means we're viewing our own profile
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, id]);

  const handleProfileUpdate = () => {
    setProfile(tempProfile);
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
    const newEducation = {
      id: 0,
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: ""
    };
    setEditingEducation(newEducation);
    setTempEducation(newEducation);
    setShowEducationDialog(true);
  };

  const handleEditEducation = (edu: Education) => {
    setEditingEducation(edu);
    setTempEducation(edu);
    setShowEducationDialog(true);
  };

  const handleDeleteEducation = (id: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
    toast({
      title: "Education deleted",
      description: "Education entry has been removed successfully."
    });
  };

  const handleSaveEducation = () => {
    if (!tempEducation) return;
    
    if (editingEducation) {
      // Update existing education
      setProfile(prev => ({
        ...prev,
        education: prev.education.map(edu => 
          edu.id === tempEducation.id ? tempEducation : edu
        )
      }));
    } else {
      // Add new education
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, { ...tempEducation, id: prev.education.length + 1 }]
      }));
    }

    setShowEducationDialog(false);
    setEditingEducation(null);
    setTempEducation(null);
    toast({
      title: "Education updated",
      description: "Education entry has been updated successfully."
    });
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

  const handleDeleteCertification = (id: number) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
    toast({
      title: "Certification deleted",
      description: "Certification has been removed successfully."
    });
  };

  const handleSaveCertification = () => {
    if (!tempCertification) return;
    
    if (editingCertification) {
      // Update existing certification
      setCertifications(prev => prev.map(cert => 
        cert.id === tempCertification.id ? tempCertification : cert
      ));
    } else {
      // Add new certification
      setCertifications(prev => [...prev, { ...tempCertification, id: prev.length + 1 }]);
    }

    setShowCertificationDialog(false);
    setEditingCertification(null);
    setTempCertification(null);
    toast({
      title: "Certification updated",
      description: "Certification has been updated successfully."
    });
  };

  const handleCloseCertificationDialog = () => {
    setShowCertificationDialog(false);
    setEditingCertification(null);
    setTempCertification(null);
  };

  // Experience handlers
  const handleAddExperience = () => {
    setEditingExperience(null);
    setTempExperience({
      id: 0,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: ""
    });
    setShowExperienceDialog(true);
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience(exp);
    setTempExperience(exp);
    setShowExperienceDialog(true);
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    toast({
      title: "Experience deleted",
      description: "Experience has been deleted successfully."
    });
  };

  const handleSaveExperience = () => {
    if (!tempExperience) return;
    
    if (editingExperience) {
      // Update existing experience
      setExperiences(prev => prev.map(exp => 
        exp.id === tempExperience.id ? tempExperience : exp
      ));
      toast({
        title: "Experience updated",
        description: "Experience has been updated successfully."
      });
    } else {
      // Add new experience
      setExperiences(prev => [...prev, { ...tempExperience, id: prev.length + 1 }]);
      toast({
        title: "Experience added",
        description: "New experience has been added successfully."
      });
    }

    setShowExperienceDialog(false);
    setEditingExperience(null);
    setTempExperience(null);
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
      // Implement connection logic here
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
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
                  <AvatarImage src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`} />
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
                    <Button variant="outline" onClick={() => handleConnect(profile.id.toString())}>
                      <UserPlusIcon className="h-4 w-4 mr-2" /> Connect
                    </Button>
                    <Button variant="outline" onClick={() => handleMessage(profile.id.toString())}>
                      <MessageCircleIcon className="h-4 w-4 mr-2" /> Message
                    </Button>
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
                {profile.education.map((edu) => (
                  <div key={edu.id} className="border-b border-neutral-200 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start">
                      <div className="rounded-md bg-neutral-100 p-2 mr-4">
                        <GraduationCapIcon className="h-6 w-6 text-neutral-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{edu.degree}</h3>
                        <p className="text-primary-600">{edu.institution}</p>
                        <p className="text-sm text-neutral-500">{edu.startDate} - {edu.endDate}</p>
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
                {profile.education.length === 0 && (
                  <div className="text-center py-4 text-neutral-500">
                    No education added yet.
                  </div>
                )}
              </CardContent>
            </Card>
            {isOwner && (
            <EducationDialog 
              showEducationDialog={showEducationDialog}
              handleCloseEducationDialog={handleCloseEducationDialog}
              editingEducation={editingEducation}
              tempEducation={tempEducation}
              setTempEducation={setTempEducation}
              handleSaveEducation={handleSaveEducation}
            />
            )}
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
