import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLinkIcon } from "lucide-react";
import { format } from "date-fns";

interface Interview {
  id: number;
  position: string;
  company: string;
  date: Date;
  status: "upcoming" | "next-week" | "completed";
  link?: string;
}

const UpcomingInterviews = () => {
  const interviews: Interview[] = [
    {
      id: 1,
      position: "Frontend Developer Intern",
      company: "TechCorp",
      date: new Date("2023-05-15T10:00:00"),
      status: "upcoming",
      link: "https://meet.google.com/abc-defg-hij",
    },
    {
      id: 2,
      position: "UX Design Intern",
      company: "CreativeLab",
      date: new Date("2023-05-20T14:30:00"),
      status: "next-week",
    },
  ];

  const getStatusStyles = (status: Interview["status"]) => {
    switch (status) {
      case "upcoming":
        return "border-primary-500 bg-primary-100 text-primary-700";
      case "next-week":
        return "border-green-500 bg-green-100 text-green-700";
      case "completed":
        return "border-neutral-500 bg-neutral-100 text-neutral-700";
      default:
        return "border-neutral-500";
    }
  };

  const getStatusLabel = (status: Interview["status"]) => {
    switch (status) {
      case "upcoming":
        return "Tomorrow";
      case "next-week":
        return "Next week";
      case "completed":
        return "Completed";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {interviews.map((interview) => (
          <div 
            key={interview.id} 
            className={`border-l-4 ${getStatusStyles(interview.status)} pl-3 py-1`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{interview.position}</h3>
                <p className="text-sm text-neutral-500">{interview.company}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                interview.status === "upcoming" 
                  ? "bg-primary-100 text-primary-700" 
                  : interview.status === "next-week"
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-700"
              }`}>
                {getStatusLabel(interview.status)}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {format(interview.date, "MMM d, yyyy • h:mm a")}
            </p>
            <div className="mt-2 flex space-x-2">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <CalendarIcon className="h-3 w-3 mr-1" /> Add to calendar
              </Button>
              {interview.link && (
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <ExternalLinkIcon className="h-3 w-3 mr-1" /> Join meeting
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <Button variant="link" className="w-full text-sm text-primary-600 font-medium hover:underline">
          View all scheduled interviews
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpcomingInterviews;
