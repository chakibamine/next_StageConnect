import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BuildingIcon, 
  MapPinIcon, 
  MailIcon, 
  PhoneIcon, 
  Globe, 
  CalendarIcon,
  Users2Icon,
  IndustryIcon,
  LandmarkIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

// Define company info interfaces
interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  location: string;
  description: string;
  logo: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CompanyProfileEditFormProps {
  tempCompany: CompanyInfo;
  setTempCompany: React.Dispatch<React.SetStateAction<CompanyInfo>>;
  tempContactInfo: ContactInfo;
  setTempContactInfo: React.Dispatch<React.SetStateAction<ContactInfo>>;
  handleCancelEditing: () => void;
  onProfileUpdate: () => void;
  profileId: string;
}

const CompanyProfileEditForm = ({
  tempCompany,
  setTempCompany,
  tempContactInfo,
  setTempContactInfo,
  handleCancelEditing,
  onProfileUpdate,
  profileId
}: CompanyProfileEditFormProps) => {
  
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/companies/${profileId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company data');
        }

        const data = await response.json();
        
        // Update company info
        setTempCompany({
          name: data.name,
          industry: data.industry,
          size: data.size,
          founded: data.foundedDate,
          website: data.website,
          location: data.location,
          description: data.description,
          logo: data.logo
        });

        // Update contact info
        setTempContactInfo({
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country
        });
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, [profileId, setTempCompany, setTempContactInfo]);

  // Industry options
  const industries = [
    "Software Development",
    "Information Technology",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Manufacturing",
    "E-commerce",
    "Marketing & Advertising",
    "Media & Entertainment",
    "Consulting"
  ];
  
  // Company size options
  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+"
  ];
  
  // Handle company info changes
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempCompany({
      ...tempCompany,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setTempCompany({
      ...tempCompany,
      [name]: value
    });
  };
  
  // Handle contact info changes
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempContactInfo({
      ...tempContactInfo,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/companies/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempCompany.name,
          industry: tempCompany.industry,
          size: tempCompany.size,
          foundedDate: tempCompany.founded,
          website: tempCompany.website,
          location: tempCompany.location,
          description: tempCompany.description,
          email: tempContactInfo.email,
          phone: tempContactInfo.phone,
          address: tempContactInfo.address,
          city: tempContactInfo.city,
          postalCode: tempContactInfo.postalCode,
          country: tempContactInfo.country
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update company profile');
      }

      // Call the parent's onProfileUpdate to update the UI
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating company profile:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={tempCompany.logo} alt={tempCompany.name} />
                <AvatarFallback><BuildingIcon className="h-12 w-12" /></AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium mb-2">Company Logo</h3>
                <Button variant="outline" size="sm">
                  Change Logo
                </Button>
              </div>
            </div>
            
            <div className="col-span-full">
              <Label htmlFor="name">Company Name</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <BuildingIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="name"
                  name="name"
                  value={tempCompany.name}
                  onChange={handleCompanyChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={tempCompany.industry} 
                onValueChange={(value) => handleSelectChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="size">Company Size</Label>
              <Select 
                value={tempCompany.size} 
                onValueChange={(value) => handleSelectChange("size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="founded">Founded</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <CalendarIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="founded"
                  name="founded"
                  value={tempCompany.founded}
                  onChange={handleCompanyChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <Globe className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="website"
                  name="website"
                  value={tempCompany.website}
                  onChange={handleCompanyChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <MapPinIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="location"
                  name="location"
                  value={tempCompany.location}
                  onChange={handleCompanyChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="col-span-full">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                name="description"
                value={tempCompany.description}
                onChange={handleCompanyChange}
                rows={5}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <MailIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="email"
                  name="email"
                  value={tempContactInfo.email}
                  onChange={handleContactChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <PhoneIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="phone"
                  name="phone"
                  value={tempContactInfo.phone}
                  onChange={handleContactChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="col-span-full">
              <Label htmlFor="address">Address</Label>
              <div className="flex mt-1.5">
                <div className="bg-muted p-2 rounded-l-md flex items-center">
                  <LandmarkIcon className="h-5 w-5 text-neutral-500" />
                </div>
                <Input
                  id="address"
                  name="address"
                  value={tempContactInfo.address}
                  onChange={handleContactChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={tempContactInfo.city}
                onChange={handleContactChange}
              />
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={tempContactInfo.postalCode}
                onChange={handleContactChange}
              />
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={tempContactInfo.country}
                onChange={handleContactChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancelEditing}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default CompanyProfileEditForm; 