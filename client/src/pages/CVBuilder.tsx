import { useEffect } from "react";
import CVGenerator from "@/components/cv/CVGenerator";

const CVBuilder = () => {
  useEffect(() => {
    document.title = "CV Builder | StageConnect";
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">CV Generator</h1>
        <p className="text-neutral-500">Create a professional CV to showcase your skills and experience</p>
      </div>
      
      <CVGenerator />
    </div>
  );
};

export default CVBuilder;
