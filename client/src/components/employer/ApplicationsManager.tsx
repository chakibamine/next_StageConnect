import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  UserIcon, 
  CalendarIcon, 
  MessageSquareIcon, 
  SearchIcon, 
  FilterIcon, 
  DownloadIcon,
  GraduationCapIcon,
  BriefcaseIcon,
} from "lucide-react";
import type { Application, Internship } from "@shared/schema";

type ApplicationWithDetails = Application & {
  applicant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  },
  internship?: Internship
};

export function ApplicationsManager() {
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const queryClient = useQueryClient();

  // Get all applications for employer's internships
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/employer/applications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const internships = await apiRequest(`/api/employer/${user.id}/internships`);
        
        if (Array.isArray(internships) && internships.length > 0) {
          // Get applications for each internship
          const allApplicationsPromises = internships.map(async (internship) => {
            const apps = await apiRequest(`/api/applications/internship/${internship.id}`);
            
            if (Array.isArray(apps)) {
              // Fetch applicant details for each application
              const appsWithDetails = await Promise.all(apps.map(async (app) => {
                try {
                  const applicant = await apiRequest(`/api/users/${app.applicantId}`);
                  return { 
                    ...app, 
                    applicant: applicant, 
                    internship: internship 
                  };
                } catch (error) {
                  console.error("Error fetching applicant details:", error);
                  return { ...app, internship: internship };
                }
              }));
              return appsWithDetails;
            }
            return [];
          });
          
          const allApplicationsArrays = await Promise.all(allApplicationsPromises);
          return allApplicationsArrays.flat();
        }
        return [];
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    },
    enabled: !!user?.id && user.role === "employer"
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      return apiRequest(`/api/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employer/applications'] });
      toast({
        title: "Application Updated",
        description: "The application status has been updated successfully."
      });
      setOpenViewDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive"
      });
    }
  });

  // View application details
  const handleViewApplication = (application: ApplicationWithDetails) => {
    setSelectedApplication(application);
    setOpenViewDialog(true);
  };

  // Update application status
  const handleUpdateStatus = (status: string) => {
    if (selectedApplication) {
      updateApplicationStatusMutation.mutate({ 
        id: selectedApplication.id, 
        status 
      });
    }
  };

  // Filter applications
  const filteredApplications = applications.filter((app: ApplicationWithDetails) => {
    // Filter by search term
    const searchMatch = 
      app.applicant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    
    // Filter by status
    const statusMatch = filterStatus === "all" || app.status === filterStatus;
    
    return searchMatch && statusMatch;
  });

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3" /> Pending
        </Badge>;
      case "interview":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <CalendarIcon className="h-3 w-3" /> Interview
        </Badge>;
      case "accepted":
        return <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3" /> Accepted
        </Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircleIcon className="h-3 w-3" /> Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user || user.role !== "employer") {
    return (
      <div className="text-center py-10">
        <p>You need to be signed in as an employer to view applications.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Applications Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              className="pl-9 w-full md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-40">
              <span className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>{filterStatus === "all" ? "All Status" : 
                       filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-muted p-10 text-center rounded-lg">
          <GraduationCapIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "No applications match your search criteria. Try adjusting your filters."
              : "When students apply to your internship positions, you'll see their applications here."}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          {["pending", "interview", "accepted", "rejected", "all"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {filteredApplications
                .filter((app: ApplicationWithDetails) => 
                  tabValue === "all" || app.status === tabValue
                )
                .map((application: ApplicationWithDetails) => (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {application.applicant?.profilePicture ? (
                              <img 
                                src={application.applicant.profilePicture} 
                                alt={`${application.applicant?.firstName} ${application.applicant?.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-medium">
                              {application.applicant?.firstName} {application.applicant?.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {application.applicant?.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {renderStatusBadge(application.status)}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewApplication(application)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Applied For</h4>
                          <p className="text-sm flex items-center gap-1">
                            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                            {application.internship?.title}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Company</h4>
                          <p className="text-sm">
                            {application.internship?.company}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Applied On</h4>
                          <p className="text-sm flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            {application.createdAt && format(new Date(application.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      {application.coverLetter && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-1">Cover Letter (Preview)</h4>
                          <p className="text-sm line-clamp-2">{application.coverLetter}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
              {filteredApplications.filter((app: ApplicationWithDetails) => 
                tabValue === "all" || app.status === tabValue
              ).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No {tabValue === "all" ? "" : tabValue} applications found.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Application Details Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex justify-between">
                  <span>Application Details</span>
                  {renderStatusBadge(selectedApplication.status)}
                </DialogTitle>
                <DialogDescription>
                  Review and process this application
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      {selectedApplication.applicant?.profilePicture ? (
                        <img 
                          src={selectedApplication.applicant.profilePicture} 
                          alt={`${selectedApplication.applicant?.firstName} ${selectedApplication.applicant?.lastName}`}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg">
                        {selectedApplication.applicant?.firstName} {selectedApplication.applicant?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedApplication.applicant?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border p-3 rounded-md bg-muted/20">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Position</h4>
                    <p className="text-sm font-medium">
                      {selectedApplication.internship?.title}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Company</h4>
                    <p className="text-sm">
                      {selectedApplication.internship?.company}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Application Date</h4>
                    <p className="text-sm">
                      {selectedApplication.createdAt && format(new Date(selectedApplication.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <p className="text-sm">
                      {selectedApplication.internship?.location}
                    </p>
                  </div>
                </div>
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="font-medium mb-2">Cover Letter</h4>
                    <div className="border p-4 rounded-md bg-muted/20 text-sm whitespace-pre-line">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}
                
                {selectedApplication.resumeUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Resume</h4>
                    <a 
                      href={selectedApplication.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Download Resume
                    </a>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Change Application Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedApplication.status === "pending" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleUpdateStatus("pending")}
                      disabled={updateApplicationStatusMutation.isPending}
                    >
                      <ClockIcon className="h-4 w-4 mr-1" /> Pending
                    </Button>
                    <Button 
                      variant={selectedApplication.status === "interview" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleUpdateStatus("interview")}
                      disabled={updateApplicationStatusMutation.isPending}
                    >
                      <CalendarIcon className="h-4 w-4 mr-1" /> Schedule Interview
                    </Button>
                    <Button 
                      variant={selectedApplication.status === "accepted" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleUpdateStatus("accepted")}
                      disabled={updateApplicationStatusMutation.isPending}
                      className={selectedApplication.status === "accepted" ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" /> Accept
                    </Button>
                    <Button 
                      variant={selectedApplication.status === "rejected" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleUpdateStatus("rejected")}
                      disabled={updateApplicationStatusMutation.isPending}
                      className={selectedApplication.status === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    disabled={true} // Placeholder for future functionality
                  >
                    <MessageSquareIcon className="h-4 w-4" />
                    Send Message (Coming Soon)
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenViewDialog(false)}>
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