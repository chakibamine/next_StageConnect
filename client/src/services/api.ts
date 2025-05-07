import { API_BASE_URL } from '@/config';

// Types
export interface Internship {
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
  description: string;
  requirements: string;
  company: {
    id: number;
    name: string;
    logo: string;
  };
}

export interface Application {
  id: number;
  internshipId: number;
  userId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  resumeUrl?: string;
  availableStartDate?: string;
  questionAnswers?: Record<string, string>;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// API Services
export const internshipApi = {
  getInternships: async (companyId: string, status?: string, page = 0, size = 10): Promise<PaginatedResponse<Internship>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships?${new URLSearchParams({
          ...(status && { status }),
          page: page.toString(),
          size: size.toString(),
        })}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internships: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  },

  getInternship: async (companyId: string, internshipId: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  },
  getInternshipbyid: async (internshipId: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/internships/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  },

  createInternship: async (companyId: string, internshipData: Partial<Internship>): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(internshipData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create internship: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  },

  updateInternship: async (companyId: string, internshipId: string, internshipData: Partial<Internship>): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(internshipData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update internship: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  },

  deleteInternship: async (companyId: string, internshipId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete internship: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  },

  updateStatus: async (companyId: string, internshipId: string, status: string): Promise<Internship> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/companies/${companyId}/internships/${internshipId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update internship status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating internship status:', error);
      throw error;
    }
  },

  getInternshipById: async (internshipId: string): Promise<Internship> => {
    console.log(`Fetching internship with ID: ${internshipId}`);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/internships/id/${internshipId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch internship: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Internship data received:", data);
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Internship not found');
      }
    } catch (error) {
      console.error('Error fetching internship by id:', error);
      throw error;
    }
  },
};

export const applicationApi = {
  submitApplication: async (internshipId: string, applicationData: any): Promise<any> => {
    try {
      // Format the data to match what the backend expects
      const requestData = {
        user_id: applicationData.userId || applicationData.user_id,
        coverLetter: applicationData.coverLetter,
        resumeUrl: applicationData.resumeUrl,
        availableStartDate: applicationData.availableStartDate,
        questionAnswers: applicationData.questionAnswers
      };

      console.log('Submitting application with data:', requestData);
      
      const response = await fetch(
        `${API_BASE_URL}/api/applications/internships/${internshipId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Application submission failed:', data);
        throw new Error(data.message || `Failed to submit application: ${response.statusText}`);
      }

      console.log('Application submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },

  getApplications: async (internshipId: string, page = 0, size = 10, status?: string): Promise<PaginatedResponse<Application>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/internships/${internshipId}?${new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          ...(status && { status }),
        })}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId: string, status: string, feedback?: string): Promise<Application> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, feedback }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update application status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  deleteApplication: async (applicationId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/applications/${applicationId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete application: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },
}; 