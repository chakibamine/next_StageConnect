import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, PrinterIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Education {
  id: number;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Skill {
  id: number;
  name: string;
}

interface CVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: Education[];
  skills: Skill[];
}

interface CVPreviewProps {
  cvData: CVData;
}

const CVPreview = ({ cvData }: CVPreviewProps) => {
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal' | 'creative'>('classic');

  const handleDownload = () => {
    toast({
      title: "Download initiated",
      description: "Your CV is being prepared for download.",
    });
    // In a real implementation, this would generate a PDF
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">CV Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 mb-4 min-h-[400px]">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-neutral-800">{cvData.firstName} {cvData.lastName}</h1>
            <p className="text-sm text-neutral-600">{cvData.location} • {cvData.email} • {cvData.phone}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm">{cvData.summary}</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1 mb-2">Education</h2>
            {cvData.education.map((edu) => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between">
                  <h3 className="text-sm font-semibold">{edu.degree}</h3>
                  <span className="text-xs text-neutral-600">{edu.startDate} - {edu.endDate}</span>
                </div>
                <p className="text-sm">{edu.institution}</p>
                <p className="text-xs text-neutral-600 mt-1">{edu.description}</p>
              </div>
            ))}
          </div>
          
          <div>
            <h2 className="text-sm font-bold uppercase text-neutral-500 border-b border-neutral-300 pb-1 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill) => (
                <span key={skill.id} className="text-xs bg-neutral-200 px-2 py-1 rounded">{skill.name}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Template Style</h3>
          <div className="flex space-x-3">
            <button 
              className={`w-12 h-12 rounded-lg ${
                template === 'classic' 
                  ? 'border-2 border-primary-500' 
                  : 'border border-neutral-300'
              } bg-white`}
              onClick={() => setTemplate('classic')}
            ></button>
            <button 
              className={`w-12 h-12 rounded-lg ${
                template === 'modern' 
                  ? 'border-2 border-primary-500' 
                  : 'border border-neutral-300'
              } bg-neutral-100`}
              onClick={() => setTemplate('modern')}
            ></button>
            <button 
              className={`w-12 h-12 rounded-lg ${
                template === 'minimal' 
                  ? 'border-2 border-primary-500' 
                  : 'border border-neutral-300'
              } bg-neutral-800`}
              onClick={() => setTemplate('minimal')}
            ></button>
            <button 
              className={`w-12 h-12 rounded-lg ${
                template === 'creative' 
                  ? 'border-2 border-primary-500' 
                  : 'border border-neutral-300'
              } bg-gradient-to-r from-primary-500 to-purple-500`}
              onClick={() => setTemplate('creative')}
            ></button>
          </div>
          
          <div className="pt-4 flex space-x-4">
            <Button 
              className="flex-1"
              onClick={handleDownload}
            >
              <DownloadIcon className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-12 h-10"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CVPreview;
