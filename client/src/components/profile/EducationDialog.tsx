import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Education, EducationFormData } from '../../types/education';

interface EducationDialogProps {
  showEducationDialog: boolean;
  handleCloseEducationDialog: () => void;
  editingEducation: Education | null;
  tempEducation: EducationFormData | null;
  setTempEducation: React.Dispatch<React.SetStateAction<EducationFormData | null>>;
  handleSaveEducation: () => Promise<void>;
}

const EducationDialog: React.FC<EducationDialogProps> = ({
  showEducationDialog,
  handleCloseEducationDialog,
  editingEducation,
  tempEducation,
  setTempEducation,
  handleSaveEducation
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!tempEducation?.degree?.trim()) {
      newErrors.degree = "Degree is required";
    }
    if (!tempEducation?.institution?.trim()) {
      newErrors.institution = "Institution is required";
    }
    if (!tempEducation?.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!tempEducation?.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (tempEducation?.startDate && tempEducation?.endDate && 
        new Date(tempEducation.startDate) > new Date(tempEducation.endDate)) {
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
      await handleSaveEducation();
      toast({
        title: `Education ${editingEducation ? 'updated' : 'added'} successfully`,
        variant: "default"
      });
      handleCloseEducationDialog();
    } catch (error) {
      console.error('Failed to save education:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingEducation ? 'update' : 'add'} education. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={showEducationDialog} onOpenChange={handleCloseEducationDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{!editingEducation?.id ? "Add Education" : "Edit Education"}</DialogTitle>
          <DialogDescription>
            {!editingEducation?.id 
              ? "Add details about your education background." 
              : "Edit your education information below."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="degree" className="text-sm font-medium">Degree</label>
            <div>
              <Input
                id="degree"
                value={tempEducation?.degree || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempEducation(prev => prev ? {...prev, degree: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.degree ? "border-red-500" : ""}
              />
              {errors.degree && <p className="text-sm text-red-500 mt-1">{errors.degree}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="institution" className="text-sm font-medium">Institution</label>
            <div>
              <Input
                id="institution"
                value={tempEducation?.institution || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setTempEducation(prev => prev ? {...prev, institution: e.target.value} : null)
                }
                disabled={isSubmitting}
                className={errors.institution ? "border-red-500" : ""}
              />
              {errors.institution && <p className="text-sm text-red-500 mt-1">{errors.institution}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
              <div>
                <Input
                  id="startDate"
                  type="date"
                  value={tempEducation?.startDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setTempEducation(prev => prev ? {...prev, startDate: e.target.value} : null)
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
                  value={tempEducation?.endDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setTempEducation(prev => prev ? {...prev, endDate: e.target.value} : null)
                  }
                  disabled={isSubmitting}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={tempEducation?.description || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setTempEducation(prev => prev ? {...prev, description: e.target.value} : null)
              }
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCloseEducationDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editingEducation ? 'Update' : 'Add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EducationDialog;