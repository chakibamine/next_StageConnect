import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { XIcon, CropIcon, CheckIcon } from "lucide-react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  profilePicture: string | File | null;
}

interface ProfileEditFormProps {
  tempProfile: ProfileData;
  setTempProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  handleCancelEditing: () => void;
  handleProfileUpdate: () => void;
}

async function updateCandidateProfile(candidateId: number, profileData: ProfileData) {
  try {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const apiUrl = `${apiBaseUrl}/api/candidates/${candidateId}`;
    console.log("Full API URL:", apiUrl);

    // Create FormData object
    const formData = new FormData();
    
    // Add the file if it exists and is a File object
    if (profileData.profilePicture && profileData.profilePicture instanceof File) {
      formData.append('file', profileData.profilePicture);
    }

    // Create a copy of profileData without the profilePicture for JSON data
    const { profilePicture, ...profileDataWithoutFile } = profileData;
    
    // Add the rest of the data as a JSON string
    formData.append('data', new Blob([JSON.stringify({
      ...profileDataWithoutFile,
      // If profilePicture is a string (URL), include it as photo
      photo: typeof profilePicture === 'string' ? profilePicture : null,
      // Map company to companyOrUniversity for backend compatibility
      companyOrUniversity: profileData.company
    })], {
      type: 'application/json'
    }));

    const response = await fetch(apiUrl, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Accept': 'application/json',
      },
      body: formData
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Error response:", errorData);
      throw new Error(errorData?.message || "Failed to update profile");
    }

    const updatedProfile = await response.json();
    console.log("Updated profile:", updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      1
    );
  });
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ 
  tempProfile, 
  setTempProfile, 
  handleCancelEditing, 
  handleProfileUpdate 
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (20MB = 20 * 1024 * 1024 bytes)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 20MB",
          variant: "destructive",
        });
        return;
      }
      
      // Create a URL for the image
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setShowCropDialog(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) {
      return;
    }

    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const croppedFile = new File([croppedBlob], 'cropped_profile_picture.jpg', {
        type: 'image/jpeg'
      });
      setTempProfile({...tempProfile, profilePicture: croppedFile});
      setShowCropDialog(false);
      setTempImage(null);
    } catch (e) {
      console.error('Error cropping image:', e);
      toast({
        title: "Error",
        description: "Failed to crop image",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      console.log("Starting profile update for ID:", user.id);
      const updated = await updateCandidateProfile(user.id, tempProfile);
      if (updated) {
        console.log("Profile update successful");
        // Update the profile picture in tempProfile with the new URL from the server
        if (updated.photo) {
          setTempProfile(prev => ({
            ...prev,
            profilePicture: updated.photo
          }));
        }
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        handleProfileUpdate();
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Profile Picture</label>
              <div className="flex items-center space-x-4">
                {tempProfile.profilePicture && (
                  <div className="relative w-20 h-20">
                    <img 
                      src={typeof tempProfile.profilePicture === 'string' 
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${tempProfile.profilePicture}`
                        : URL.createObjectURL(tempProfile.profilePicture as File)}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => setTempProfile({...tempProfile, profilePicture: null})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Recommended size: 400x400 pixels. Max file size: 20MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelEditing}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          {tempImage && (
            <div className="mt-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={tempImage}
                  alt="Crop preview"
                  style={{ maxHeight: '400px' }}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCropDialog(false);
              setTempImage(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCropComplete}>
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileEditForm;