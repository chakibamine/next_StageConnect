export interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
  candidate?: {
    id: number;
  };
}

export interface EducationFormData {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
} 