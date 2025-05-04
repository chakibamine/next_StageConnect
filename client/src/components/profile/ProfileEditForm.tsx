import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  title: string;
  company: string;
  about: string;
  education: Array<{
    id: number;
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  profilePicture: string;
}

interface ProfileEditFormProps {
  tempProfile: ProfileData;
  setTempProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  handleCancelEditing: () => void;
  handleProfileUpdate: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  tempProfile, 
  setTempProfile, 
  handleCancelEditing, 
  handleProfileUpdate 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Edit Profile</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
          <Input 
            value={tempProfile.firstName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, firstName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
          <Input 
            value={tempProfile.lastName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, lastName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
          <Input 
            type="email"
            value={tempProfile.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, email: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
          <Input 
            value={tempProfile.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, phone: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Location</label>
          <Input 
            value={tempProfile.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, location: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
          <Input 
            value={tempProfile.website}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, website: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
          <Input 
            value={tempProfile.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, title: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Company/University</label>
          <Input 
            value={tempProfile.company}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTempProfile({...tempProfile, company: e.target.value})}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">About</label>
          <Textarea 
            rows={4}
            value={tempProfile.about}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTempProfile({...tempProfile, about: e.target.value})}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancelEditing}>
          Cancel
        </Button>
        <Button onClick={handleProfileUpdate}>
          Save Changes
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ProfileEditForm;