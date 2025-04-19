import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
  url?: string;
}

interface CertificationDialogProps {
  showCertificationDialog: boolean;
  handleCloseCertificationDialog: () => void;
  editingCertification: Certification | null;
  tempCertification: Certification | null;
  setTempCertification: React.Dispatch<React.SetStateAction<Certification | null>>;
  handleSaveCertification: () => void;
}

const CertificationDialog: React.FC<CertificationDialogProps> = ({
  showCertificationDialog,
  handleCloseCertificationDialog,
  editingCertification,
  tempCertification,
  setTempCertification,
  handleSaveCertification
}) => (
  <Dialog open={showCertificationDialog} onOpenChange={handleCloseCertificationDialog}>
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{editingCertification?.id === 0 ? "Add Certification" : "Edit Certification"}</DialogTitle>
        <DialogDescription>
          {editingCertification?.id === 0 
            ? "Add details about your certification." 
            : "Edit your certification information below."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">Certificate Name</label>
          <Input
            id="name"
            value={tempCertification?.name || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempCertification(prev => prev ? {...prev, name: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="issuer" className="text-sm font-medium">Issuing Organization</label>
          <Input
            id="issuer"
            value={tempCertification?.issuer || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempCertification(prev => prev ? {...prev, issuer: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="date" className="text-sm font-medium">Issue Date</label>
          <Input
            id="date"
            value={tempCertification?.date || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempCertification(prev => prev ? {...prev, date: e.target.value} : null)
            }
            placeholder="Jan 2023"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="credentialId" className="text-sm font-medium">Credential ID</label>
          <Input
            id="credentialId"
            value={tempCertification?.credentialId || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempCertification(prev => prev ? {...prev, credentialId: e.target.value} : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="url" className="text-sm font-medium">Credential URL</label>
          <Input
            id="url"
            value={tempCertification?.url || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              setTempCertification(prev => prev ? {...prev, url: e.target.value} : null)
            }
            placeholder="https://example.com/credentials"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCloseCertificationDialog}>Cancel</Button>
        <Button onClick={handleSaveCertification}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default CertificationDialog;