import { useEffect } from "react";
import QuickActions from "@/components/dashboard/QuickActions";
import Feed from "@/components/dashboard/Feed";
import ProfileCard from "@/components/dashboard/ProfileCard";
import UpcomingInterviews from "@/components/dashboard/UpcomingInterviews";
import NetworkSuggestions from "@/components/dashboard/NetworkSuggestions";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Mock user data (this would come from the auth context in a real app)
  const userData = {
    firstName: "Alex",
    lastName: "Johnson",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
    title: "Computer Science Student at Paris University",
    profileCompleteness: 99,
  };

  useEffect(() => {
    document.title = "Dashboard | StageConnect";
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {userData.firstName}!</h1>
        <p className="text-neutral-500">Your internship journey dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <Feed />
        </div>
        
        <div className="space-y-6">
          <ProfileCard user={userData} />
          <UpcomingInterviews />
          <NetworkSuggestions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
