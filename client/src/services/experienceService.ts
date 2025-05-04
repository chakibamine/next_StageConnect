import { Experience, ExperienceFormData } from '@/types/experience';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ExperienceService {
  async getExperienceList(candidateId: number): Promise<Experience[]> {
    const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/experiences`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch experiences');
    }
    return response.json();
  }

  async createExperience(candidateId: number, experience: ExperienceFormData): Promise<Experience> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/experiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...experience,
          candidateId: candidateId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create experience');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating experience:', error);
      throw error;
    }
  }

  async updateExperience(candidateId: number, experienceId: number, experience: ExperienceFormData): Promise<Experience> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/experiences/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...experience,
          candidateId: candidateId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update experience');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  }

  async deleteExperience(candidateId: number, experienceId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidates/${candidateId}/experiences/${experienceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete experience');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }
}

export const experienceService = new ExperienceService(); 