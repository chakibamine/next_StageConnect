import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Badge 
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  UserIcon, 
  BriefcaseIcon, 
  BookOpenIcon, 
  CheckCircleIcon,
  ClipboardListIcon,
  BarChart3Icon,
  Users2Icon,
  FileTextIcon,
  CalendarIcon,
  BuildingIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  XIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MessageSquareIcon,
  AlertCircleIcon
} from "lucide-react";
import { format } from "date-fns";
import { ApplicationsManager } from "@/components/employer/ApplicationsManager";
import { ManageInternships } from "@/components/employer/ManageInternships";

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock data for supervisor dashboard
  const { data: stats = {
    totalStudents: 48,
    activeInternships: 24,
    pendingApprovals: 8,
    reviewableApplications: 15
  }} = useQuery({
    queryKey: ['/api/supervisor/stats'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      return {
        totalStudents: 48,
        activeInternships: 24,
        pendingApprovals: 8,
        reviewableApplications: 15
      };
    },
    enabled: !!user && user.role === "supervisor"
  });
  
  // Mock data for students under supervision
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['/api/supervisor/students', searchTerm, statusFilter],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      // Simulated data
      return [
        {
          id: 1,
          firstName: "Alex",
          lastName: "Johnson",
          email: "alex.johnson@example.com",
          profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          program: "Computer Science",
          year: "3rd Year",
          status: "active",
          hasInternship: true,
          internship: {
            company: "TechCorp",
            position: "Frontend Developer Intern",
            startDate: new Date(2024, 5, 15),
            endDate: new Date(2024, 8, 15),
          }
        },
        {
          id: 2,
          firstName: "Emma",
          lastName: "Davis",
          email: "emma.davis@example.com",
          profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          program: "Information Systems",
          year: "4th Year",
          status: "active",
          hasInternship: false,
          applications: [
            { company: "DataViz Inc.", position: "Data Analyst Intern", status: "pending" }
          ]
        },
        {
          id: 3,
          firstName: "Noah",
          lastName: "Wilson",
          email: "noah.wilson@example.com",
          profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          program: "Software Engineering",
          year: "3rd Year",
          status: "pending",
          hasInternship: false,
          applications: [
            { company: "CodeWave", position: "Backend Developer Intern", status: "interview" }
          ]
        },
        {
          id: 4,
          firstName: "Sophia",
          lastName: "Chen",
          email: "sophia.chen@example.com",
          profilePicture: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          program: "UI/UX Design",
          year: "4th Year",
          status: "completed",
          hasInternship: true,
          internship: {
            company: "DesignStudio",
            position: "UX Designer Intern",
            startDate: new Date(2023, 5, 1),
            endDate: new Date(2023, 8, 30),
            feedback: "Excellent performance. Contributed to key projects.",
            rating: 4.8
          }
        }
      ].filter(student => {
        // Apply search filter
        const searchMatch = 
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.program.toLowerCase().includes(searchTerm.toLowerCase());
          
        // Apply status filter
        const statusMatch = 
          statusFilter === "all" ||
          (statusFilter === "active" && student.status === "active") ||
          (statusFilter === "pending" && student.status === "pending") ||
          (statusFilter === "completed" && student.status === "completed") ||
          (statusFilter === "with_internship" && student.hasInternship) ||
          (statusFilter === "without_internship" && !student.hasInternship);
          
        return searchMatch && statusMatch;
      });
    },
    enabled: !!user && user.role === "supervisor"
  });
  
  // Mock data for pending approvals
  const { data: pendingApprovals = [], isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['/api/supervisor/approvals'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      return [
        {
          id: 1,
          type: "internship_application",
          student: {
            id: 2,
            firstName: "Emma",
            lastName: "Davis",
            profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          },
          company: "DataViz Inc.",
          position: "Data Analyst Intern",
          submittedAt: new Date(2024, 3, 10)
        },
        {
          id: 2,
          type: "cv_review",
          student: {
            id: 3,
            firstName: "Noah",
            lastName: "Wilson",
            profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          },
          submittedAt: new Date(2024, 3, 12)
        },
        {
          id: 3,
          type: "internship_completion",
          student: {
            id: 5,
            firstName: "Olivia",
            lastName: "Martinez",
            profilePicture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
          },
          company: "Innovate Solutions",
          position: "Marketing Intern",
          submittedAt: new Date(2024, 3, 8)
        },
      ];
    },
    enabled: !!user && user.role === "supervisor"
  });

  const viewStudentDetails = (student: any) => {
    setSelectedStudent(student);
    setStudentDialogOpen(true);
  };
  
  const handleApproveItem = (item: any) => {
    toast({
      title: "Item Approved",
      description: `You've approved the ${item.type.replace('_', ' ')} request.`,
    });
  };
  
  const handleRejectItem = (item: any) => {
    toast({
      title: "Item Rejected",
      description: `You've rejected the ${item.type.replace('_', ' ')} request.`,
    });
  };
  
  if (!user || user.role !== "supervisor") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Supervisor Dashboard</h1>
        <p>You must be signed in as a supervisor to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Monitor students, internships, and review applications and feedback.
      </p>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="w-full justify-start border-b pb-0">
          <TabsTrigger value="overview" className="rounded-b-none">Overview</TabsTrigger>
          <TabsTrigger value="students" className="rounded-b-none">Students</TabsTrigger>
          <TabsTrigger value="internships" className="rounded-b-none">Internships</TabsTrigger>
          <TabsTrigger value="applications" className="rounded-b-none">Applications</TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-b-none">Approvals</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-b-none">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Students Under Supervision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Users2Icon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across all programs and years
                </div>
              </CardContent>
            </Card>
            
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
                  Students currently in internships
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <ClipboardListIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Requiring your review
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Applications to Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.reviewableApplications}</div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileTextIcon className="text-primary h-5 w-5" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Student applications to assess
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student internship activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                          alt="Emma Davis"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Emma Davis</h4>
                        <p className="text-sm text-muted-foreground">Applied to DataViz Inc. for Data Analyst Intern position</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(2024, 3, 10), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                          alt="Noah Wilson"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Noah Wilson</h4>
                        <p className="text-sm text-muted-foreground">Submitted CV for review</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(2024, 3, 12), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"
                          alt="Olivia Martinez"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Olivia Martinez</h4>
                        <p className="text-sm text-muted-foreground">Completed internship at Innovate Solutions</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(2024, 3, 8), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
                <CardDescription>Items requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <AlertCircleIcon className="h-4 w-4 text-yellow-500" />
                      CV Reviews (3)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Students waiting for CV feedback</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                      Review Now
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <AlertCircleIcon className="h-4 w-4 text-red-500" />
                      Urgent Approvals (2)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Approaching deadline applications</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                      Review Now
                    </Button>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-blue-500" />
                      Monthly Reports Due
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Student progress reports due in 3 days</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full text-xs">
                      Start Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Student Management</h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <span className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4" />
                    <span>{
                      statusFilter === "all" ? "All Students" :
                      statusFilter === "active" ? "Active Students" :
                      statusFilter === "pending" ? "Pending Students" :
                      statusFilter === "completed" ? "Completed Internships" :
                      statusFilter === "with_internship" ? "With Internship" :
                      "Without Internship"
                    }</span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="active">Active Students</SelectItem>
                  <SelectItem value="pending">Pending Students</SelectItem>
                  <SelectItem value="completed">Completed Internships</SelectItem>
                  <SelectItem value="with_internship">With Internship</SelectItem>
                  <SelectItem value="without_internship">Without Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoadingStudents ? (
            <div className="text-center py-10">
              <p>Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="bg-muted p-10 text-center rounded-lg">
              <Users2Icon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Students Found</h3>
              <p className="text-muted-foreground mb-4">
                No students match your search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {student.profilePicture ? (
                            <img 
                              src={student.profilePicture} 
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          student.status === "active" ? "default" :
                          student.status === "pending" ? "secondary" :
                          "outline"
                        }
                      >
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-3">
                    <div className="grid grid-cols-2 gap-2 my-2">
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Program</h4>
                        <p className="text-sm">{student.program}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground">Year</h4>
                        <p className="text-sm">{student.year}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-muted-foreground mb-1">Internship Status</h4>
                      {student.hasInternship ? (
                        <div className="bg-green-50 border border-green-100 rounded-md p-2">
                          <p className="text-sm font-medium">{student.internship.position}</p>
                          <p className="text-xs flex items-center gap-1">
                            <BuildingIcon className="h-3 w-3 text-muted-foreground" />
                            {student.internship.company}
                          </p>
                          <p className="text-xs flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                            {format(student.internship.startDate, 'MMM d, yyyy')} - {format(student.internship.endDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                      ) : student.applications && student.applications.length > 0 ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-md p-2">
                          <p className="text-sm font-medium">{student.applications[0].position}</p>
                          <p className="text-xs flex items-center gap-1">
                            <BuildingIcon className="h-3 w-3 text-muted-foreground" />
                            {student.applications[0].company}
                          </p>
                          <p className="text-xs flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-[10px] h-4 py-0">
                              {student.applications[0].status.charAt(0).toUpperCase() + student.applications[0].status.slice(1)}
                            </Badge>
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 rounded-md p-2">
                          <p className="text-sm">No internship or applications yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => viewStudentDetails(student)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="internships">
          <ManageInternships />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsManager />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pending Approvals</h2>
          </div>
          
          {isLoadingApprovals ? (
            <div className="text-center py-10">
              <p>Loading approvals...</p>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div className="bg-muted p-10 text-center rounded-lg">
              <ClipboardListIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
              <p className="text-muted-foreground mb-4">
                There are no items waiting for your review at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {item.student.profilePicture ? (
                            <img 
                              src={item.student.profilePicture} 
                              alt={`${item.student.firstName} ${item.student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{item.student.firstName} {item.student.lastName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.type === "internship_application" && "Internship Application"}
                            {item.type === "cv_review" && "CV Review Request"}
                            {item.type === "internship_completion" && "Internship Completion"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Submitted on {format(item.submittedAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    {item.type === "internship_application" || item.type === "internship_completion" ? (
                      <div className="bg-muted p-3 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Company</h4>
                            <p className="text-sm">{item.company}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Position</h4>
                            <p className="text-sm">{item.position}</p>
                          </div>
                        </div>
                      </div>
                    ) : item.type === "cv_review" ? (
                      <div className="bg-muted p-3 rounded-md flex items-center gap-3">
                        <FileTextIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium">Resume/CV Review Request</h4>
                          <p className="text-xs text-muted-foreground">Student is requesting feedback on their CV</p>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                  
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => handleRejectItem(item)}
                    >
                      <XIcon className="h-4 w-4" /> Reject
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleApproveItem(item)}
                    >
                      <CheckIcon className="h-4 w-4" /> Approve
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          </div>
          
          <div className="bg-muted p-10 text-center rounded-lg">
            <BarChart3Icon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive reports and analytics for student internships coming soon.
            </p>
            <Button disabled>Coming Soon</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Student Details Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>Student Details</span>
                  <Badge 
                    variant={
                      selectedStudent.status === "active" ? "default" :
                      selectedStudent.status === "pending" ? "secondary" :
                      "outline"
                    }
                  >
                    {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Detailed information and management options
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {selectedStudent.profilePicture ? (
                      <img 
                        src={selectedStudent.profilePicture} 
                        alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                    <p className="text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border rounded-md p-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Program</h4>
                    <p>{selectedStudent.program}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Year</h4>
                    <p>{selectedStudent.year}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold mb-2">Internship Status</h4>
                  {selectedStudent.hasInternship ? (
                    <div className="border rounded-md p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{selectedStudent.internship.position}</h3>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                      </div>
                      <p className="text-sm flex items-center gap-1 mb-1">
                        <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        {selectedStudent.internship.company}
                      </p>
                      <p className="text-sm flex items-center gap-1 mb-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(selectedStudent.internship.startDate, 'MMM d, yyyy')} - {format(selectedStudent.internship.endDate, 'MMM d, yyyy')}
                      </p>
                      
                      {selectedStudent.internship.feedback && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-1">Feedback</h4>
                          <p className="text-sm">{selectedStudent.internship.feedback}</p>
                          {selectedStudent.internship.rating && (
                            <div className="flex items-center mt-2">
                              <span className="text-sm font-medium mr-2">Rating:</span>
                              <span className="text-sm font-bold">{selectedStudent.internship.rating}/5.0</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : selectedStudent.applications && selectedStudent.applications.length > 0 ? (
                    <div className="border rounded-md p-4 bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{selectedStudent.applications[0].position}</h3>
                        <Badge variant="secondary">{selectedStudent.applications[0].status.charAt(0).toUpperCase() + selectedStudent.applications[0].status.slice(1)}</Badge>
                      </div>
                      <p className="text-sm flex items-center gap-1 mb-3">
                        <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                        {selectedStudent.applications[0].company}
                      </p>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">Review Application</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border rounded-md p-4 bg-muted">
                      <p className="text-center py-2">No internship or applications found</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-bold mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <FileTextIcon className="h-4 w-4 mr-1" /> View CV
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquareIcon className="h-4 w-4 mr-1" /> Message
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold mb-2 text-right">Management</h4>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="default" size="sm">
                        <EyeIcon className="h-4 w-4 mr-1" /> Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setStudentDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}