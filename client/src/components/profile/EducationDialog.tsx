import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationDialogProps {
  showEducationDialog: boolean;
  handleCloseEducationDialog: () => void;
  editingEducation: Education | null;
  tempEducation: Education | null;
  setTempEducation: React.Dispatch<React.SetStateAction<Education | null>>;
  handleSaveEducation: () => void;
}

const EducationDialog: React.FC<EducationDialogProps> = ({
  showEducationDialog,
  handleCloseEducationDialog,
  editingEducation,
  tempEducation,
  setTempEducation,
  handleSaveEducation
}) => (
  <Dialog open={showEducationDialog} onOpenChange={handleCloseEducationDialog}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{editingEducation?.id === 0 ? "Add Education" : "Edit Education"}</DialogTitle>
        <DialogDescription>
          {editingEducation?.id === 0 
            ? "Add details about your education background." 
            : "Edit your education information below."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="degree" className="text-sm font-medium">Degree</label>
          <Input
            id="degree"
            value={tempEducation?.degree || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempEducation(prev => prev ? {...prev, degree: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="institution" className="text-sm font-medium">Institution</label>
          <Input
            id="institution"
            value={tempEducation?.institution || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempEducation(prev => prev ? {...prev, institution: e.target.value} : null)
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
            <Input
              id="startDate"
              value={tempEducation?.startDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setTempEducation(prev => prev ? {...prev, startDate: e.target.value} : null)
              }
              placeholder="Sep 2020"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
            <Input
              id="endDate"
              value={tempEducation?.endDate || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setTempEducation(prev => prev ? {...prev, endDate: e.target.value} : null)
              }
              placeholder="Present"
            />
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
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCloseEducationDialog}>Cancel</Button>
        <Button onClick={handleSaveEducation}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EducationDialog;