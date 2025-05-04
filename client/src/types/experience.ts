export interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  candidateId?: number;
}

export interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
} 