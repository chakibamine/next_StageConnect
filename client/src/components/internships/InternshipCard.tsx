import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, BookmarkIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { toast } from "@/hooks/use-toast";
import type { Internship } from "@shared/schema";

interface InternshipCardProps {
  internship: Internship;
}

const InternshipCard = ({ internship }: InternshipCardProps) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Added to saved",
      description: isSaved 
        ? "Internship removed from your saved list" 
        : "Internship saved to your profile",
    });
  };

  const formatApplicantsCount = (count: number) => {
    return count === 1 ? "1 applicant" : `${count} applicants`;
  };

  // Helper to safely format createdAt
  let postedString = "N/A";
  if (internship.createdAt) {
    const createdDate = new Date(internship.createdAt);
    if (!isNaN(createdDate.getTime())) {
      postedString = formatDistanceToNow(createdDate, { addSuffix: true });
    }
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="h-14 w-14 rounded-lg bg-neutral-100 flex items-center justify-center mr-4">
          <BuildingIcon className="h-6 w-6 text-neutral-500" />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <h3 className="font-semibold">{internship.title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className={isSaved ? "text-primary-600" : "text-neutral-400 hover:text-primary-600"}
              onClick={handleSave}
            >
              <BookmarkIcon className={isSaved ? "fill-primary-600" : ""} />
            </Button>
          </div>
          <p className="text-sm text-neutral-600">{internship.company} • {internship.location}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-primary-200">
              {internship.duration}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
              {internship.isPaid ? "Paid" : "Unpaid"}
            </Badge>
            <Badge variant="outline" className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300">
              {internship.workType}
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 mt-3 line-clamp-2">
            {internship.description}
          </p>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-neutral-500">
              Posted {postedString} • {formatApplicantsCount(Math.floor(Math.random() * 100))}
            </span>
            <Link href={`/internships/${internship.id}`}>
              <Button size="sm">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;
