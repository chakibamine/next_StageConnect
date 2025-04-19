import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ProfileCardProps {
  user: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    title: string;
    profileCompleteness: number;
  };
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-primary-500 to-purple-500"></div>
      <CardContent className="px-5 pb-5 relative">
        <div className="absolute -top-10 left-5">
          <Avatar className="h-20 w-20 border-4 border-white">
            <AvatarImage 
              src={user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80"} 
              alt={`${user.firstName} ${user.lastName}`} 
            />
            <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="pt-12">
          <h2 className="font-bold text-xl">{`${user.firstName} ${user.lastName}`}</h2>
          <p className="text-neutral-500 text-sm">{user.title}</p>
          
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-500">Profile completeness</span>
              <span className="text-primary-600 font-medium">{user.profileCompleteness}%</span>
            </div>
            <Progress value={user.profileCompleteness} className="h-2" />
            <Link href="/profile">
              <Button variant="link" className="mt-3 p-0 h-auto text-sm text-primary-600 font-medium hover:underline">
                Complete your profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
