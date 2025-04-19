import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceDialogProps {
  showExperienceDialog: boolean;
  handleCloseExperienceDialog: () => void;
  editingExperience: Experience | null;
  tempExperience: Experience | null;
  setTempExperience: React.Dispatch<React.SetStateAction<Experience | null>>;
  handleSaveExperience: () => void;
}

const ExperienceDialog: React.FC<ExperienceDialogProps> = ({
  showExperienceDialog,
  handleCloseExperienceDialog,
  editingExperience,
  tempExperience,
  setTempExperience,
  handleSaveExperience
}) => (
  <Dialog open={showExperienceDialog} onOpenChange={handleCloseExperienceDialog}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{editingExperience?.id === 0 ? "Add Experience" : "Edit Experience"}</DialogTitle>
        <DialogDescription>
          {editingExperience?.id === 0 
            ? "Add details about your work experience." 
            : "Edit your work experience information below."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="title" className="text-sm font-medium">Job Title</label>
          <Input
            id="title"
            value={tempExperience?.title || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempExperience(prev => prev ? {...prev, title: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="company" className="text-sm font-medium">Company</label>
          <Input
            id="company"
            value={tempExperience?.company || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempExperience(prev => prev ? {...prev, company: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <Input
            id="location"
            value={tempExperience?.location || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempExperience(prev => prev ? {...prev, location: e.target.value} : null)
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="expStartDate" className="text-sm font-medium">Start Date</label>
            <Input
              id="expStartDate"
              value={tempExperience?.startDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setTempExperience(prev => prev ? {...prev, startDate: e.target.value} : null)
              }
              placeholder="Sep 2021"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="expEndDate" className="text-sm font-medium">End Date</label>
            <Input
              id="expEndDate"
              value={tempExperience?.endDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setTempExperience(prev => prev ? {...prev, endDate: e.target.value} : null)
              }
              placeholder="Present"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label htmlFor="expDescription" className="text-sm font-medium">Description</label>
          <Textarea
            id="expDescription"
            value={tempExperience?.description || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              setTempExperience(prev => prev ? {...prev, description: e.target.value} : null)
            }
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCloseExperienceDialog}>Cancel</Button>
        <Button onClick={handleSaveExperience}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ExperienceDialog;