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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { 
  BriefcaseIcon, 
  PlusCircleIcon, 
  MapPinIcon, 
  ClockIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingIcon, 
  SearchIcon, 
  FilterIcon,
  EyeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  GraduationCapIcon,
  UserIcon,
} from "lucide-react";
import { internshipSchema, type Internship } from "@/schema";

// Form schema for adding/editing internships
const formSchema = internshipSchema.extend({
  requirements: z.string().min(10, { message: "Requirements must be at least 10 characters" }),
  responsibilities: z.string().min(10, { message: "Responsibilities must be at least 10 characters" }),
  applicationDeadline: z.string().min(1, { message: "Application deadline is required" }),
  isRemote: z.boolean().default(false),
  isActive: z.boolean().default(true),
  department: z.string().min(2, { message: "Department is required" }),
  employerId: z.number(),
});

type ApplicationWithDetails = {
  id: string;
  internshipId: string;
  applicantId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  }
};

export function ManageInternships() {
  const { user } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Get internships for the employer
  const { data: internships = [], isLoading } = useQuery({
    queryKey: ['/api/employer/internships', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const data = await apiRequest(`/api/employer/${user.id}/internships`);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching internships:", error);
        return [];
      }
    },
    enabled: !!user?.id && user.role === "employer"
  });

  // Create internship mutation
  const createInternshipMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest('/api/internships', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employer/internships'] });
      setOpenCreateDialog(false);
      toast({
        title: "Internship Created",
        description: "Your internship has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating internship:", error);
      toast({
        title: "Error",
        description: "Failed to create internship. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update internship mutation
  const updateInternshipMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<z.infer<typeof formSchema>> }) => {
      return apiRequest(`/api/internships/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employer/internships'] });
      setOpenEditDialog(false);
      toast({
        title: "Internship Updated",
        description: "Your internship has been updated successfully."
      });
    },
    onError: (error) => {
      console.error("Error updating internship:", error);
      toast({
        title: "Error",
        description: "Failed to update internship. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete internship mutation
  const deleteInternshipMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/internships/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employer/internships'] });
      setOpenDeleteDialog(false);
      toast({
        title: "Internship Deleted",
        description: "The internship has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error("Error deleting internship:", error);
      toast({
        title: "Error",
        description: "Failed to delete internship. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Form for creating new internships
  const createForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: user?.company || "",
      location: "",
      description: "",
      requirements: "",
      responsibilities: "",
      salary: "",
      applicationDeadline: new Date().toISOString().split('T')[0],
      isRemote: false,
      isActive: true,
      department: "",
      employerId: user?.id || 0,
    },
  });

  // Form for editing internships
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: "",
      responsibilities: "",
      salary: "",
      applicationDeadline: "",
      isRemote: false,
      isActive: true,
      department: "",
      employerId: user?.id || 0,
    },
  });

  // Handle form submission for creating internships
  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    createInternshipMutation.mutate(values);
  };

  // Handle form submission for editing internships
  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (selectedInternship) {
      updateInternshipMutation.mutate({ 
        id: selectedInternship.id, 
        data: values 
      });
    }
  };

  // Handle edit internship click
  const handleEditInternship = (internship: Internship) => {
    setSelectedInternship(internship);
    editForm.reset({
      title: internship.title,
      company: internship.company,
      location: internship.location,
      description: internship.description,
      requirements: internship.requirements,
      responsibilities: internship.responsibilities,
      salary: internship.salary || "",
      applicationDeadline: internship.applicationDeadline ? 
        new Date(internship.applicationDeadline).toISOString().split('T')[0] : "",
      isRemote: internship.isRemote,
      isActive: internship.isActive,
      department: internship.department,
      employerId: internship.employerId,
    });
    setOpenEditDialog(true);
  };

  // Handle delete internship click
  const handleDeleteInternship = (internship: Internship) => {
    setSelectedInternship(internship);
    setOpenDeleteDialog(true);
  };

  // View applications for an internship
  const viewApplications = (internship: Internship) => {
    setSelectedInternship(internship);
    
    // Fetch applications for this internship
    const fetchApplications = async () => {
      try {
        const appData = await apiRequest(`/api/applications/internship/${internship.id}`);
        
        if (Array.isArray(appData)) {
          // For each application, fetch the applicant details
          const appsWithDetails = await Promise.all(appData.map(async (app) => {
            try {
              const applicantData = await apiRequest(`/api/users/${app.applicantId}`);
              return { ...app, applicant: applicantData };
            } catch (error) {
              console.error("Error fetching applicant details:", error);
              return app;
            }
          }));
          
          setApplications(appsWithDetails);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      }
    };
    
    fetchApplications();
    setOpenViewDialog(true);
  };

  // Filter internships by search term and status
  const filteredInternships = Array.isArray(internships) ? 
    internships.filter((internship: Internship) => {
      // Filter by search term
      const searchMatch = 
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const statusMatch = 
        filterStatus === "all" || 
        (filterStatus === "active" && internship.isActive) ||
        (filterStatus === "inactive" && !internship.isActive);
      
      return searchMatch && statusMatch;
    }) : 
    [];

  // Filter applications by status
  const filteredApplications = applications.filter((app: ApplicationWithDetails) => {
    return filterStatus === "all" || app.status === filterStatus;
  });

  if (!user || user.role !== "employer") {
    return (
      <div className="text-center py-10">
        <p>You need to be signed in as an employer to manage internships.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Manage Internships</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search internships..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <span className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>{filterStatus === "all" ? "All Status" : 
                       filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setOpenCreateDialog(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Internship
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading internships...</p>
        </div>
      ) : filteredInternships.length === 0 ? (
        <div className="bg-muted p-10 text-center rounded-lg">
          <BriefcaseIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Internships Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" 
              ? "No internships match your search criteria. Try adjusting your filters."
              : "You haven't created any internships yet. Click the button below to get started."}
          </p>
          <Button onClick={() => setOpenCreateDialog(true)}>
            <PlusCircleIcon className="h-4 w-4 mr-2" /> Create Your First Internship
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          {["active", "inactive", "all"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
              {filteredInternships
                .filter((internship: Internship) => 
                  tabValue === "all" || 
                  (tabValue === "active" && internship.isActive) || 
                  (tabValue === "inactive" && !internship.isActive)
                )
                .map((internship: Internship) => (
                  <Card key={internship.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{internship.title}</h3>
                            {internship.isRemote && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-none">
                                Remote
                              </Badge>
                            )}
                            <Badge variant={internship.isActive ? "default" : "secondary"}>
                              {internship.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <BuildingIcon className="h-4 w-4" />
                            {internship.company} · {internship.department}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewApplications(internship)}
                          >
                            <UsersIcon className="h-4 w-4 mr-1" /> Applications
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditInternship(internship)}
                          >
                            <PencilIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive border-destructive hover:bg-destructive hover:text-white" 
                            onClick={() => handleDeleteInternship(internship)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{internship.location}</span>
                        </div>
                        {internship.salary && (
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 text-muted-foreground">$</span>
                            <span>{internship.salary}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Deadline: {internship.applicationDeadline && 
                              format(new Date(internship.applicationDeadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="line-clamp-3 text-sm text-muted-foreground mb-2">
                        {internship.description}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t pt-3">
                      <div className="text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Created: {internship.createdAt && format(new Date(internship.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => {
                            // Toggle active status
                            if (internship) {
                              updateInternshipMutation.mutate({
                                id: internship.id,
                                data: { isActive: !internship.isActive }
                              });
                            }
                          }}
                        >
                          {internship.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
                
              {filteredInternships.filter((internship: Internship) => 
                tabValue === "all" || 
                (tabValue === "active" && internship.isActive) || 
                (tabValue === "inactive" && !internship.isActive)
              ).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No {tabValue} internships found.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Create Internship Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Internship</DialogTitle>
            <DialogDescription>
              Add a new internship listing for your company.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. UX/UI Design Intern" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Design" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary/Stipend</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $15/hour or $3000/month" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="applicationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isRemote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remote Position</FormLabel>
                        <FormDescription>
                          Is this a remote internship position?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Listing</FormLabel>
                        <FormDescription>
                          Make this internship visible to students
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of the internship..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the key responsibilities for this role..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List the requirements and qualifications..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createInternshipMutation.isPending}
                >
                  {createInternshipMutation.isPending ? "Creating..." : "Create Internship"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Internship Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedInternship && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Internship</DialogTitle>
                <DialogDescription>
                  Update the details of this internship listing.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position Title*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salary/Stipend</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="applicationDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Application Deadline*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="isRemote"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remote Position</FormLabel>
                            <FormDescription>
                              Is this a remote internship position?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active Listing</FormLabel>
                            <FormDescription>
                              Make this internship visible to students
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities*</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements*</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpenEditDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateInternshipMutation.isPending}
                    >
                      {updateInternshipMutation.isPending ? "Updating..." : "Update Internship"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Internship Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          {selectedInternship && (
            <>
              <DialogHeader>
                <DialogTitle>Delete Internship</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this internship listing? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="font-medium">{selectedInternship.title}</p>
                <p className="text-sm text-muted-foreground">{selectedInternship.company} · {selectedInternship.department}</p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteInternshipMutation.mutate(selectedInternship.id)}
                  disabled={deleteInternshipMutation.isPending}
                >
                  {deleteInternshipMutation.isPending ? "Deleting..." : "Delete Internship"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Applications Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedInternship && (
            <>
              <DialogHeader>
                <DialogTitle>Applications for {selectedInternship.title}</DialogTitle>
                <DialogDescription>
                  Review all applications for this internship position.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedInternship.isActive ? "default" : "secondary"}>
                    {selectedInternship.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedInternship.location}
                    {selectedInternship.isRemote && " (Remote)"}
                  </span>
                </div>
                
                <Select
                  value={filterStatus}
                  onValueChange={(value) => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application: ApplicationWithDetails) => (
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
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              variant={
                                application.status === "accepted" ? "default" :
                                application.status === "rejected" ? "destructive" :
                                application.status === "interview" ? "secondary" : 
                                "outline"
                              }
                              className="flex items-center gap-1"
                            >
                              {application.status === "accepted" && <CheckCircleIcon className="h-3 w-3" />}
                              {application.status === "rejected" && <XCircleIcon className="h-3 w-3" />}
                              {application.status === "interview" && <CalendarIcon className="h-3 w-3" />}
                              {application.status === "pending" && <ClockIcon className="h-3 w-3" />}
                              
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </Badge>
                            
                            <p className="text-xs text-muted-foreground">
                              Applied: {application.createdAt && format(new Date(application.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {application.coverLetter && (
                        <CardContent className="pt-0 pb-3">
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-1">Cover Letter</h4>
                            <p className="text-sm line-clamp-3">{application.coverLetter}</p>
                          </div>
                        </CardContent>
                      )}
                      
                      <CardFooter className="flex justify-end gap-2 pt-0">
                        {application.resumeUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => window.open(application.resumeUrl!, "_blank")}
                          >
                            <EyeIcon className="h-3 w-3 mr-1" /> Resume
                          </Button>
                        )}
                        
                        {application.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              // Update status to interview
                              fetch(`/api/applications/${application.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: "interview" })
                              })
                                .then(res => res.json())
                                .then(() => {
                                  // Refresh applications
                                  setApplications(applications.map(app => 
                                    app.id === application.id 
                                      ? { ...app, status: "interview" } 
                                      : app
                                  ));
                                  toast({
                                    title: "Application Updated",
                                    description: "Applicant moved to interview stage.",
                                  });
                                })
                                .catch(err => {
                                  console.error(err);
                                  toast({
                                    title: "Error",
                                    description: "Failed to update application status.",
                                    variant: "destructive"
                                  });
                                });
                            }}
                          >
                            <CalendarIcon className="h-3 w-3 mr-1" /> Schedule Interview
                          </Button>
                        )}
                        
                        {(application.status === "pending" || application.status === "interview") && (
                          <>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                // Update status to accepted
                                fetch(`/api/applications/${application.id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: "accepted" })
                                })
                                  .then(res => res.json())
                                  .then(() => {
                                    // Refresh applications
                                    setApplications(applications.map(app => 
                                      app.id === application.id 
                                        ? { ...app, status: "accepted" } 
                                        : app
                                    ));
                                    toast({
                                      title: "Application Accepted",
                                      description: "The applicant has been accepted for the internship.",
                                    });
                                  })
                                  .catch(err => {
                                    console.error(err);
                                    toast({
                                      title: "Error",
                                      description: "Failed to update application status.",
                                      variant: "destructive"
                                    });
                                  });
                              }}
                            >
                              <CheckCircleIcon className="h-3 w-3 mr-1" /> Accept
                            </Button>
                            
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => {
                                // Update status to rejected
                                fetch(`/api/applications/${application.id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: "rejected" })
                                })
                                  .then(res => res.json())
                                  .then(() => {
                                    // Refresh applications
                                    setApplications(applications.map(app => 
                                      app.id === application.id 
                                        ? { ...app, status: "rejected" } 
                                        : app
                                    ));
                                    toast({
                                      title: "Application Rejected",
                                      description: "The applicant has been rejected for the internship.",
                                    });
                                  })
                                  .catch(err => {
                                    console.error(err);
                                    toast({
                                      title: "Error",
                                      description: "Failed to update application status.",
                                      variant: "destructive"
                                    });
                                  });
                              }}
                            >
                              <XCircleIcon className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-muted p-8 rounded-lg text-center">
                  <GraduationCapIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This internship position hasn't received any applications yet.
                  </p>
                </div>
              )}
              
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