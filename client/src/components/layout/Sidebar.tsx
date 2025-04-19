import { Link, useLocation } from "wouter";
import { HomeIcon, UserPlusIcon, BriefcaseIcon, MessageSquareIcon, BellIcon, UserIcon, FileTextIcon, SettingsIcon, BookmarkIcon, Layout, PlusCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  const MenuItem = ({ 
    icon, 
    label, 
    href, 
    notifications,
    description
  }: { 
    icon: React.ReactNode, 
    label: string, 
    href: string,
    notifications?: number,
    description?: string
  }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <a className={cn(
          "flex items-center px-3 py-2.5 rounded-md transition-all duration-200",
          isActive 
            ? "bg-[#0A77FF]/10 text-[#0A77FF]" 
            : "text-neutral-700 hover:bg-neutral-100"
        )}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center mr-3">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{label}</span>
              {notifications && notifications > 0 && (
                <Badge className="bg-[#0A77FF] hover:bg-[#0A77FF] text-white ml-2 text-[10px]">
                  {notifications}
                </Badge>
              )}
            </div>
            {description && (
              <span className="text-xs text-neutral-500 mt-0.5 block">
                {description}
              </span>
            )}
          </div>
        </a>
      </Link>
    );
  };

  return (
    <div className="w-64 h-full bg-white border-r border-neutral-200 flex flex-col">
      {/* User profile section */}
      <div className="p-3 border-b border-neutral-200">
        <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-50 transition-colors">
          <Avatar className="h-12 w-12 border">
            <AvatarImage 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" 
              alt="User profile" 
            />
            <AvatarFallback className="bg-[#0A77FF]/10 text-[#0A77FF]">AJ</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm text-neutral-900">Alex Johnson</h3>
            <p className="text-xs text-neutral-500">Student</p>
          </div>
        </div>
        
        <div className="mt-3 py-2 border-t border-neutral-100">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-neutral-500">Profile views</span>
            <span className="text-xs font-medium text-neutral-800">42</span>
          </div>
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-neutral-500">Connection requests</span>
            <span className="text-xs font-medium text-[#0A77FF]">5 new</span>
          </div>
        </div>
      </div>
      
      {/* Navigation items */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          <MenuItem 
            icon={<HomeIcon className="h-5 w-5" />} 
            label="Home" 
            href="/" 
            description="News and updates"
          />
          <MenuItem 
            icon={<UserPlusIcon className="h-5 w-5" />} 
            label="My Network" 
            href="/network" 
            notifications={5}
            description="Grow your connections"
          />
          <MenuItem 
            icon={<BriefcaseIcon className="h-5 w-5" />} 
            label="Internships" 
            href="/internships"
            description="Find opportunities" 
          />
          <MenuItem 
            icon={<MessageSquareIcon className="h-5 w-5" />} 
            label="Messaging" 
            href="/messaging"
            notifications={3}
          />
          <MenuItem 
            icon={<BellIcon className="h-5 w-5" />} 
            label="Notifications" 
            href="/notifications" 
            notifications={5}
          />
          <MenuItem 
            icon={<BookmarkIcon className="h-5 w-5" />} 
            label="Saved Items" 
            href="/saved" 
          />
        </div>
        
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <h3 className="px-3 text-xs font-medium text-neutral-500 uppercase mb-3">
            Tools
          </h3>
          <div className="space-y-0.5">
            <MenuItem 
              icon={<FileTextIcon className="h-5 w-5" />} 
              label="CV Builder" 
              href="/cv-builder" 
              description="Create your resume"
            />
            <MenuItem 
              icon={<Layout className="h-5 w-5" />} 
              label="Portfolio" 
              href="/portfolio" 
              description="Showcase your work"
            />
            <MenuItem 
              icon={<SettingsIcon className="h-5 w-5" />} 
              label="Settings" 
              href="/settings" 
            />
          </div>
        </div>
      </div>
      
      {/* Create post button */}
      <div className="p-3 border-t border-neutral-200">
        <Button className="w-full bg-[#0A77FF] hover:bg-[#0A77FF]/90 text-white">
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
