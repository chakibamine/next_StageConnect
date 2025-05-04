import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExperienceDialog, ExperienceFormData } from './ExperienceDialog';
import { Experience } from '@/types/experience';
import { experienceService } from '@/services/experienceService';
import { BriefcaseIcon, PenIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ExperienceSectionProps {
  candidateId: number;
}

export function ExperienceSection({ candidateId }: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  const loadExperiences = async () => {
    try {
      const data = await experienceService.getExperienceList(candidateId);
      setExperiences(data);
    } catch (error) {
      console.error('Failed to load experiences:', error);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, [candidateId]);

  const handleAdd = () => {
    setSelectedExperience(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await experienceService.deleteExperience(candidateId, id);
      await loadExperiences();
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  const handleSave = async (formData: ExperienceFormData) => {
    try {
      if (selectedExperience) {
        await experienceService.updateExperience(candidateId, selectedExperience.id, formData);
      } else {
        await experienceService.createExperience(candidateId, { ...formData, candidateId });
      }
      await loadExperiences();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save experience:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Experience</h2>
        <Button onClick={handleAdd}>Add Experience</Button>
      </div>

      <div className="grid gap-4">
        {experiences.map((experience) => (
          <Card key={experience.id}>
            <CardHeader>
              <CardTitle>{experience.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="rounded-md bg-neutral-100 p-2 mr-4">
                    <BriefcaseIcon className="h-6 w-6 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{experience.company}</p>
                    <p className="text-sm text-gray-500">{experience.location}</p>
                    <p className="text-sm">
                      {format(new Date(experience.startDate), 'MMM yyyy')} - 
                      {experience.endDate ? format(new Date(experience.endDate), 'MMM yyyy') : 'Present'}
                    </p>
                    <p className="text-sm mt-2">{experience.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(experience)}>
                      <PenIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(experience.id)}>
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {experiences.length === 0 && (
          <div className="text-center py-4 text-neutral-500">
            No work experience added yet. Click 'Add' to include your work experience.
          </div>
        )}
      </div>

      <ExperienceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        experience={selectedExperience}
        onSave={handleSave}
      />
    </div>
  );
} 