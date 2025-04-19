import { useEffect } from "react";
import QuickActions from "@/components/dashboard/QuickActions";
import Feed from "@/components/dashboard/Feed";
import ProfileCard from "@/components/dashboard/ProfileCard";
import UpcomingInterviews from "@/components/dashboard/UpcomingInterviews";
import NetworkSuggestions from "@/components/dashboard/NetworkSuggestions";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCapIcon, BriefcaseIcon, ArrowUpRightIcon, TrendingUpIcon, BookOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Mock user data (this would come from the auth context in a real app)
  const userData = {
    firstName: "Alex",
    lastName: "Johnson",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    title: "Computer Science Student at Paris University",
    profileCompleteness: 85,
  };

  useEffect(() => {
    document.title = "Dashboard | StageConnect";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userData.firstName}!</h1>
          <p className="text-neutral-500">Your internship journey dashboard</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white">
            Find Internships
          </Button>
          <Button variant="outline" className="border-[#0A77FF] text-[#0A77FF] hover:bg-[#0A77FF]/5">
            Update Profile
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Applications</p>
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="h-3 w-3 mr-1" /> 
                  +2 this week
                </p>
              </div>
              <div className="p-3 bg-[#0A77FF]/10 text-[#0A77FF] rounded-full">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Interviews</p>
                <h3 className="text-2xl font-bold">2</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="h-3 w-3 mr-1" /> 
                  Next one in 2 days
                </p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <ArrowUpRightIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Applied Skills</p>
                <h3 className="text-2xl font-bold">24</h3>
                <p className="text-xs text-neutral-500 flex items-center mt-1">
                  Across 8 applications
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <GraduationCapIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Profile Views</p>
                <h3 className="text-2xl font-bold">156</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUpIcon className="h-3 w-3 mr-1" /> 
                  +12% from last week
                </p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <BookOpenIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <Feed />
        </div>
        
        <div className="space-y-6">
          <ProfileCard user={userData} />
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Your Journey Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Profile Completeness</span>
                    <span className="text-[#0A77FF] font-medium">{userData.profileCompleteness}%</span>
                  </div>
                  <Progress value={userData.profileCompleteness} className="h-2 bg-[#0A77FF]/10" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Applications</span>
                    <span className="text-[#0A77FF] font-medium">8/15</span>
                  </div>
                  <Progress value={53} className="h-2 bg-[#0A77FF]/10" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-600">Skills Verified</span>
                    <span className="text-[#0A77FF] font-medium">12/20</span>
                  </div>
                  <Progress value={60} className="h-2 bg-[#0A77FF]/10" />
                </div>
                
                <div className="pt-2">
                  <Button variant="link" className="h-auto p-0 text-[#0A77FF]">View detailed progress</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <UpcomingInterviews />
          <NetworkSuggestions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
