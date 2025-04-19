import { type Internship, type ApplicationWithDetails } from "@/schema";

// Mock data storage
let internships: Internship[] = [];
let applications: ApplicationWithDetails[] = [];

export const mockApi = {
  // Internship operations
  getInternships: async () => {
    return internships;
  },

  createInternship: async (data: Omit<Internship, "id">) => {
    const newInternship = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    internships.push(newInternship);
    return newInternship;
  },

  updateInternship: async (id: string, data: Partial<Internship>) => {
    const index = internships.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Internship not found");
    internships[index] = { ...internships[index], ...data };
    return internships[index];
  },

  deleteInternship: async (id: string) => {
    internships = internships.filter(i => i.id !== id);
    return true;
  },

  // Application operations
  getApplications: async (internshipId: string) => {
    return applications.filter(a => a.internshipId === internshipId);
  },

  createApplication: async (data: Omit<ApplicationWithDetails, "id" | "createdAt" | "updatedAt">) => {
    const newApplication = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applications.push(newApplication);
    return newApplication;
  },

  updateApplication: async (id: string, data: Partial<ApplicationWithDetails>) => {
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Application not found");
    applications[index] = { 
      ...applications[index], 
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return applications[index];
  },
}; 