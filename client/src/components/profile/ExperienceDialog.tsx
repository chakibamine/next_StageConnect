import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Experience } from '@/types/experience';

export interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface ExperienceDialogProps {
  showExperienceDialog: boolean;
  handleCloseExperienceDialog: () => void;
  editingExperience: Experience | null;
  tempExperience: ExperienceFormData | null;
  setTempExperience: React.Dispatch<React.SetStateAction<ExperienceFormData | null>>;
  handleSaveExperience: () => Promise<void>;
}

const ExperienceDialog: React.FC<ExperienceDialogProps> = ({
  showExperienceDialog,
  handleCloseExperienceDialog,
  editingExperience,
  tempExperience,
  setTempExperience,
  handleSaveExperience
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!tempExperience?.title?.trim()) {
      newErrors.title = "Job title is required";
    }
    if (!tempExperience?.company?.trim()) {
      newErrors.company = "Company is required";
    }
    if (!tempExperience?.location?.trim()) {
      newErrors.location = "Location is required";
    }
    if (!tempExperience?.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (tempExperience?.startDate && tempExperience?.endDate && 
        new Date(tempExperience.startDate) > new Date(tempExperience.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSaveExperience();
      toast({
        title: `Experience ${editingExperience ? 'updated' : 'added'} successfully`,
        variant: "default"
      });
      handleCloseExperienceDialog();
    } catch (error) {
      console.error('Failed to save experience:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingExperience ? 'update' : 'add'} experience. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showExperienceDialog} onOpenChange={handleCloseExperienceDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{!editingExperience?.id ? "Add Experience" : "Edit Experience"}</DialogTitle>
          <DialogDescription>
            {!editingExperience?.id 
              ? "Add details about your work experience." 
              : "Edit your work experience information below."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Job Title</label>
            <div>
              <Input
                id="title"
                value={tempExperience?.title || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempExperience(prev => prev ? {...prev, title: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="company" className="text-sm font-medium">Company</label>
            <div>
              <Input
                id="company"
                value={tempExperience?.company || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempExperience(prev => prev ? {...prev, company: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.company ? "border-red-500" : ""}
              />
              {errors.company && <p className="text-sm text-red-500 mt-1">{errors.company}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <div>
              <Input
                id="location"
                value={tempExperience?.location || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempExperience(prev => prev ? {...prev, location: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
            <div>
              <Input
                id="startDate"
                type="date"
                value={tempExperience?.startDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempExperience(prev => prev ? {...prev, startDate: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
            <div>
              <Input
                id="endDate"
                type="date"
                value={tempExperience?.endDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempExperience(prev => prev ? {...prev, endDate: e.target.value || undefined} : null)
                }
                disabled={isSubmitting}
                className={errors.endDate ? "border-red-500" : ""}
                placeholder="Leave blank if current"
              />
              {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={tempExperience?.description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setTempExperience(prev => prev ? {...prev, description: e.target.value} : null)
              }
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseExperienceDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editingExperience ? 'Update' : 'Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceDialog;